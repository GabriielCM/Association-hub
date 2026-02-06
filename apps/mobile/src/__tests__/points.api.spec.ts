import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the API client typed helpers
vi.mock('@/services/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  api: { get: vi.fn(), post: vi.fn() },
}));

import { get, post } from '@/services/api/client';
import {
  getBalance,
  getHistory,
  getSummary,
  transferPoints,
  getRecentRecipients,
  searchUsers,
} from '@/features/points/api/points.api';
import type { UserPoints, PointsSummary, TransferResult } from '@ahub/shared/types';

const mockBalance: UserPoints = {
  balance: 1500,
  lifetimeEarned: 5000,
  lifetimeSpent: 3500,
  lastTransactionAt: new Date(),
};

const mockSummary: PointsSummary = {
  period: 'month',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  earned: 1200,
  spent: 800,
  net: 400,
  bySource: { EVENT_CHECKIN: 500, STRAVA_RUN: 700 },
  byDestination: { PURCHASE_POINTS: 800 },
};

const mockTransferResult: TransferResult = {
  transactionId: 'tx-1',
  amount: 100,
  recipient: { id: 'user-2', name: 'Jane Doe' },
  senderBalanceAfter: 1400,
  createdAt: new Date(),
};

describe('Points API (Mobile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should call get with correct URL', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockBalance);
      const result = await getBalance();
      expect(get).toHaveBeenCalledWith('/points/balance');
      expect(result).toEqual(mockBalance);
    });
  });

  describe('getHistory', () => {
    it('should call get with filters', async () => {
      const mockHistory = { data: [], meta: { currentPage: 1, perPage: 20, totalPages: 0, totalCount: 0 } };
      vi.mocked(get).mockResolvedValueOnce(mockHistory);

      const filters = { page: 1, limit: 20, type: 'credit' as const };
      const result = await getHistory(filters);

      expect(get).toHaveBeenCalledWith('/points/history', filters);
      expect(result).toEqual(mockHistory);
    });

    it('should call get without filters', async () => {
      const mockHistory = { data: [], meta: { currentPage: 1, perPage: 20, totalPages: 0, totalCount: 0 } };
      vi.mocked(get).mockResolvedValueOnce(mockHistory);

      await getHistory();
      expect(get).toHaveBeenCalledWith('/points/history', undefined);
    });
  });

  describe('getSummary', () => {
    it('should call get with period param', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockSummary);
      const result = await getSummary('month');
      expect(get).toHaveBeenCalledWith('/points/summary', { period: 'month' });
      expect(result).toEqual(mockSummary);
    });

    it('should default to month period', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockSummary);
      await getSummary();
      expect(get).toHaveBeenCalledWith('/points/summary', { period: 'month' });
    });
  });

  describe('transferPoints', () => {
    it('should call post with transfer data', async () => {
      vi.mocked(post).mockResolvedValueOnce(mockTransferResult);
      const data = { recipientId: 'user-2', amount: 100, message: 'Thanks!' };
      const result = await transferPoints(data);
      expect(post).toHaveBeenCalledWith('/points/transfer', data);
      expect(result).toEqual(mockTransferResult);
    });

    it('should work without optional message', async () => {
      vi.mocked(post).mockResolvedValueOnce(mockTransferResult);
      const data = { recipientId: 'user-2', amount: 50 };
      await transferPoints(data);
      expect(post).toHaveBeenCalledWith('/points/transfer', data);
    });
  });

  describe('getRecentRecipients', () => {
    it('should call get with default limit', async () => {
      vi.mocked(get).mockResolvedValueOnce([]);
      await getRecentRecipients();
      expect(get).toHaveBeenCalledWith('/points/transfer/recent', { limit: 5 });
    });

    it('should call get with custom limit', async () => {
      vi.mocked(get).mockResolvedValueOnce([]);
      await getRecentRecipients(10);
      expect(get).toHaveBeenCalledWith('/points/transfer/recent', { limit: 10 });
    });
  });

  describe('searchUsers', () => {
    it('should call get with query params', async () => {
      vi.mocked(get).mockResolvedValueOnce([]);
      await searchUsers('João', 15);
      expect(get).toHaveBeenCalledWith('/points/transfer/search', { q: 'João', limit: 15 });
    });

    it('should default limit to 10', async () => {
      vi.mocked(get).mockResolvedValueOnce([]);
      await searchUsers('Maria');
      expect(get).toHaveBeenCalledWith('/points/transfer/search', { q: 'Maria', limit: 10 });
    });
  });
});
