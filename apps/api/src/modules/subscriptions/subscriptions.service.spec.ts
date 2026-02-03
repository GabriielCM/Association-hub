import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import {
  mockPlanBasic,
  mockPlanPremium,
  mockPlanInactive,
  mockUserSubscription,
  mockUserSubscriptionSuspended,
  mockSubscriptionHistory,
  DEFAULT_MUTATORS,
} from '../../test/fixtures/subscriptions.fixtures';
import { mockUser, mockUser2 } from '../../test/fixtures/user.fixtures';
import { ReportPeriod } from './dto';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      subscriptionPlan: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      userSubscription: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      subscriptionHistory: {
        findMany: vi.fn(),
        create: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    service = new SubscriptionsService(prisma);
  });

  // ==========================================
  // getPlans
  // ==========================================

  describe('getPlans', () => {
    it('should return active plans with user current subscription', async () => {
      prisma.subscriptionPlan.findMany.mockResolvedValue([mockPlanBasic, mockPlanPremium]);
      prisma.userSubscription.findUnique.mockResolvedValue({
        planId: 'plan-basic',
        status: 'ACTIVE',
      });

      const result = await service.getPlans('user-123', 'assoc-1');

      expect(result.plans).toHaveLength(2);
      expect(result.plans[0].priceMonthly).toBe(29.9); // cents to reais
      expect(result.currentSubscription?.planId).toBe('plan-basic');
    });

    it('should return null currentSubscription when none exists', async () => {
      prisma.subscriptionPlan.findMany.mockResolvedValue([mockPlanBasic]);
      prisma.userSubscription.findUnique.mockResolvedValue(null);

      const result = await service.getPlans('user-123', 'assoc-1');

      expect(result.currentSubscription).toBeNull();
    });

    it('should convert priceMonthly from cents to reais', async () => {
      prisma.subscriptionPlan.findMany.mockResolvedValue([mockPlanBasic]);
      prisma.userSubscription.findUnique.mockResolvedValue(null);

      const result = await service.getPlans('user-123', 'assoc-1');

      expect(result.plans[0].priceMonthly).toBe(29.9);
    });
  });

  // ==========================================
  // getPlanDetails
  // ==========================================

  describe('getPlanDetails', () => {
    it('should return plan details with benefits summary', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlanPremium);
      prisma.userSubscription.findUnique.mockResolvedValue(null);

      const result = await service.getPlanDetails('plan-premium', 'user-123');

      expect(result.id).toBe('plan-premium');
      expect(result.benefitsSummary).toBeDefined();
      expect(result.canSubscribe).toBe(true);
    });

    it('should throw NotFoundException when plan not found', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);

      await expect(
        service.getPlanDetails('non-existent', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should set canSubscribe based on isActive and isCurrent', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlanBasic);
      prisma.userSubscription.findUnique.mockResolvedValue({ planId: 'plan-basic' });

      const result = await service.getPlanDetails('plan-basic', 'user-123');

      expect(result.isCurrent).toBe(true);
      expect(result.canSubscribe).toBe(false);
    });
  });

  // ==========================================
  // getMySubscription
  // ==========================================

  describe('getMySubscription', () => {
    it('should return subscription with plan details', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(mockUserSubscription);

      const result = await service.getMySubscription('user-123');

      expect(result?.id).toBe('sub-123');
      expect(result?.plan.name).toBe('Plano Básico');
      expect(result?.status).toBe('ACTIVE');
    });

    it('should return null when no subscription', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);

      const result = await service.getMySubscription('user-123');

      expect(result).toBeNull();
    });
  });

  // ==========================================
  // subscribe
  // ==========================================

  describe('subscribe', () => {
    it('should create new subscription successfully', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlanBasic);

      const mockTx = {
        userSubscription: {
          delete: vi.fn(),
          create: vi.fn().mockResolvedValue({
            id: 'sub-new',
            userId: 'user-123',
            planId: 'plan-basic',
            status: 'ACTIVE',
            subscribedAt: new Date(),
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(),
          }),
        },
        subscriptionPlan: {
          update: vi.fn().mockResolvedValue({}),
        },
        subscriptionHistory: {
          create: vi.fn().mockResolvedValue({}),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.subscribe('user-123', 'plan-basic');

      expect(result.subscription.planId).toBe('plan-basic');
      expect(result.message).toContain('sucesso');
    });

    it('should throw BadRequestException if already active subscription', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        status: 'ACTIVE',
      });

      await expect(
        service.subscribe('user-123', 'plan-basic'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when plan not found', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);

      await expect(
        service.subscribe('user-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when plan is inactive', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlanInactive);

      await expect(
        service.subscribe('user-123', 'plan-inactive'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should delete old cancelled subscription before creating new', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        status: 'CANCELLED',
      });
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlanBasic);

      const mockTx = {
        userSubscription: {
          delete: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockResolvedValue({
            id: 'sub-new',
            planId: 'plan-basic',
            status: 'ACTIVE',
          }),
        },
        subscriptionPlan: { update: vi.fn() },
        subscriptionHistory: { create: vi.fn() },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      await service.subscribe('user-123', 'plan-basic');

      expect(mockTx.userSubscription.delete).toHaveBeenCalled();
    });

    it('should increment plan subscribersCount', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlanBasic);

      const mockTx = {
        userSubscription: {
          create: vi.fn().mockResolvedValue({ id: 'sub-new' }),
        },
        subscriptionPlan: {
          update: vi.fn().mockResolvedValue({}),
        },
        subscriptionHistory: { create: vi.fn() },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      await service.subscribe('user-123', 'plan-basic');

      expect(mockTx.subscriptionPlan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { subscribersCount: { increment: 1 } },
        }),
      );
    });
  });

  // ==========================================
  // changePlan
  // ==========================================

  describe('changePlan', () => {
    it('should change plan successfully', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        plan: mockPlanBasic,
      });
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlanPremium);

      const mockTx = {
        userSubscription: {
          update: vi.fn().mockResolvedValue({ id: 'sub-123', planId: 'plan-premium' }),
        },
        subscriptionPlan: {
          update: vi.fn().mockResolvedValue({}),
        },
        subscriptionHistory: { create: vi.fn() },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.changePlan('user-123', 'plan-premium');

      expect(result.newPlan.id).toBe('plan-premium');
      expect(result.previousPlan.id).toBe('plan-basic');
    });

    it('should throw BadRequestException if no active subscription', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);

      await expect(
        service.changePlan('user-123', 'plan-premium'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if same plan', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        planId: 'plan-basic',
        status: 'ACTIVE',
        plan: mockPlanBasic,
      });

      await expect(
        service.changePlan('user-123', 'plan-basic'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when new plan not found', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        plan: mockPlanBasic,
      });
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);

      await expect(
        service.changePlan('user-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when new plan inactive', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        plan: mockPlanBasic,
      });
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlanInactive);

      await expect(
        service.changePlan('user-123', 'plan-inactive'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should adjust subscribersCount on both plans', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        plan: mockPlanBasic,
      });
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlanPremium);

      const mockTx = {
        userSubscription: { update: vi.fn().mockResolvedValue({}) },
        subscriptionPlan: { update: vi.fn() },
        subscriptionHistory: { create: vi.fn() },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      await service.changePlan('user-123', 'plan-premium');

      expect(mockTx.subscriptionPlan.update).toHaveBeenCalledTimes(2);
    });
  });

  // ==========================================
  // cancel
  // ==========================================

  describe('cancel', () => {
    it('should cancel subscription successfully', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        plan: mockPlanBasic,
      });

      const mockTx = {
        userSubscription: {
          update: vi.fn().mockResolvedValue({
            id: 'sub-123',
            status: 'CANCELLED',
            cancelledAt: new Date(),
            currentPeriodEnd: new Date(),
          }),
        },
        subscriptionPlan: { update: vi.fn() },
        subscriptionHistory: { create: vi.fn() },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.cancel('user-123', 'Motivos pessoais');

      expect(result.subscription.status).toBe('CANCELLED');
      expect(result.message).toContain('cancelada');
    });

    it('should throw BadRequestException if no active subscription', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);

      await expect(
        service.cancel('user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should record cancel reason', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        plan: mockPlanBasic,
      });

      const mockTx = {
        userSubscription: {
          update: vi.fn().mockResolvedValue({ currentPeriodEnd: new Date() }),
        },
        subscriptionPlan: { update: vi.fn() },
        subscriptionHistory: { create: vi.fn() },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      await service.cancel('user-123', 'Motivos pessoais');

      expect(mockTx.userSubscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            cancelReason: 'Motivos pessoais',
          }),
        }),
      );
    });

    it('should decrement plan subscribersCount', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        plan: mockPlanBasic,
      });

      const mockTx = {
        userSubscription: { update: vi.fn().mockResolvedValue({ currentPeriodEnd: new Date() }) },
        subscriptionPlan: { update: vi.fn() },
        subscriptionHistory: { create: vi.fn() },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      await service.cancel('user-123');

      expect(mockTx.subscriptionPlan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { subscribersCount: { decrement: 1 } },
        }),
      );
    });
  });

  // ==========================================
  // getHistory
  // ==========================================

  describe('getHistory', () => {
    it('should return paginated history', async () => {
      prisma.subscriptionHistory.findMany.mockResolvedValue([mockSubscriptionHistory]);
      prisma.subscriptionHistory.count.mockResolvedValue(1);

      const result = await service.getHistory('user-123', 1, 20);

      expect(result.history).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should return empty history', async () => {
      prisma.subscriptionHistory.findMany.mockResolvedValue([]);
      prisma.subscriptionHistory.count.mockResolvedValue(0);

      const result = await service.getHistory('user-123', 1, 20);

      expect(result.history).toHaveLength(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  // ==========================================
  // getBenefits
  // ==========================================

  describe('getBenefits', () => {
    it('should return benefits for active subscription', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        plan: mockPlanPremium,
      });

      const result = await service.getBenefits('user-123');

      expect(result.hasSubscription).toBe(true);
      expect(result.planName).toBe('Plano Premium');
      expect(result.mutators).toEqual(mockPlanPremium.mutators);
    });

    it('should return default mutators when no subscription', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);

      const result = await service.getBenefits('user-123');

      expect(result.hasSubscription).toBe(false);
      expect(result.mutators).toEqual(DEFAULT_MUTATORS);
    });
  });

  // ==========================================
  // getAdminPlans
  // ==========================================

  describe('getAdminPlans', () => {
    it('should return all plans with stats', async () => {
      prisma.subscriptionPlan.findMany.mockResolvedValue([mockPlanBasic, mockPlanPremium]);

      const result = await service.getAdminPlans('assoc-1', true);

      expect(result.plans).toHaveLength(2);
      expect(result.stats.totalPlans).toBe(2);
      expect(result.stats.totalSubscribers).toBe(15);
    });

    it('should filter inactive when includeInactive=false', async () => {
      prisma.subscriptionPlan.findMany.mockResolvedValue([mockPlanBasic]);

      await service.getAdminPlans('assoc-1', false);

      expect(prisma.subscriptionPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { associationId: 'assoc-1', isActive: true },
        }),
      );
    });
  });

  // ==========================================
  // createPlan
  // ==========================================

  describe('createPlan', () => {
    it('should create plan successfully', async () => {
      prisma.subscriptionPlan.count.mockResolvedValue(2);
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);
      prisma.subscriptionPlan.create.mockResolvedValue({
        ...mockPlanBasic,
        id: 'plan-new',
      });

      const dto = {
        name: 'Novo Plano',
        description: 'Descrição do plano',
        priceMonthly: 3990,
      };

      const result = await service.createPlan('assoc-1', 'admin-123', dto);

      expect(result.plan.name).toBe('Plano Básico');
      expect(result.message).toContain('sucesso');
    });

    it('should throw BadRequestException when 3-plan limit reached', async () => {
      prisma.subscriptionPlan.count.mockResolvedValue(3);

      await expect(
        service.createPlan('assoc-1', 'admin-123', { name: 'Test', description: 'Test', priceMonthly: 1000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when name exists', async () => {
      prisma.subscriptionPlan.count.mockResolvedValue(1);
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlanBasic);

      await expect(
        service.createPlan('assoc-1', 'admin-123', { name: 'Plano Básico', description: 'Test', priceMonthly: 1000 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should use DEFAULT_MUTATORS when none provided', async () => {
      prisma.subscriptionPlan.count.mockResolvedValue(0);
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);
      prisma.subscriptionPlan.create.mockResolvedValue(mockPlanBasic);

      await service.createPlan('assoc-1', 'admin-123', {
        name: 'Test',
        description: 'Test desc',
        priceMonthly: 1000,
      });

      const createCall = prisma.subscriptionPlan.create.mock.calls[0][0];
      expect(createCall.data.mutators).toBeDefined();
    });
  });

  // ==========================================
  // updatePlan
  // ==========================================

  describe('updatePlan', () => {
    it('should update plan with partial data', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlanBasic);
      prisma.subscriptionPlan.update.mockResolvedValue({
        ...mockPlanBasic,
        name: 'Updated Name',
      });

      const result = await service.updatePlan('plan-basic', { name: 'Updated Name' });

      expect(result.affectedSubscribers).toBe(10);
    });

    it('should throw NotFoundException when plan not found', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePlan('non-existent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return affected subscribers count', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlanBasic);
      prisma.subscriptionPlan.update.mockResolvedValue(mockPlanBasic);

      const result = await service.updatePlan('plan-basic', { priceMonthly: 5000 });

      expect(result.affectedSubscribers).toBe(10);
    });
  });

  // ==========================================
  // deletePlan
  // ==========================================

  describe('deletePlan', () => {
    it('should soft delete (sets isActive=false)', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(mockPlanBasic);
      prisma.subscriptionPlan.update.mockResolvedValue({
        ...mockPlanBasic,
        isActive: false,
      });

      const result = await service.deletePlan('plan-basic');

      expect(result.isActive).toBe(false);
      expect(prisma.subscriptionPlan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isActive: false },
        }),
      );
    });

    it('should throw NotFoundException when plan not found', async () => {
      prisma.subscriptionPlan.findUnique.mockResolvedValue(null);

      await expect(
        service.deletePlan('non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================
  // getSubscribers
  // ==========================================

  describe('getSubscribers', () => {
    it('should return paginated subscribers', async () => {
      const mockSubs = [{
        id: 'sub-1',
        planId: 'plan-basic',
        status: 'ACTIVE',
        subscribedAt: new Date(),
        user: mockUser,
        plan: { id: 'plan-basic', name: 'Plano Básico' },
      }];

      prisma.userSubscription.findMany.mockResolvedValue(mockSubs);
      prisma.userSubscription.count.mockResolvedValue(1);

      const result = await service.getSubscribers('assoc-1', {});

      expect(result.subscribers).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by planId', async () => {
      prisma.userSubscription.findMany.mockResolvedValue([]);
      prisma.userSubscription.count.mockResolvedValue(0);

      await service.getSubscribers('assoc-1', { planId: 'plan-basic' });

      expect(prisma.userSubscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            planId: 'plan-basic',
          }),
        }),
      );
    });

    it('should filter by status', async () => {
      prisma.userSubscription.findMany.mockResolvedValue([]);
      prisma.userSubscription.count.mockResolvedValue(0);

      await service.getSubscribers('assoc-1', { status: 'active' as any });

      expect(prisma.userSubscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        }),
      );
    });

    it('should filter by search (name or email)', async () => {
      prisma.userSubscription.findMany.mockResolvedValue([]);
      prisma.userSubscription.count.mockResolvedValue(0);

      await service.getSubscribers('assoc-1', { search: 'john' });

      const findManyCall = prisma.userSubscription.findMany.mock.calls[0][0];
      expect(findManyCall.where.user.OR).toBeDefined();
    });
  });

  // ==========================================
  // suspendUser
  // ==========================================

  describe('suspendUser', () => {
    it('should suspend user subscription', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        plan: mockPlanBasic,
      });

      const mockTx = {
        userSubscription: {
          update: vi.fn().mockResolvedValue({
            id: 'sub-123',
            status: 'SUSPENDED',
            suspendedAt: new Date(),
          }),
        },
        subscriptionPlan: { update: vi.fn() },
        subscriptionHistory: { create: vi.fn() },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.suspendUser('admin-123', 'user-123', 'Violação');

      expect(result.subscription.status).toBe('SUSPENDED');
    });

    it('should throw NotFoundException when no subscription', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);

      await expect(
        service.suspendUser('admin-123', 'user-123', 'Reason'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when already suspended', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(mockUserSubscriptionSuspended);

      await expect(
        service.suspendUser('admin-123', 'user-456', 'Reason'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should decrement subscribersCount', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        plan: mockPlanBasic,
      });

      const mockTx = {
        userSubscription: { update: vi.fn().mockResolvedValue({}) },
        subscriptionPlan: { update: vi.fn() },
        subscriptionHistory: { create: vi.fn() },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      await service.suspendUser('admin-123', 'user-123', 'Reason');

      expect(mockTx.subscriptionPlan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { subscribersCount: { decrement: 1 } },
        }),
      );
    });
  });

  // ==========================================
  // activateUser
  // ==========================================

  describe('activateUser', () => {
    it('should reactivate suspended subscription', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscriptionSuspended,
        plan: mockPlanBasic,
      });

      const mockTx = {
        userSubscription: {
          update: vi.fn().mockResolvedValue({
            id: 'sub-suspended',
            status: 'ACTIVE',
          }),
        },
        subscriptionPlan: { update: vi.fn() },
        subscriptionHistory: { create: vi.fn() },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.activateUser('admin-123', 'user-456');

      expect(result.subscription.status).toBe('ACTIVE');
    });

    it('should throw NotFoundException when no subscription', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue(null);

      await expect(
        service.activateUser('admin-123', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when not suspended', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscription,
        status: 'ACTIVE',
        plan: mockPlanBasic,
      });

      await expect(
        service.activateUser('admin-123', 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should increment subscribersCount', async () => {
      prisma.userSubscription.findUnique.mockResolvedValue({
        ...mockUserSubscriptionSuspended,
        plan: mockPlanBasic,
      });

      const mockTx = {
        userSubscription: { update: vi.fn().mockResolvedValue({}) },
        subscriptionPlan: { update: vi.fn() },
        subscriptionHistory: { create: vi.fn() },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      await service.activateUser('admin-123', 'user-456');

      expect(mockTx.subscriptionPlan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { subscribersCount: { increment: 1 } },
        }),
      );
    });
  });

  // ==========================================
  // getReport
  // ==========================================

  describe('getReport', () => {
    it('should return correct report metrics', async () => {
      prisma.subscriptionPlan.findMany.mockResolvedValue([mockPlanBasic, mockPlanPremium]);
      prisma.userSubscription.findMany.mockResolvedValue([
        { status: 'ACTIVE' },
        { status: 'ACTIVE' },
        { status: 'SUSPENDED' },
      ]);
      prisma.subscriptionHistory.findMany.mockResolvedValue([
        { action: 'SUBSCRIBED' },
        { action: 'CANCELLED' },
      ]);

      const result = await service.getReport('assoc-1', ReportPeriod.THIRTY_DAYS);

      expect(result.summary.totalSubscribers).toBe(3);
      expect(result.summary.activeSubscribers).toBe(2);
      expect(result.summary.suspendedSubscribers).toBe(1);
      expect(result.summary.newThisPeriod).toBe(1);
      expect(result.summary.cancelledThisPeriod).toBe(1);
    });

    it('should calculate churn rate correctly', async () => {
      prisma.subscriptionPlan.findMany.mockResolvedValue([mockPlanBasic]);
      prisma.userSubscription.findMany.mockResolvedValue([
        { status: 'ACTIVE' },
        { status: 'ACTIVE' },
      ]);
      prisma.subscriptionHistory.findMany.mockResolvedValue([
        { action: 'CANCELLED' },
      ]);

      const result = await service.getReport('assoc-1', ReportPeriod.THIRTY_DAYS);

      expect(result.summary.churnRate).toBe(50);
    });
  });
});
