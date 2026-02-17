import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  BenefitsQueryDto,
  BenefitsSortBy,
  NearbyQueryDto,
  CreatePartnerDto,
  UpdatePartnerDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================================
  // USER ENDPOINTS - BENEFITS
  // ===========================================

  async listBenefits(associationId: string, userId: string, query: BenefitsQueryDto) {
    const { page = 1, perPage = 20, search, category, sortBy = BenefitsSortBy.NAME } = query;
    const skip = (page - 1) * perPage;

    // Get user subscription info for eligibility check
    const userSub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      select: { planId: true, status: true },
    });

    const isSubscriber = userSub?.status === 'ACTIVE';
    const userPlanId = isSubscriber ? userSub?.planId : undefined;

    // Build where clause
    const where: any = {
      associationId,
      isActive: true,
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (category) {
      where.category = { slug: category };
    }

    // Order by
    let orderBy: any = { name: 'asc' };
    if (sortBy === BenefitsSortBy.RECENT) {
      orderBy = { addedAt: 'desc' };
    }

    const [partners, total] = await Promise.all([
      this.prisma.partner.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              color: true,
            },
          },
        },
      }),
      this.prisma.partner.count({ where }),
    ]);

    // Check eligibility and format response
    const data = partners.map((partner) => {
      const isEligible = this.checkEligibility(
        partner.eligibleAudiences,
        partner.eligiblePlanIds,
        isSubscriber,
        userPlanId,
      );

      // Check if partner is new (added in last 7 days)
      const isNew = partner.isNew && this.isRecentlyAdded(partner.addedAt);

      // Only show if eligible or showLocked is true
      if (!isEligible && !partner.showLocked) {
        return null;
      }

      return {
        id: partner.id,
        name: partner.name,
        logoUrl: partner.logoUrl,
        bannerUrl: partner.bannerUrl,
        benefit: isEligible ? partner.benefit : 'Benefício exclusivo para assinantes',
        category: partner.category,
        isEligible,
        isNew,
        city: partner.city,
        state: partner.state,
      };
    }).filter(Boolean);

    return {
      data,
      meta: {
        currentPage: page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        totalCount: total,
      },
    };
  }

  async getPartnerDetails(partnerId: string, userId: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    if (!partner || !partner.isActive) {
      throw new NotFoundException('Parceiro não encontrado');
    }

    // Get user subscription info
    const userSub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      select: { planId: true, status: true },
    });

    const isSubscriber = userSub?.status === 'ACTIVE';
    const userPlanId = isSubscriber ? userSub?.planId : undefined;

    const isEligible = this.checkEligibility(
      partner.eligibleAudiences,
      partner.eligiblePlanIds,
      isSubscriber,
      userPlanId,
    );

    // Check if is open now
    const isOpenNow = this.checkIfOpenNow(partner.businessHours as Record<string, string> | null);

    return {
      id: partner.id,
      name: partner.name,
      logoUrl: partner.logoUrl,
      bannerUrl: partner.bannerUrl,
      benefit: isEligible ? partner.benefit : 'Benefício exclusivo para assinantes',
      instructions: isEligible ? partner.instructions : null,
      category: partner.category,
      address: {
        street: partner.street,
        city: partner.city,
        state: partner.state,
        zipCode: partner.zipCode,
        lat: partner.lat,
        lng: partner.lng,
      },
      contact: {
        phone: partner.phone,
        website: partner.website,
        instagram: partner.instagram,
        facebook: partner.facebook,
        whatsapp: partner.whatsapp,
      },
      businessHours: partner.businessHours,
      isOpenNow,
      isEligible,
      isNew: partner.isNew && this.isRecentlyAdded(partner.addedAt),
    };
  }

  async listCategories(associationId: string) {
    const categories = await this.prisma.partnerCategory.findMany({
      where: { associationId, isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        _count: {
          select: {
            partners: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    return {
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        color: cat.color,
        partnersCount: cat._count.partners,
      })),
    };
  }

  async getNearbyPartners(associationId: string, userId: string, query: NearbyQueryDto) {
    const { lat, lng, radius = 10, limit = 20 } = query;

    if (!lat || !lng) {
      return { data: [], message: 'Localização não fornecida' };
    }

    // Get user subscription
    const userSub = await this.prisma.userSubscription.findUnique({
      where: { userId },
      select: { planId: true, status: true },
    });

    const isSubscriber = userSub?.status === 'ACTIVE';
    const userPlanId = isSubscriber ? userSub?.planId : undefined;

    // Get all partners with coordinates
    const partners = await this.prisma.partner.findMany({
      where: {
        associationId,
        isActive: true,
        lat: { not: null },
        lng: { not: null },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
    });

    // Calculate distance and filter
    const nearbyPartners = partners
      .map((partner) => {
        const distance = this.calculateDistance(lat, lng, partner.lat!, partner.lng!);
        return { ...partner, distance };
      })
      .filter((p) => p.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return {
      data: nearbyPartners.map((partner) => {
        const isEligible = this.checkEligibility(
          partner.eligibleAudiences,
          partner.eligiblePlanIds,
          isSubscriber,
          userPlanId,
        );

        return {
          id: partner.id,
          name: partner.name,
          logoUrl: partner.logoUrl,
          benefit: isEligible ? partner.benefit : 'Benefício exclusivo',
          category: partner.category,
          distance: Math.round(partner.distance * 10) / 10, // 1 decimal
          isEligible,
          address: {
            street: partner.street,
            city: partner.city,
          },
        };
      }),
    };
  }

  // ===========================================
  // ADMIN ENDPOINTS - READ
  // ===========================================

  async listAdminPartners(associationId: string, query: BenefitsQueryDto) {
    const { page = 1, perPage = 20, search, category } = query;
    const skip = (page - 1) * perPage;

    const where: any = { associationId };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (category) {
      where.category = { slug: category };
    }

    const [partners, total, activeCount, newThisMonth, totalCategories] = await Promise.all([
      this.prisma.partner.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: perPage,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true, color: true },
          },
        },
      }),
      this.prisma.partner.count({ where }),
      this.prisma.partner.count({ where: { associationId, isActive: true } }),
      this.prisma.partner.count({
        where: {
          associationId,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      this.prisma.partnerCategory.count({ where: { associationId } }),
    ]);

    return {
      partners: partners.map((p) => ({
        id: p.id,
        name: p.name,
        logoUrl: p.logoUrl,
        benefit: p.benefit,
        category: p.category,
        city: p.city,
        state: p.state,
        isActive: p.isActive,
        isNew: p.isNew && this.isRecentlyAdded(p.addedAt),
        eligibleAudiences: p.eligibleAudiences,
        createdAt: p.createdAt,
      })),
      stats: {
        totalPartners: total,
        activePartners: activeCount,
        newThisMonth,
        totalCategories,
      },
      pagination: {
        page,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async listAdminCategories(associationId: string) {
    const categories = await this.prisma.partnerCategory.findMany({
      where: { associationId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        order: true,
        isActive: true,
        _count: { select: { partners: true } },
      },
    });

    return {
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        color: cat.color,
        order: cat.order,
        isActive: cat.isActive,
        partnersCount: cat._count.partners,
      })),
    };
  }

  async getAdminPartnerDetail(partnerId: string, associationId: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true, color: true },
        },
      },
    });

    if (!partner || partner.associationId !== associationId) {
      throw new NotFoundException('Parceiro não encontrado');
    }

    return {
      id: partner.id,
      name: partner.name,
      logoUrl: partner.logoUrl,
      bannerUrl: partner.bannerUrl,
      benefit: partner.benefit,
      instructions: partner.instructions,
      category: partner.category,
      address: {
        street: partner.street,
        city: partner.city,
        state: partner.state,
        zipCode: partner.zipCode,
        lat: partner.lat,
        lng: partner.lng,
      },
      contact: {
        phone: partner.phone,
        website: partner.website,
        instagram: partner.instagram,
        facebook: partner.facebook,
        whatsapp: partner.whatsapp,
      },
      businessHours: partner.businessHours,
      eligibleAudiences: partner.eligibleAudiences,
      eligiblePlanIds: partner.eligiblePlanIds,
      showLocked: partner.showLocked,
      isActive: partner.isActive,
      isNew: partner.isNew,
      createdAt: partner.createdAt,
    };
  }

  // ===========================================
  // ADMIN ENDPOINTS - WRITE
  // ===========================================

  async createPartner(associationId: string, dto: CreatePartnerDto) {
    // Verify category exists
    const category = await this.prisma.partnerCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category || category.associationId !== associationId) {
      throw new NotFoundException('Categoria não encontrada');
    }

    const partner = await this.prisma.partner.create({
      data: {
        associationId,
        categoryId: dto.categoryId,
        name: dto.name,
        logoUrl: dto.logoUrl,
        bannerUrl: dto.bannerUrl,
        benefit: dto.benefit,
        instructions: dto.instructions,
        street: dto.street,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        lat: dto.lat,
        lng: dto.lng,
        phone: dto.phone,
        website: dto.website,
        instagram: dto.instagram,
        facebook: dto.facebook,
        whatsapp: dto.whatsapp,
        businessHours: dto.businessHours,
        eligibleAudiences: dto.eligibleAudiences || ['ALL'],
        eligiblePlanIds: dto.eligiblePlanIds || [],
        showLocked: dto.showLocked ?? true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return partner;
  }

  async updatePartner(partnerId: string, associationId: string, dto: UpdatePartnerDto) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner || partner.associationId !== associationId) {
      throw new NotFoundException('Parceiro não encontrado');
    }

    // If changing category, verify it exists
    if (dto.categoryId) {
      const category = await this.prisma.partnerCategory.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category || category.associationId !== associationId) {
        throw new NotFoundException('Categoria não encontrada');
      }
    }

    const updated = await this.prisma.partner.update({
      where: { id: partnerId },
      data: {
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.name && { name: dto.name }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.bannerUrl !== undefined && { bannerUrl: dto.bannerUrl }),
        ...(dto.benefit && { benefit: dto.benefit }),
        ...(dto.instructions !== undefined && { instructions: dto.instructions }),
        ...(dto.street !== undefined && { street: dto.street }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.zipCode !== undefined && { zipCode: dto.zipCode }),
        ...(dto.lat !== undefined && { lat: dto.lat }),
        ...(dto.lng !== undefined && { lng: dto.lng }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.instagram !== undefined && { instagram: dto.instagram }),
        ...(dto.facebook !== undefined && { facebook: dto.facebook }),
        ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp }),
        ...(dto.businessHours !== undefined && { businessHours: dto.businessHours }),
        ...(dto.eligibleAudiences && { eligibleAudiences: dto.eligibleAudiences }),
        ...(dto.eligiblePlanIds && { eligiblePlanIds: dto.eligiblePlanIds }),
        ...(dto.showLocked !== undefined && { showLocked: dto.showLocked }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.isNew !== undefined && { isNew: dto.isNew }),
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return updated;
  }

  async deletePartner(partnerId: string, associationId: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner || partner.associationId !== associationId) {
      throw new NotFoundException('Parceiro não encontrado');
    }

    // Soft delete
    await this.prisma.partner.update({
      where: { id: partnerId },
      data: { isActive: false },
    });

    return { success: true };
  }

  // ===========================================
  // ADMIN ENDPOINTS - CATEGORIES
  // ===========================================

  async createCategory(associationId: string, dto: CreateCategoryDto) {
    // Check slug uniqueness
    const existing = await this.prisma.partnerCategory.findUnique({
      where: {
        associationId_slug: {
          associationId,
          slug: dto.slug,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Já existe uma categoria com este slug');
    }

    const category = await this.prisma.partnerCategory.create({
      data: {
        associationId,
        name: dto.name,
        slug: dto.slug,
        icon: dto.icon || 'gift',
        color: dto.color || '#6366F1',
        order: dto.order || 0,
      },
    });

    return category;
  }

  async updateCategory(categoryId: string, associationId: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.partnerCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.associationId !== associationId) {
      throw new NotFoundException('Categoria não encontrada');
    }

    const updated = await this.prisma.partnerCategory.update({
      where: { id: categoryId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.icon && { icon: dto.icon }),
        ...(dto.color && { color: dto.color }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    return updated;
  }

  // ===========================================
  // HELPERS
  // ===========================================

  private checkEligibility(
    eligibleAudiences: string[],
    eligiblePlanIds: string[],
    isSubscriber: boolean,
    userPlanId?: string,
  ): boolean {
    // ALL means everyone can access
    if (eligibleAudiences.includes('ALL')) {
      return true;
    }

    // Check subscriber status
    if (eligibleAudiences.includes('SUBSCRIBERS') && isSubscriber) {
      return true;
    }

    if (eligibleAudiences.includes('NON_SUBSCRIBERS') && !isSubscriber) {
      return true;
    }

    // Check specific plans
    if (eligibleAudiences.includes('SPECIFIC_PLANS') && userPlanId) {
      return eligiblePlanIds.includes(userPlanId);
    }

    return false;
  }

  private isRecentlyAdded(addedAt: Date): boolean {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return addedAt > sevenDaysAgo;
  }

  private checkIfOpenNow(businessHours: Record<string, string> | null): boolean | null {
    if (!businessHours) return null;

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[now.getDay()];
    const hours = businessHours[today];

    if (!hours || hours.toLowerCase() === 'fechado') {
      return false;
    }

    try {
      const [open, close] = hours.split('-');
      const [openHour, openMin] = open.split(':').map(Number);
      const [closeHour, closeMin] = close.split(':').map(Number);

      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;

      return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
    } catch {
      return null;
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
