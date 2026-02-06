import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PartnersService } from '../partners.service';

describe('PartnersService', () => {
  let service: PartnersService;
  let prisma: any;

  const mockCategory = {
    id: 'cat-1',
    associationId: 'assoc-1',
    name: 'Alimentação',
    slug: 'food',
    icon: '🍔',
    color: '#FF5722',
    order: 0,
    isActive: true,
  };

  const mockPartner = {
    id: 'partner-1',
    associationId: 'assoc-1',
    categoryId: 'cat-1',
    name: 'Pizzaria Bella',
    logoUrl: 'https://example.com/logo.png',
    bannerUrl: 'https://example.com/banner.png',
    benefit: '15% de desconto',
    instructions: 'Apresente a carteirinha',
    street: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    lat: -23.5505,
    lng: -46.6333,
    phone: '11999999999',
    website: 'https://pizzariabella.com',
    instagram: '@pizzariabella',
    facebook: null,
    whatsapp: '11999999999',
    businessHours: {
      monday: '11:00-23:00',
      tuesday: '11:00-23:00',
      wednesday: '11:00-23:00',
      thursday: '11:00-23:00',
      friday: '11:00-23:00',
      saturday: '11:00-23:00',
      sunday: '12:00-22:00',
    },
    eligibleAudiences: ['ALL'],
    eligiblePlanIds: [],
    showLocked: true,
    isActive: true,
    isNew: true,
    addedAt: new Date(),
    category: mockCategory,
  };

  beforeEach(() => {
    prisma = {
      partner: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      partnerCategory: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      userSubscription: {
        findUnique: vi.fn(),
      },
    };

    service = new PartnersService(prisma);
  });

  // ===========================================
  // listBenefits
  // ===========================================

  describe('listBenefits', () => {
    it('should return paginated list of partners', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.partner.findMany.mockResolvedValue([mockPartner]);
      prisma.partner.count.mockResolvedValue(1);

      const result = await service.listBenefits('assoc-1', 'user-123', {
        page: 1,
        perPage: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalCount).toBe(1);
    });

    it('should mark all users as eligible when eligibleAudiences is ALL', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.partner.findMany.mockResolvedValue([mockPartner]);
      prisma.partner.count.mockResolvedValue(1);

      const result = await service.listBenefits('assoc-1', 'user-123', {
        page: 1,
        perPage: 20,
      });

      expect(result.data[0]?.isEligible).toBe(true);
    });

    it('should filter by category slug', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.partner.findMany.mockResolvedValue([mockPartner]);
      prisma.partner.count.mockResolvedValue(1);

      await service.listBenefits('assoc-1', 'user-123', {
        page: 1,
        perPage: 20,
        category: 'food',
      });

      expect(prisma.partner.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { slug: 'food' },
          }),
        }),
      );
    });

    it('should search by partner name', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.partner.findMany.mockResolvedValue([mockPartner]);
      prisma.partner.count.mockResolvedValue(1);

      await service.listBenefits('assoc-1', 'user-123', {
        page: 1,
        perPage: 20,
        search: 'Pizzaria',
      });

      expect(prisma.partner.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: 'Pizzaria', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should hide benefit for non-eligible users when not showLocked', async () => {
      const partnerSubsOnly = {
        ...mockPartner,
        eligibleAudiences: ['SUBSCRIBERS'],
        showLocked: false,
      };

      prisma.userSubscription.findUnique.mockResolvedValue(null); // Non-subscriber
      prisma.partner.findMany.mockResolvedValue([partnerSubsOnly]);
      prisma.partner.count.mockResolvedValue(1);

      const result = await service.listBenefits('assoc-1', 'user-123', {
        page: 1,
        perPage: 20,
      });

      // Partner should be filtered out
      expect(result.data.filter(Boolean)).toHaveLength(0);
    });

    it('should mark subscriber as eligible for SUBSCRIBERS audience', async () => {
      const partnerSubsOnly = {
        ...mockPartner,
        eligibleAudiences: ['SUBSCRIBERS'],
      };

      prisma.userSubscription.findUnique.mockResolvedValue({ id: 'sub-1', status: 'ACTIVE', planId: 'plan-1' });
      prisma.partner.findMany.mockResolvedValue([partnerSubsOnly]);
      prisma.partner.count.mockResolvedValue(1);

      const result = await service.listBenefits('assoc-1', 'user-123', {
        page: 1,
        perPage: 20,
      });

      expect(result.data[0]?.isEligible).toBe(true);
    });

    it('should check specific plan eligibility (match)', async () => {
      const partnerPlanSpecific = {
        ...mockPartner,
        eligibleAudiences: ['SPECIFIC_PLANS'],
        eligiblePlanIds: ['plan-gold', 'plan-silver'],
      };

      prisma.userSubscription.findUnique.mockResolvedValue({ id: 'sub-1', planId: 'plan-gold', status: 'ACTIVE' });
      prisma.partner.findMany.mockResolvedValue([partnerPlanSpecific]);
      prisma.partner.count.mockResolvedValue(1);

      const result = await service.listBenefits('assoc-1', 'user-123', {
        page: 1,
        perPage: 20,
      });

      expect(result.data[0]?.isEligible).toBe(true);
    });

    it('should mark user ineligible when plan not in eligiblePlanIds', async () => {
      const partnerPlanSpecific = {
        ...mockPartner,
        eligibleAudiences: ['SPECIFIC_PLANS'],
        eligiblePlanIds: ['plan-gold'],
      };

      prisma.userSubscription.findUnique.mockResolvedValue({ id: 'sub-1', planId: 'plan-bronze', status: 'ACTIVE' });
      prisma.partner.findMany.mockResolvedValue([partnerPlanSpecific]);
      prisma.partner.count.mockResolvedValue(1);

      const result = await service.listBenefits('assoc-1', 'user-123', {
        page: 1,
        perPage: 20,
      });

      expect(result.data[0]?.isEligible).toBe(false);
    });

    it('should sort by name when sortBy is name', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.partner.findMany.mockResolvedValue([mockPartner]);
      prisma.partner.count.mockResolvedValue(1);

      await service.listBenefits('assoc-1', 'user-123', {
        page: 1,
        perPage: 20,
        sortBy: 'name' as any,
      });

      expect(prisma.partner.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        }),
      );
    });

    it('should sort by addedAt when sortBy is recent', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.partner.findMany.mockResolvedValue([mockPartner]);
      prisma.partner.count.mockResolvedValue(1);

      await service.listBenefits('assoc-1', 'user-123', {
        page: 1,
        perPage: 20,
        sortBy: 'recent' as any,
      });

      expect(prisma.partner.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { addedAt: 'desc' },
        }),
      );
    });
  });

  // ===========================================
  // getPartnerDetails
  // ===========================================

  describe('getPartnerDetails', () => {
    it('should return partner details with eligibility', async () => {
      prisma.partner.findUnique.mockResolvedValue(mockPartner);
      prisma.userSubscription.findUnique.mockResolvedValue(null);

      const result = await service.getPartnerDetails('partner-1', 'user-123');

      expect(result.id).toBe('partner-1');
      expect(result.name).toBe('Pizzaria Bella');
      expect(result.isEligible).toBe(true);
    });

    it('should throw NotFoundException for inactive partner', async () => {
      prisma.partner.findUnique.mockResolvedValue({
        ...mockPartner,
        isActive: false,
      });

      await expect(service.getPartnerDetails('partner-1', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for non-existent partner', async () => {
      prisma.partner.findUnique.mockResolvedValue(null);

      await expect(service.getPartnerDetails('invalid-id', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should hide instructions for non-eligible users', async () => {
      const partnerSubsOnly = {
        ...mockPartner,
        eligibleAudiences: ['SUBSCRIBERS'],
      };

      prisma.partner.findUnique.mockResolvedValue(partnerSubsOnly);
      prisma.userSubscription.findUnique.mockResolvedValue(null);

      const result = await service.getPartnerDetails('partner-1', 'user-123');

      expect(result.isEligible).toBe(false);
      expect(result.instructions).toBeNull();
      expect(result.benefit).toBe('Benefício exclusivo para assinantes');
    });
  });

  // ===========================================
  // listCategories
  // ===========================================

  describe('listCategories', () => {
    it('should return categories with partner count', async () => {
      prisma.partnerCategory.findMany.mockResolvedValue([
        {
          ...mockCategory,
          _count: { partners: 5 },
        },
      ]);

      const result = await service.listCategories('assoc-1');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].partnersCount).toBe(5);
    });
  });

  // ===========================================
  // getNearbyPartners
  // ===========================================

  describe('getNearbyPartners', () => {
    it('should return partners sorted by distance', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.partner.findMany.mockResolvedValue([mockPartner]);

      const result = await service.getNearbyPartners('assoc-1', 'user-123', {
        lat: -23.55,
        lng: -46.63,
        radius: 10,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].distance).toBeDefined();
    });

    it('should return empty when no location provided', async () => {
      const result = await service.getNearbyPartners('assoc-1', 'user-123', {
        radius: 10,
        limit: 20,
      });

      expect(result.data).toHaveLength(0);
      expect(result.message).toBe('Localização não fornecida');
    });

    it('should filter by radius', async () => {
      // Partner is at -23.5505, -46.6333
      // User is very far away
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.partner.findMany.mockResolvedValue([mockPartner]);

      const result = await service.getNearbyPartners('assoc-1', 'user-123', {
        lat: 0, // Very far
        lng: 0,
        radius: 1, // 1km radius
        limit: 20,
      });

      // Partner should be filtered out (too far)
      expect(result.data).toHaveLength(0);
    });
  });

  // ===========================================
  // createPartner (Admin)
  // ===========================================

  describe('createPartner', () => {
    it('should create partner successfully', async () => {
      prisma.partnerCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.partner.create.mockResolvedValue(mockPartner);

      const result = await service.createPartner('assoc-1', {
        categoryId: 'cat-1',
        name: 'Pizzaria Bella',
        benefit: '15% de desconto',
      });

      expect(result.name).toBe('Pizzaria Bella');
    });

    it('should throw NotFoundException for invalid category', async () => {
      prisma.partnerCategory.findUnique.mockResolvedValue(null);

      await expect(
        service.createPartner('assoc-1', {
          categoryId: 'invalid-cat',
          name: 'Test Partner',
          benefit: '10% off',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for category from different association', async () => {
      prisma.partnerCategory.findUnique.mockResolvedValue({
        ...mockCategory,
        associationId: 'other-assoc',
      });

      await expect(
        service.createPartner('assoc-1', {
          categoryId: 'cat-1',
          name: 'Test Partner',
          benefit: '10% off',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // updatePartner (Admin)
  // ===========================================

  describe('updatePartner', () => {
    it('should update partner successfully', async () => {
      prisma.partner.findUnique.mockResolvedValue(mockPartner);
      prisma.partnerCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.partner.update.mockResolvedValue({
        ...mockPartner,
        name: 'Pizzaria Bella Updated',
      });

      const result = await service.updatePartner('partner-1', 'assoc-1', {
        name: 'Pizzaria Bella Updated',
        categoryId: 'cat-1',
        benefit: '15% de desconto',
      });

      expect(result.name).toBe('Pizzaria Bella Updated');
    });

    it('should throw NotFoundException for non-existent partner', async () => {
      prisma.partner.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePartner('invalid-id', 'assoc-1', {
          name: 'Test',
          categoryId: 'cat-1',
          benefit: 'Benefit',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for partner from different association', async () => {
      prisma.partner.findUnique.mockResolvedValue({
        ...mockPartner,
        associationId: 'other-assoc',
      });

      await expect(
        service.updatePartner('partner-1', 'assoc-1', {
          name: 'Test',
          categoryId: 'cat-1',
          benefit: 'Benefit',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // deletePartner (Admin)
  // ===========================================

  describe('deletePartner', () => {
    it('should soft delete partner', async () => {
      prisma.partner.findUnique.mockResolvedValue(mockPartner);
      prisma.partner.update.mockResolvedValue({ ...mockPartner, isActive: false });

      const result = await service.deletePartner('partner-1', 'assoc-1');

      expect(result.success).toBe(true);
      expect(prisma.partner.update).toHaveBeenCalledWith({
        where: { id: 'partner-1' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException for non-existent partner', async () => {
      prisma.partner.findUnique.mockResolvedValue(null);

      await expect(service.deletePartner('invalid-id', 'assoc-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ===========================================
  // createCategory (Admin)
  // ===========================================

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      prisma.partnerCategory.findUnique.mockResolvedValue(null);
      prisma.partnerCategory.create.mockResolvedValue(mockCategory);

      const result = await service.createCategory('assoc-1', {
        name: 'Alimentação',
        slug: 'food',
      });

      expect(result.name).toBe('Alimentação');
      expect(result.slug).toBe('food');
    });

    it('should throw ConflictException for duplicate slug', async () => {
      prisma.partnerCategory.findUnique.mockResolvedValue(mockCategory);

      await expect(
        service.createCategory('assoc-1', {
          name: 'Alimentação',
          slug: 'food',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ===========================================
  // updateCategory (Admin)
  // ===========================================

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      prisma.partnerCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.partnerCategory.update.mockResolvedValue({
        ...mockCategory,
        name: 'Comida',
      });

      const result = await service.updateCategory('cat-1', 'assoc-1', {
        name: 'Comida',
      });

      expect(result.name).toBe('Comida');
    });

    it('should throw NotFoundException for non-existent category', async () => {
      prisma.partnerCategory.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCategory('invalid-id', 'assoc-1', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
