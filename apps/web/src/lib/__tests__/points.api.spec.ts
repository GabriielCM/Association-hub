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
  getConfig,
  updateConfig,
  grantPoints,
  deductPoints,
  refundTransaction,
  getReports,
  exportCsv,
} from '@/lib/api/points.api';
import { api } from '@/lib/api/client';

const mockConfig = {
  sources: [
    { type: 'EVENT_CHECKIN', label: 'Check-in', defaultPoints: 100, isActive: true },
  ],
  strava: { dailyLimitKm: 5, eligibleActivities: ['Run', 'Ride'] },
  pointsToMoneyRate: 100,
};

const mockReport = {
  period: 'month' as const,
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  summary: {
    totalInCirculation: 50000,
    totalEarned: 12000,
    totalSpent: 8000,
    totalUsersWithBalance: 150,
    totalTransactions: 500,
  },
  bySource: [],
  byDestination: [],
  topEarners: [],
};

const mockGrantResult = {
  transactionId: 'tx-1',
  userId: 'user-1',
  userName: 'John',
  amount: 500,
  newBalance: 2000,
  reason: 'Bonus',
  createdAt: new Date(),
};

describe('Points API (Web Admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConfig', () => {
    it('should fetch config and return data', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: mockConfig },
      });
      const result = await getConfig();
      expect(api.get).toHaveBeenCalledWith('/admin/points/config');
      expect(result).toEqual(mockConfig);
    });

    it('should throw on failure', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: false, error: { message: 'Unauthorized' } },
      });
      await expect(getConfig()).rejects.toThrow('Unauthorized');
    });

    it('should throw default message when no error details', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: false },
      });
      await expect(getConfig()).rejects.toThrow('Falha ao buscar configuração');
    });
  });

  describe('updateConfig', () => {
    it('should send config update and return updated config', async () => {
      vi.mocked(api.put).mockResolvedValueOnce({
        data: { success: true, data: mockConfig },
      });
      const data = { pointsToMoneyRate: 150 };
      const result = await updateConfig(data);
      expect(api.put).toHaveBeenCalledWith('/admin/points/config', data);
      expect(result).toEqual(mockConfig);
    });

    it('should throw on failure', async () => {
      vi.mocked(api.put).mockResolvedValueOnce({
        data: { success: false, error: { message: 'Validation error' } },
      });
      await expect(updateConfig({})).rejects.toThrow('Validation error');
    });
  });

  describe('grantPoints', () => {
    it('should call post and return result', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: true, data: mockGrantResult },
      });
      const data = { userId: 'user-1', amount: 500, reason: 'Bonus' };
      const result = await grantPoints(data);
      expect(api.post).toHaveBeenCalledWith('/admin/points/grant', data);
      expect(result).toEqual(mockGrantResult);
    });

    it('should throw on failure', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: false, error: { message: 'User not found' } },
      });
      await expect(
        grantPoints({ userId: 'invalid', amount: 100, reason: 'Test' })
      ).rejects.toThrow('User not found');
    });
  });

  describe('deductPoints', () => {
    it('should call post and return result', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: true, data: mockGrantResult },
      });
      const data = { userId: 'user-1', amount: 200, reason: 'Penalty' };
      const result = await deductPoints(data);
      expect(api.post).toHaveBeenCalledWith('/admin/points/deduct', data);
      expect(result).toEqual(mockGrantResult);
    });
  });

  describe('refundTransaction', () => {
    it('should call post with transaction ID', async () => {
      const mockRefund = {
        refundTransactionId: 'tx-refund-1',
        originalTransactionId: 'tx-1',
        amount: 100,
        userId: 'user-1',
        newBalance: 1600,
        reason: 'Error in original transaction',
        refundedBy: 'admin-1',
        createdAt: new Date(),
      };
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: true, data: mockRefund },
      });
      const result = await refundTransaction('tx-1', 'Error in original transaction');
      expect(api.post).toHaveBeenCalledWith('/admin/points/refund/tx-1', {
        reason: 'Error in original transaction',
      });
      expect(result).toEqual(mockRefund);
    });
  });

  describe('getReports', () => {
    it('should fetch reports with period', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: mockReport },
      });
      const result = await getReports('month');
      expect(api.get).toHaveBeenCalledWith('/admin/points/reports', {
        params: { period: 'month' },
      });
      expect(result).toEqual(mockReport);
    });

    it('should default to month period', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: mockReport },
      });
      await getReports();
      expect(api.get).toHaveBeenCalledWith('/admin/points/reports', {
        params: { period: 'month' },
      });
    });
  });

  describe('exportCsv', () => {
    it('should call get with correct params and responseType blob', async () => {
      const mockBlob = new Blob(['csv data']);
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockBlob });
      const result = await exportCsv('2026-01-01', '2026-01-31', 'credit');
      expect(api.get).toHaveBeenCalledWith('/admin/points/export', {
        params: { startDate: '2026-01-01', endDate: '2026-01-31', type: 'credit' },
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });
  });
});
