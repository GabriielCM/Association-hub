import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/services/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  api: { get: vi.fn(), post: vi.fn() },
}));

import { get, post } from '@/services/api/client';
import {
  getPlans,
  getPlanDetails,
  getMySubscription,
  subscribe,
  changePlan,
  cancelSubscription,
  getSubscriptionHistory,
  getBenefits,
} from '@/features/subscriptions/api/subscriptions.api';
import type { PlansListResponse, SubscriptionBenefits } from '@ahub/shared/types';

const mockPlansResponse: PlansListResponse = {
  plans: [
    {
      id: 'plan-1',
      name: 'Basic',
      description: 'Basic plan',
      priceMonthly: 19.9,
      displayOrder: 1,
      mutators: { points_events: 1, cashback: 5 },
    },
  ],
  currentSubscription: null,
};

const mockBenefits: SubscriptionBenefits = {
  hasSubscription: true,
  planName: 'Premium',
  mutators: { points_events: 2, cashback: 10 },
  hasVerifiedBadge: true,
};

describe('Subscriptions API (Mobile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPlans', () => {
    it('should call get with correct URL', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockPlansResponse);
      const result = await getPlans();
      expect(get).toHaveBeenCalledWith('/subscriptions/plans');
      expect(result).toEqual(mockPlansResponse);
    });
  });

  describe('getPlanDetails', () => {
    it('should call get with plan ID in URL', async () => {
      const mockPlan = { id: 'plan-1', name: 'Basic' };
      vi.mocked(get).mockResolvedValueOnce(mockPlan);
      const result = await getPlanDetails('plan-1');
      expect(get).toHaveBeenCalledWith('/subscriptions/plans/plan-1');
      expect(result).toEqual(mockPlan);
    });
  });

  describe('getMySubscription', () => {
    it('should call get with correct URL', async () => {
      vi.mocked(get).mockResolvedValueOnce(null);
      const result = await getMySubscription();
      expect(get).toHaveBeenCalledWith('/subscriptions/my');
      expect(result).toBeNull();
    });
  });

  describe('subscribe', () => {
    it('should call post with planId', async () => {
      const mockResult = { subscription: { id: 'sub-1' }, message: 'Subscribed!' };
      vi.mocked(post).mockResolvedValueOnce(mockResult);
      const result = await subscribe('plan-1');
      expect(post).toHaveBeenCalledWith('/subscriptions/subscribe', { planId: 'plan-1' });
      expect(result).toEqual(mockResult);
    });
  });

  describe('changePlan', () => {
    it('should call post with planId', async () => {
      const mockResult = {
        subscription: { id: 'sub-1' },
        previousPlan: { id: 'plan-1', name: 'Basic' },
        newPlan: { id: 'plan-2', name: 'Premium' },
        message: 'Changed!',
      };
      vi.mocked(post).mockResolvedValueOnce(mockResult);
      const result = await changePlan('plan-2');
      expect(post).toHaveBeenCalledWith('/subscriptions/change', { planId: 'plan-2' });
      expect(result).toEqual(mockResult);
    });
  });

  describe('cancelSubscription', () => {
    it('should call post with reason', async () => {
      const mockResult = { subscription: { id: 'sub-1', status: 'CANCELLED' }, message: 'Cancelled' };
      vi.mocked(post).mockResolvedValueOnce(mockResult);
      const result = await cancelSubscription('Too expensive');
      expect(post).toHaveBeenCalledWith('/subscriptions/cancel', { reason: 'Too expensive' });
      expect(result).toEqual(mockResult);
    });

    it('should call post without reason', async () => {
      const mockResult = { subscription: { id: 'sub-1' }, message: 'Cancelled' };
      vi.mocked(post).mockResolvedValueOnce(mockResult);
      await cancelSubscription();
      expect(post).toHaveBeenCalledWith('/subscriptions/cancel', { reason: undefined });
    });
  });

  describe('getSubscriptionHistory', () => {
    it('should call get with default pagination', async () => {
      const mockResult = { history: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      vi.mocked(get).mockResolvedValueOnce(mockResult);
      await getSubscriptionHistory();
      expect(get).toHaveBeenCalledWith('/subscriptions/history', { page: 1, limit: 20 });
    });

    it('should call get with custom pagination', async () => {
      const mockResult = { history: [], pagination: { page: 2, limit: 10, total: 0, totalPages: 0 } };
      vi.mocked(get).mockResolvedValueOnce(mockResult);
      await getSubscriptionHistory(2, 10);
      expect(get).toHaveBeenCalledWith('/subscriptions/history', { page: 2, limit: 10 });
    });
  });

  describe('getBenefits', () => {
    it('should call get with correct URL', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockBenefits);
      const result = await getBenefits();
      expect(get).toHaveBeenCalledWith('/subscriptions/benefits');
      expect(result).toEqual(mockBenefits);
    });
  });
});
