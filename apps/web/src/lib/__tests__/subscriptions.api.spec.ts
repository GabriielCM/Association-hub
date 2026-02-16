import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/api/client', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  return {
    api: mockApi,
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    default: mockApi,
  };
});

import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getSubscribers,
  suspendUser,
  activateUser,
  getReport,
} from '@/lib/api/subscriptions.api';
import { api } from '@/lib/api/client';

const mockPlan = {
  id: 'plan-1',
  name: 'Premium',
  description: 'Premium plan',
  priceMonthly: 29.9,
  displayOrder: 1,
  mutators: { points_events: 2, cashback: 10 },
  isActive: true,
  subscribersCount: 45,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPlansResponse = {
  plans: [mockPlan],
  stats: { totalPlans: 1, activePlans: 1, totalSubscribers: 45, monthlyRevenue: 1345.5 },
};

describe('Subscriptions API (Web Admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPlans', () => {
    it('should fetch plans and return data', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: mockPlansResponse },
      });
      const result = await getPlans();
      expect(api.get).toHaveBeenCalledWith('/admin/subscriptions/plans');
      expect(result).toEqual(mockPlansResponse);
    });

    it('should throw on failure', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: false, error: { message: 'Forbidden' } },
      });
      await expect(getPlans()).rejects.toThrow('Forbidden');
    });
  });

  describe('createPlan', () => {
    it('should send plan data and return result', async () => {
      const mockResult = { plan: mockPlan, message: 'Plano criado!' };
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: true, data: mockResult },
      });
      const data = {
        name: 'Premium',
        description: 'Premium plan with all benefits',
        priceMonthly: 29.9,
        color: '#FF5500',
        mutators: { points_events: 2 },
      };
      const result = await createPlan(data);
      expect(api.post).toHaveBeenCalledWith('/admin/subscriptions/plans', data);
      expect(result).toEqual(mockResult);
    });

    it('should throw on failure', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: false, error: { message: 'Max 3 active plans' } },
      });
      await expect(
        createPlan({ name: 'Test', description: 'Test plan test', priceMonthly: 10 })
      ).rejects.toThrow('Max 3 active plans');
    });
  });

  describe('updatePlan', () => {
    it('should send partial update and return result', async () => {
      const mockResult = { plan: mockPlan, message: 'Updated!' };
      vi.mocked(api.put).mockResolvedValueOnce({
        data: { success: true, data: mockResult },
      });
      const result = await updatePlan('plan-1', { name: 'Premium Plus' });
      expect(api.put).toHaveBeenCalledWith('/admin/subscriptions/plans/plan-1', {
        name: 'Premium Plus',
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('deletePlan', () => {
    it('should call delete with plan ID', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({
        data: { success: true },
      });
      await deletePlan('plan-1');
      expect(api.delete).toHaveBeenCalledWith('/admin/subscriptions/plans/plan-1');
    });

    it('should throw on failure', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({
        data: { success: false, error: { message: 'Plan has active subscribers' } },
      });
      await expect(deletePlan('plan-1')).rejects.toThrow('Plan has active subscribers');
    });
  });

  describe('getSubscribers', () => {
    it('should fetch subscribers with query params', async () => {
      const mockResult = {
        subscribers: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: mockResult },
      });
      const query = { page: 1, limit: 20, status: 'ACTIVE' };
      const result = await getSubscribers(query);
      expect(api.get).toHaveBeenCalledWith('/admin/subscriptions/subscribers', {
        params: query,
      });
      expect(result).toEqual(mockResult);
    });

    it('should work without query params', async () => {
      const mockResult = {
        subscribers: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: mockResult },
      });
      await getSubscribers();
      expect(api.get).toHaveBeenCalledWith('/admin/subscriptions/subscribers', {
        params: undefined,
      });
    });
  });

  describe('suspendUser', () => {
    it('should call post with userId and reason', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: true, data: { message: 'Suspended' } },
      });
      const result = await suspendUser('user-1', 'Policy violation');
      expect(api.post).toHaveBeenCalledWith(
        '/admin/subscriptions/users/user-1/suspend',
        { reason: 'Policy violation' }
      );
      expect(result.message).toBe('Suspended');
    });
  });

  describe('activateUser', () => {
    it('should call post with userId', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: true, data: { message: 'Activated' } },
      });
      const result = await activateUser('user-1');
      expect(api.post).toHaveBeenCalledWith(
        '/admin/subscriptions/users/user-1/activate'
      );
      expect(result.message).toBe('Activated');
    });
  });

  describe('getReport', () => {
    it('should fetch report with period', async () => {
      const mockReport = {
        summary: {
          totalSubscribers: 100,
          activeSubscribers: 80,
          suspendedSubscribers: 5,
          cancelledThisPeriod: 10,
          newThisPeriod: 15,
          netGrowth: 5,
          monthlyRevenue: 2000,
          churnRate: 10,
        },
        byPlan: [],
      };
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: mockReport },
      });
      const result = await getReport('30d');
      expect(api.get).toHaveBeenCalledWith('/admin/subscriptions/report', {
        params: { period: '30d' },
      });
      expect(result).toEqual(mockReport);
    });

    it('should default to 30d period', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: { summary: {}, byPlan: [] } },
      });
      await getReport();
      expect(api.get).toHaveBeenCalledWith('/admin/subscriptions/report', {
        params: { period: '30d' },
      });
    });
  });
});
