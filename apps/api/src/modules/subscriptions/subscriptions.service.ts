import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SubscriptionStatus, SubscriptionAction, Prisma } from '@prisma/client';
import {
  CreatePlanDto,
  UpdatePlanDto,
  MutatorsDto,
  DEFAULT_MUTATORS,
  SubscribersQueryDto,
  SubscriberStatus,
  ReportPeriod,
} from './dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // USER ENDPOINTS
  // ==========================================

  async getPlans(userId: string, associationId: string) {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { associationId, isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    const currentSubscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      select: { planId: true, status: true },
    });

    return {
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceMonthly: p.priceMonthly,
        iconUrl: p.iconUrl,
        color: p.color,
        displayOrder: p.displayOrder,
        mutators: p.mutators as MutatorsDto,
      })),
      currentSubscription: currentSubscription
        ? {
            planId: currentSubscription.planId,
            status: currentSubscription.status,
          }
        : null,
    };
  }

  async getPlanDetails(planId: string, userId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    const currentSubscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
    });

    const mutators = plan.mutators as MutatorsDto;

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      iconUrl: plan.iconUrl,
      color: plan.color,
      displayOrder: plan.displayOrder,
      mutators,
      benefitsSummary: this.generateBenefitsSummary(mutators),
      isCurrent: currentSubscription?.planId === planId,
      canSubscribe: plan.isActive && currentSubscription?.planId !== planId,
    };
  }

  async getMySubscription(userId: string) {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        color: subscription.plan.color,
        priceMonthly: subscription.plan.priceMonthly,
        mutators: subscription.plan.mutators as MutatorsDto,
      },
      status: subscription.status,
      subscribedAt: subscription.subscribedAt,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelledAt: subscription.cancelledAt,
      suspendedAt: subscription.suspendedAt,
    };
  }

  async subscribe(userId: string, planId: string) {
    // Check if user already has subscription
    const existingSubscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
    });

    if (existingSubscription && existingSubscription.status === 'ACTIVE') {
      throw new BadRequestException('Você já possui uma assinatura ativa');
    }

    // Get plan
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    if (!plan.isActive) {
      throw new ForbiddenException('Este plano não está disponível');
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    return this.prisma.$transaction(async (tx) => {
      // Delete old subscription if exists (cancelled/expired)
      if (existingSubscription) {
        await tx.userSubscription.delete({ where: { userId } });
      }

      // Create subscription
      const subscription = await tx.userSubscription.create({
        data: {
          userId,
          planId,
          status: 'ACTIVE',
          subscribedAt: now,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });

      // Update plan subscribers count
      await tx.subscriptionPlan.update({
        where: { id: planId },
        data: { subscribersCount: { increment: 1 } },
      });

      // Create history entry
      await tx.subscriptionHistory.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          planId,
          action: 'SUBSCRIBED',
          planName: plan.name,
          details: { price: plan.priceMonthly },
          performedBy: userId,
        },
      });

      return {
        subscription: {
          id: subscription.id,
          planId,
          status: subscription.status,
          subscribedAt: subscription.subscribedAt,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
        message: 'Assinatura ativada com sucesso!',
      };
    });
  }

  async changePlan(userId: string, newPlanId: string) {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new BadRequestException('Você não possui assinatura ativa');
    }

    if (subscription.planId === newPlanId) {
      throw new BadRequestException('Você já possui este plano');
    }

    const newPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      throw new NotFoundException('Plano não encontrado');
    }

    if (!newPlan.isActive) {
      throw new ForbiddenException('Este plano não está disponível');
    }

    return this.prisma.$transaction(async (tx) => {
      const oldPlanId = subscription.planId;
      const oldPlanName = subscription.plan.name;

      // Update subscription
      const updated = await tx.userSubscription.update({
        where: { userId },
        data: {
          planId: newPlanId,
        },
      });

      // Update subscribers count
      await tx.subscriptionPlan.update({
        where: { id: oldPlanId },
        data: { subscribersCount: { decrement: 1 } },
      });
      await tx.subscriptionPlan.update({
        where: { id: newPlanId },
        data: { subscribersCount: { increment: 1 } },
      });

      // Create history entry
      await tx.subscriptionHistory.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          planId: newPlanId,
          action: 'CHANGED',
          planName: newPlan.name,
          details: { price: newPlan.priceMonthly, previousPlan: oldPlanName },
          performedBy: userId,
        },
      });

      return {
        subscription: {
          id: updated.id,
          planId: newPlanId,
          status: updated.status,
          subscribedAt: updated.subscribedAt,
          changedAt: new Date(),
          currentPeriodEnd: updated.currentPeriodEnd,
        },
        previousPlan: {
          id: oldPlanId,
          name: oldPlanName,
        },
        newPlan: {
          id: newPlanId,
          name: newPlan.name,
        },
        message: 'Plano alterado com sucesso!',
      };
    });
  }

  async cancel(userId: string, reason?: string) {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new BadRequestException('Você não possui assinatura ativa');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.userSubscription.update({
        where: { userId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: reason,
        },
      });

      // Update subscribers count
      await tx.subscriptionPlan.update({
        where: { id: subscription.planId },
        data: { subscribersCount: { decrement: 1 } },
      });

      // Create history entry
      await tx.subscriptionHistory.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          planId: subscription.planId,
          action: 'CANCELLED',
          planName: subscription.plan.name,
          details: { reason },
          performedBy: userId,
        },
      });

      return {
        subscription: {
          id: updated.id,
          status: updated.status,
          cancelledAt: updated.cancelledAt,
          benefitsUntil: updated.currentPeriodEnd,
        },
        message: `Assinatura cancelada. Benefícios válidos até ${updated.currentPeriodEnd.toLocaleDateString('pt-BR')}.`,
      };
    });
  }

  async getHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      this.prisma.subscriptionHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.subscriptionHistory.count({ where: { userId } }),
    ]);

    return {
      history: history.map((h) => ({
        id: h.id,
        planName: h.planName,
        action: h.action.toLowerCase(),
        details: h.details,
        createdAt: h.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBenefits(userId: string) {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      return {
        hasSubscription: false,
        planName: null,
        mutators: DEFAULT_MUTATORS,
        hasVerifiedBadge: false,
      };
    }

    return {
      hasSubscription: true,
      planName: subscription.plan.name,
      mutators: subscription.plan.mutators as MutatorsDto,
      hasVerifiedBadge: subscription.plan.verifiedBadge,
    };
  }

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  async getAdminPlans(associationId: string, includeInactive: boolean) {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: includeInactive
        ? { associationId }
        : { associationId, isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    const stats = {
      totalPlans: plans.length,
      activePlans: plans.filter((p) => p.isActive).length,
      totalSubscribers: plans.reduce((sum, p) => sum + p.subscribersCount, 0),
      monthlyRevenue: plans.reduce(
        (sum, p) => sum + p.priceMonthly * p.subscribersCount,
        0,
      ),
    };

    return {
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceMonthly: p.priceMonthly,
        isActive: p.isActive,
        subscribersCount: p.subscribersCount,
        mutators: p.mutators,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      stats,
    };
  }

  async createPlan(associationId: string, createdBy: string, dto: CreatePlanDto) {
    // Check limit of 3 plans
    const existingCount = await this.prisma.subscriptionPlan.count({
      where: { associationId, isActive: true },
    });

    if (existingCount >= 3) {
      throw new BadRequestException('Limite de 3 planos ativos atingido');
    }

    // Check name uniqueness
    const existingName = await this.prisma.subscriptionPlan.findUnique({
      where: { associationId_name: { associationId, name: dto.name } },
    });

    if (existingName) {
      throw new ConflictException('Já existe um plano com este nome');
    }

    const mutatorsJson = dto.mutators
      ? JSON.parse(JSON.stringify(dto.mutators))
      : JSON.parse(JSON.stringify(DEFAULT_MUTATORS));

    const plan = await this.prisma.subscriptionPlan.create({
      data: {
        associationId,
        name: dto.name,
        description: dto.description,
        priceMonthly: dto.priceMonthly,
        iconUrl: dto.iconUrl,
        color: dto.color || '#6366F1',
        displayOrder: dto.displayOrder || 1,
        mutators: mutatorsJson,
        createdBy,
      },
    });

    return {
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        mutators: plan.mutators,
      },
      message: 'Plano criado com sucesso!',
    };
  }

  async updatePlan(planId: string, dto: UpdatePlanDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.priceMonthly !== undefined) updateData.priceMonthly = dto.priceMonthly;
    if (dto.iconUrl !== undefined) updateData.iconUrl = dto.iconUrl;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.displayOrder !== undefined) updateData.displayOrder = dto.displayOrder;
    if (dto.mutators !== undefined) updateData.mutators = dto.mutators;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const updated = await this.prisma.subscriptionPlan.update({
      where: { id: planId },
      data: updateData,
    });

    return {
      plan: {
        id: updated.id,
        name: updated.name,
        priceMonthly: updated.priceMonthly,
        mutators: updated.mutators,
      },
      affectedSubscribers: plan.subscribersCount,
      message: `Plano atualizado. ${plan.subscribersCount} assinantes afetados.`,
    };
  }

  async deletePlan(planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    await this.prisma.subscriptionPlan.update({
      where: { id: planId },
      data: { isActive: false },
    });

    return {
      planId,
      isActive: false,
      remainingSubscribers: plan.subscribersCount,
      message: `Plano desativado. ${plan.subscribersCount} assinantes manterão seus benefícios.`,
    };
  }

  async getSubscribers(associationId: string, query: SubscribersQueryDto) {
    const { planId, status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const userWhere: Prisma.UserWhereInput = { associationId };

    if (search) {
      userWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const where: Prisma.UserSubscriptionWhereInput = {
      user: userWhere,
    };

    if (planId) {
      where.planId = planId;
    }

    if (status) {
      where.status = status.toUpperCase() as SubscriptionStatus;
    }

    const [subscriptions, total] = await Promise.all([
      this.prisma.userSubscription.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          plan: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { subscribedAt: 'desc' },
      }),
      this.prisma.userSubscription.count({ where }),
    ]);

    return {
      subscribers: subscriptions.map((s) => ({
        user: {
          id: s.user.id,
          name: s.user.name,
          email: s.user.email,
          avatarUrl: s.user.avatarUrl,
        },
        subscription: {
          id: s.id,
          planId: s.planId,
          planName: s.plan.name,
          status: s.status.toLowerCase(),
          subscribedAt: s.subscribedAt,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async suspendUser(adminId: string, userId: string, reason: string) {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Usuário não possui assinatura');
    }

    if (subscription.status === 'SUSPENDED') {
      throw new BadRequestException('Assinatura já está suspensa');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.userSubscription.update({
        where: { userId },
        data: {
          status: 'SUSPENDED',
          suspendedAt: new Date(),
          suspendedBy: adminId,
          suspendReason: reason,
        },
      });

      // Update subscribers count
      await tx.subscriptionPlan.update({
        where: { id: subscription.planId },
        data: { subscribersCount: { decrement: 1 } },
      });

      // Create history entry
      await tx.subscriptionHistory.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          planId: subscription.planId,
          action: 'SUSPENDED',
          planName: subscription.plan.name,
          details: { reason },
          performedBy: adminId,
        },
      });

      return {
        subscription: {
          id: updated.id,
          status: updated.status,
          suspendedAt: updated.suspendedAt,
          suspendedBy: adminId,
          suspendReason: reason,
        },
        message: 'Assinatura suspensa com sucesso.',
      };
    });
  }

  async activateUser(adminId: string, userId: string) {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Usuário não possui assinatura');
    }

    if (subscription.status !== 'SUSPENDED') {
      throw new BadRequestException('Assinatura não está suspensa');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.userSubscription.update({
        where: { userId },
        data: {
          status: 'ACTIVE',
          suspendedAt: null,
          suspendedBy: null,
          suspendReason: null,
        },
      });

      // Update subscribers count
      await tx.subscriptionPlan.update({
        where: { id: subscription.planId },
        data: { subscribersCount: { increment: 1 } },
      });

      // Create history entry
      await tx.subscriptionHistory.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          planId: subscription.planId,
          action: 'REACTIVATED',
          planName: subscription.plan.name,
          details: {},
          performedBy: adminId,
        },
      });

      return {
        subscription: {
          id: updated.id,
          status: updated.status,
          reactivatedAt: new Date(),
        },
        message: 'Assinatura reativada com sucesso.',
      };
    });
  }

  async getReport(associationId: string, period: ReportPeriod) {
    const days = this.periodToDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all plans for association
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { associationId },
    });

    // Get subscriptions
    const subscriptions = await this.prisma.userSubscription.findMany({
      where: {
        plan: { associationId },
      },
    });

    const activeCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;
    const suspendedCount = subscriptions.filter((s) => s.status === 'SUSPENDED').length;

    // Get history for period
    const history = await this.prisma.subscriptionHistory.findMany({
      where: {
        plan: { associationId },
        createdAt: { gte: startDate },
      },
    });

    const newThisPeriod = history.filter((h) => h.action === 'SUBSCRIBED').length;
    const cancelledThisPeriod = history.filter((h) => h.action === 'CANCELLED').length;

    const monthlyRevenue = plans.reduce(
      (sum, p) => sum + p.priceMonthly * p.subscribersCount,
      0,
    );

    const churnRate = activeCount > 0 ? (cancelledThisPeriod / activeCount) * 100 : 0;

    return {
      summary: {
        totalSubscribers: subscriptions.length,
        activeSubscribers: activeCount,
        suspendedSubscribers: suspendedCount,
        cancelledThisPeriod,
        newThisPeriod,
        netGrowth: newThisPeriod - cancelledThisPeriod,
        monthlyRevenue,
        churnRate: Math.round(churnRate * 10) / 10,
      },
      byPlan: plans.map((p) => ({
        planId: p.id,
        planName: p.name,
        subscribers: p.subscribersCount,
        percentage: subscriptions.length > 0
          ? Math.round((p.subscribersCount / subscriptions.length) * 1000) / 10
          : 0,
        revenue: p.priceMonthly * p.subscribersCount,
      })),
    };
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private generateBenefitsSummary(mutators: MutatorsDto): string[] {
    const summary: string[] = [];

    if ((mutators.points_events ?? 1) > 1) {
      summary.push(`${mutators.points_events}x pontos em eventos`);
    }
    if ((mutators.points_strava ?? 1) > 1) {
      summary.push(`${mutators.points_strava}x pontos no Strava`);
    }
    if ((mutators.points_posts ?? 1) > 1) {
      summary.push(`${mutators.points_posts}x pontos no primeiro post do dia`);
    }
    if ((mutators.discount_store ?? 0) > 0) {
      summary.push(`${mutators.discount_store}% de desconto na Loja`);
    }
    if ((mutators.discount_pdv ?? 0) > 0) {
      summary.push(`${mutators.discount_pdv}% de desconto no PDV`);
    }
    if ((mutators.discount_spaces ?? 0) > 0) {
      summary.push(`${mutators.discount_spaces}% de desconto na locação de espaços`);
    }
    if ((mutators.cashback ?? 5) > 5) {
      summary.push(`${mutators.cashback}% de cashback em compras`);
    }

    summary.push('Verificado dourado no perfil');

    return summary;
  }

  private periodToDays(period: ReportPeriod): number {
    switch (period) {
      case ReportPeriod.SEVEN_DAYS:
        return 7;
      case ReportPeriod.THIRTY_DAYS:
        return 30;
      case ReportPeriod.NINETY_DAYS:
        return 90;
      case ReportPeriod.TWELVE_MONTHS:
        return 365;
      default:
        return 30;
    }
  }
}
