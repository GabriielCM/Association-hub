import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SubscriptionsController,
  AdminSubscriptionsController,
} from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { mockJwtPayload, mockAdminJwtPayload } from '../../test/fixtures/user.fixtures';
import { ReportPeriod, SubscriberStatus } from './dto';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;
  let service: any;

  beforeEach(() => {
    service = {
      getPlans: vi.fn(),
      getPlanDetails: vi.fn(),
      getMySubscription: vi.fn(),
      subscribe: vi.fn(),
      changePlan: vi.fn(),
      cancel: vi.fn(),
      getHistory: vi.fn(),
      getBenefits: vi.fn(),
    };

    controller = new SubscriptionsController(service);
  });

  describe('getPlans', () => {
    it('should return plans for user association', async () => {
      const mockPlans = [{ id: 'plan-1', name: 'Basic' }];
      service.getPlans.mockResolvedValue(mockPlans);

      const result = await controller.getPlans(mockJwtPayload as any);

      expect(service.getPlans).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        mockJwtPayload.associationId,
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlans);
    });
  });

  describe('getPlanDetails', () => {
    it('should return plan details', async () => {
      const mockPlan = { id: 'plan-1', name: 'Basic', benefits: [] };
      service.getPlanDetails.mockResolvedValue(mockPlan);

      const result = await controller.getPlanDetails(
        mockJwtPayload as any,
        'plan-1',
      );

      expect(service.getPlanDetails).toHaveBeenCalledWith('plan-1', mockJwtPayload.sub);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlan);
    });
  });

  describe('getMySubscription', () => {
    it('should return user subscription', async () => {
      const mockSub = { id: 'sub-1', status: 'ACTIVE' };
      service.getMySubscription.mockResolvedValue(mockSub);

      const result = await controller.getMySubscription(mockJwtPayload as any);

      expect(service.getMySubscription).toHaveBeenCalledWith(mockJwtPayload.sub);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSub);
    });
  });

  describe('subscribe', () => {
    it('should create subscription', async () => {
      const mockSub = { id: 'sub-1', planId: 'plan-1', status: 'ACTIVE' };
      service.subscribe.mockResolvedValue(mockSub);

      const result = await controller.subscribe(mockJwtPayload as any, {
        planId: 'plan-1',
      });

      expect(service.subscribe).toHaveBeenCalledWith(mockJwtPayload.sub, 'plan-1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSub);
    });
  });

  describe('changePlan', () => {
    it('should change subscription plan', async () => {
      const mockSub = { id: 'sub-1', planId: 'plan-2', status: 'ACTIVE' };
      service.changePlan.mockResolvedValue(mockSub);

      const result = await controller.changePlan(mockJwtPayload as any, {
        planId: 'plan-2',
      });

      expect(service.changePlan).toHaveBeenCalledWith(mockJwtPayload.sub, 'plan-2');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSub);
    });
  });

  describe('cancel', () => {
    it('should cancel subscription', async () => {
      const mockSub = { id: 'sub-1', status: 'CANCELLED' };
      service.cancel.mockResolvedValue(mockSub);

      const result = await controller.cancel(mockJwtPayload as any, {
        reason: 'Too expensive',
      });

      expect(service.cancel).toHaveBeenCalledWith(mockJwtPayload.sub, 'Too expensive');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSub);
    });
  });

  describe('getHistory', () => {
    it('should return history with default pagination', async () => {
      const mockHistory = { items: [], total: 0 };
      service.getHistory.mockResolvedValue(mockHistory);

      const result = await controller.getHistory(mockJwtPayload as any, {});

      expect(service.getHistory).toHaveBeenCalledWith(mockJwtPayload.sub, 1, 20);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockHistory);
    });

    it('should pass custom pagination params', async () => {
      const mockHistory = { items: [], total: 0 };
      service.getHistory.mockResolvedValue(mockHistory);

      await controller.getHistory(mockJwtPayload as any, { page: 2, limit: 10 });

      expect(service.getHistory).toHaveBeenCalledWith(mockJwtPayload.sub, 2, 10);
    });
  });

  describe('getBenefits', () => {
    it('should return user benefits', async () => {
      const mockBenefits = {
        pointsMultiplier: 1.5,
        discounts: ['10% off'],
      };
      service.getBenefits.mockResolvedValue(mockBenefits);

      const result = await controller.getBenefits(mockJwtPayload as any);

      expect(service.getBenefits).toHaveBeenCalledWith(mockJwtPayload.sub);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBenefits);
    });
  });
});

describe('AdminSubscriptionsController', () => {
  let controller: AdminSubscriptionsController;
  let service: any;

  beforeEach(() => {
    service = {
      getAdminPlans: vi.fn(),
      createPlan: vi.fn(),
      updatePlan: vi.fn(),
      deletePlan: vi.fn(),
      getSubscribers: vi.fn(),
      suspendUser: vi.fn(),
      activateUser: vi.fn(),
      getReport: vi.fn(),
    };

    controller = new AdminSubscriptionsController(service);
  });

  describe('getPlans', () => {
    it('should return all plans including inactive by default', async () => {
      const mockPlans = [{ id: 'plan-1', isActive: true }];
      service.getAdminPlans.mockResolvedValue(mockPlans);

      const result = await controller.getPlans(mockAdminJwtPayload as any, true);

      expect(service.getAdminPlans).toHaveBeenCalledWith(
        mockAdminJwtPayload.associationId,
        true,
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlans);
    });

    it('should filter inactive plans when includeInactive is false', async () => {
      service.getAdminPlans.mockResolvedValue([]);

      await controller.getPlans(mockAdminJwtPayload as any, false);

      expect(service.getAdminPlans).toHaveBeenCalledWith(
        mockAdminJwtPayload.associationId,
        false,
      );
    });
  });

  describe('createPlan', () => {
    it('should create a new plan', async () => {
      const createDto = {
        name: 'Premium',
        description: 'Plano premium com benefícios exclusivos',
        priceMonthly: 4990,
        benefits: ['Benefit 1'],
      };
      const mockPlan = { id: 'plan-new', ...createDto };
      service.createPlan.mockResolvedValue(mockPlan);

      const result = await controller.createPlan(mockAdminJwtPayload as any, createDto);

      expect(service.createPlan).toHaveBeenCalledWith(
        mockAdminJwtPayload.associationId,
        mockAdminJwtPayload.sub,
        createDto,
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlan);
    });
  });

  describe('updatePlan', () => {
    it('should update an existing plan', async () => {
      const updateDto = { name: 'Premium Plus' };
      const mockPlan = { id: 'plan-1', name: 'Premium Plus' };
      service.updatePlan.mockResolvedValue(mockPlan);

      const result = await controller.updatePlan('plan-1', updateDto);

      expect(service.updatePlan).toHaveBeenCalledWith('plan-1', updateDto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlan);
    });
  });

  describe('deletePlan', () => {
    it('should soft delete a plan', async () => {
      const mockPlan = { id: 'plan-1', isActive: false };
      service.deletePlan.mockResolvedValue(mockPlan);

      const result = await controller.deletePlan('plan-1');

      expect(service.deletePlan).toHaveBeenCalledWith('plan-1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlan);
    });
  });

  describe('getSubscribers', () => {
    it('should return subscribers list with query params', async () => {
      const query = { status: SubscriberStatus.ACTIVE, planId: 'plan-1', page: 1, limit: 20 };
      const mockResult = { items: [], total: 0 };
      service.getSubscribers.mockResolvedValue(mockResult);

      const result = await controller.getSubscribers(mockAdminJwtPayload as any, query);

      expect(service.getSubscribers).toHaveBeenCalledWith(
        mockAdminJwtPayload.associationId,
        query,
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });
  });

  describe('suspendUser', () => {
    it('should suspend user subscription', async () => {
      const mockSub = { id: 'sub-1', status: 'SUSPENDED' };
      service.suspendUser.mockResolvedValue(mockSub);

      const result = await controller.suspendUser(
        mockAdminJwtPayload as any,
        'user-123',
        { reason: 'Payment failed' },
      );

      expect(service.suspendUser).toHaveBeenCalledWith(
        mockAdminJwtPayload.sub,
        'user-123',
        'Payment failed',
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSub);
    });
  });

  describe('activateUser', () => {
    it('should activate user subscription', async () => {
      const mockSub = { id: 'sub-1', status: 'ACTIVE' };
      service.activateUser.mockResolvedValue(mockSub);

      const result = await controller.activateUser(
        mockAdminJwtPayload as any,
        'user-123',
      );

      expect(service.activateUser).toHaveBeenCalledWith(
        mockAdminJwtPayload.sub,
        'user-123',
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSub);
    });
  });

  describe('getReport', () => {
    it('should return report with default period', async () => {
      const mockReport = { totalRevenue: 10000, activeSubscriptions: 50 };
      service.getReport.mockResolvedValue(mockReport);

      const result = await controller.getReport(mockAdminJwtPayload as any, {});

      expect(service.getReport).toHaveBeenCalledWith(
        mockAdminJwtPayload.associationId,
        ReportPeriod.THIRTY_DAYS,
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReport);
    });

    it('should pass custom period', async () => {
      const mockReport = { totalRevenue: 10000 };
      service.getReport.mockResolvedValue(mockReport);

      await controller.getReport(mockAdminJwtPayload as any, {
        period: ReportPeriod.NINETY_DAYS,
      });

      expect(service.getReport).toHaveBeenCalledWith(
        mockAdminJwtPayload.associationId,
        ReportPeriod.NINETY_DAYS,
      );
    });
  });
});
