import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PointsService } from './points.service';
import {
  mockUserPoints,
  mockUserPoints2,
  mockTransaction,
  mockCreditTransaction,
  mockDebitTransaction,
  mockPointsConfig,
} from '../../test/fixtures/points.fixtures';
import { mockUser, mockUser2 } from '../../test/fixtures/user.fixtures';
import { SummaryPeriod, TransactionTypeFilter } from './dto';

describe('PointsService', () => {
  let service: PointsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      userPoints: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        aggregate: vi.fn(),
      },
      pointTransaction: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        count: vi.fn(),
        groupBy: vi.fn(),
        aggregate: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      transferRecipient: {
        findMany: vi.fn(),
        upsert: vi.fn(),
      },
      pointsConfig: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    // Instantiate service directly with mock
    service = new PointsService(prisma);
  });

  // ==========================================
  // getBalance
  // ==========================================

  describe('getBalance', () => {
    it('should return existing balance for user with points', async () => {
      prisma.userPoints.findUnique.mockResolvedValue(mockUserPoints);

      const result = await service.getBalance('user-123');

      expect(result.balance).toBe(1000);
      expect(result.lifetimeEarned).toBe(5000);
      expect(result.lifetimeSpent).toBe(4000);
      expect(prisma.userPoints.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('should create new UserPoints record when none exists', async () => {
      const newUserPoints = {
        userId: 'new-user',
        balance: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0,
        updatedAt: new Date(),
      };
      prisma.userPoints.findUnique.mockResolvedValue(null);
      prisma.userPoints.create.mockResolvedValue(newUserPoints);

      await service.getBalance('new-user');

      expect(prisma.userPoints.create).toHaveBeenCalledWith({
        data: { userId: 'new-user' },
      });
    });

    it('should return correct balance structure', async () => {
      prisma.userPoints.findUnique.mockResolvedValue(mockUserPoints);

      const result = await service.getBalance('user-123');

      expect(result).toHaveProperty('balance');
      expect(result).toHaveProperty('lifetimeEarned');
      expect(result).toHaveProperty('lifetimeSpent');
      expect(result).toHaveProperty('lastTransactionAt');
    });
  });

  // ==========================================
  // getHistory
  // ==========================================

  describe('getHistory', () => {
    const mockTransactions = [mockTransaction, mockCreditTransaction, mockDebitTransaction];

    it('should return paginated transaction history', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue(mockTransactions);
      prisma.pointTransaction.count.mockResolvedValue(3);

      const result = await service.getHistory('user-123', {});

      expect(result.data).toHaveLength(3);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.perPage).toBe(20);
      expect(result.meta.totalCount).toBe(3);
    });

    it('should filter by type=CREDIT (amount > 0)', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([mockCreditTransaction]);
      prisma.pointTransaction.count.mockResolvedValue(1);

      await service.getHistory('user-123', { type: TransactionTypeFilter.CREDIT });

      expect(prisma.pointTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            amount: { gt: 0 },
          }),
        }),
      );
    });

    it('should filter by type=DEBIT (amount < 0)', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([mockDebitTransaction]);
      prisma.pointTransaction.count.mockResolvedValue(1);

      await service.getHistory('user-123', { type: TransactionTypeFilter.DEBIT });

      expect(prisma.pointTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            amount: { lt: 0 },
          }),
        }),
      );
    });

    it('should filter by source', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([mockTransaction]);
      prisma.pointTransaction.count.mockResolvedValue(1);

      await service.getHistory('user-123', { source: 'EVENT_CHECKIN' });

      expect(prisma.pointTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            source: 'EVENT_CHECKIN',
          }),
        }),
      );
    });

    it('should filter by date range (startDate only)', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);
      prisma.pointTransaction.count.mockResolvedValue(0);

      await service.getHistory('user-123', { startDate: '2024-01-01' });

      expect(prisma.pointTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: new Date('2024-01-01'),
            }),
          }),
        }),
      );
    });

    it('should filter by date range (both dates)', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);
      prisma.pointTransaction.count.mockResolvedValue(0);

      await service.getHistory('user-123', { startDate: '2024-01-01', endDate: '2024-01-31' });

      const callArgs = prisma.pointTransaction.findMany.mock.calls[0][0];
      expect(callArgs.where.createdAt.gte).toEqual(new Date('2024-01-01'));
      expect(callArgs.where.createdAt.lte).toBeDefined();
    });

    it('should return empty when no transactions match', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);
      prisma.pointTransaction.count.mockResolvedValue(0);

      const result = await service.getHistory('user-123', {});

      expect(result.data).toHaveLength(0);
      expect(result.meta.totalCount).toBe(0);
    });

    it('should handle pagination correctly', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([mockTransaction]);
      prisma.pointTransaction.count.mockResolvedValue(100);

      const result = await service.getHistory('user-123', { page: 3, perPage: 10 });

      expect(prisma.pointTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
      expect(result.meta.totalPages).toBe(10);
    });
  });

  // ==========================================
  // getSummary
  // ==========================================

  describe('getSummary', () => {
    const mockSummaryTransactions = [
      { ...mockTransaction, amount: 100, source: 'EVENT_CHECKIN' },
      { ...mockTransaction, amount: 50, source: 'STRAVA_ACTIVITY' },
      { ...mockTransaction, amount: -30, source: 'STORE_PURCHASE' },
    ];

    it('should return correct summary for MONTH period', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue(mockSummaryTransactions);

      const result = await service.getSummary('user-123', SummaryPeriod.MONTH);

      expect(result.period).toBe(SummaryPeriod.MONTH);
      expect(result.earned).toBe(150);
      expect(result.spent).toBe(30);
      expect(result.net).toBe(120);
    });

    it('should return correct summary for WEEK period', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);

      const result = await service.getSummary('user-123', SummaryPeriod.WEEK);

      expect(result.period).toBe(SummaryPeriod.WEEK);
      expect(result.earned).toBe(0);
      expect(result.spent).toBe(0);
    });

    it('should categorize by source correctly', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue(mockSummaryTransactions);

      const result = await service.getSummary('user-123', SummaryPeriod.MONTH);

      expect(result.bySource['EVENT_CHECKIN']).toBe(100);
      expect(result.bySource['STRAVA_ACTIVITY']).toBe(50);
      expect(result.byDestination['STORE_PURCHASE']).toBe(30);
    });

    it('should return date range in ISO format', async () => {
      prisma.pointTransaction.findMany.mockResolvedValue([]);

      const result = await service.getSummary('user-123', SummaryPeriod.TODAY);

      expect(result.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  // ==========================================
  // transferPoints
  // ==========================================

  describe('transferPoints', () => {
    it('should successfully transfer points between users', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser2);

      const mockTx = {
        userPoints: {
          findUnique: vi.fn()
            .mockResolvedValueOnce(mockUserPoints)
            .mockResolvedValueOnce(mockUserPoints2),
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn(),
        },
        pointTransaction: {
          create: vi.fn().mockResolvedValue({
            id: 'tx-new',
            createdAt: new Date(),
          }),
        },
        transferRecipient: {
          upsert: vi.fn().mockResolvedValue({}),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.transferPoints('user-123', 'user-456', 100);

      expect(result.amount).toBe(100);
      expect(result.recipient.id).toBe('user-456');
      expect(result.senderBalanceAfter).toBe(900);
    });

    it('should throw BadRequestException for self-transfer', async () => {
      await expect(
        service.transferPoints('user-123', 'user-123', 100),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for amount <= 0', async () => {
      await expect(
        service.transferPoints('user-123', 'user-456', 0),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.transferPoints('user-123', 'user-456', -50),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when recipient not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.transferPoints('user-123', 'non-existent', 100),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when insufficient balance', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser2);

      const mockTx = {
        userPoints: {
          findUnique: vi.fn().mockResolvedValue({ ...mockUserPoints, balance: 50 }),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      await expect(
        service.transferPoints('user-123', 'user-456', 100),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create receiver UserPoints if not exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser2);

      const mockTx = {
        userPoints: {
          findUnique: vi.fn()
            .mockResolvedValueOnce(mockUserPoints)
            .mockResolvedValueOnce(null),
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockResolvedValue({ userId: 'user-456', balance: 0 }),
        },
        pointTransaction: {
          create: vi.fn().mockResolvedValue({ id: 'tx-new', createdAt: new Date() }),
        },
        transferRecipient: {
          upsert: vi.fn().mockResolvedValue({}),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      await service.transferPoints('user-123', 'user-456', 100);

      expect(mockTx.userPoints.create).toHaveBeenCalledWith({
        data: { userId: 'user-456' },
      });
    });

    it('should return zero balance after full transfer', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser2);

      const mockTx = {
        userPoints: {
          findUnique: vi.fn()
            .mockResolvedValueOnce({ ...mockUserPoints, balance: 100 })
            .mockResolvedValueOnce(mockUserPoints2),
          update: vi.fn().mockResolvedValue({}),
        },
        pointTransaction: {
          create: vi.fn().mockResolvedValue({ id: 'tx-new', createdAt: new Date() }),
        },
        transferRecipient: {
          upsert: vi.fn().mockResolvedValue({}),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.transferPoints('user-123', 'user-456', 100);

      expect(result.senderBalanceAfter).toBe(0);
    });
  });

  // ==========================================
  // getRecentRecipients
  // ==========================================

  describe('getRecentRecipients', () => {
    it('should return recent recipients sorted by lastTransferAt', async () => {
      prisma.transferRecipient.findMany.mockResolvedValue([
        { recipientId: 'user-456', lastTransferAt: new Date('2024-06-01') },
      ]);
      prisma.user.findMany.mockResolvedValue([mockUser2]);

      const result = await service.getRecentRecipients('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-456');
      expect(result[0].name).toBe('Another User');
    });

    it('should return empty array when no recipients', async () => {
      prisma.transferRecipient.findMany.mockResolvedValue([]);

      const result = await service.getRecentRecipients('user-123');

      expect(result).toEqual([]);
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should handle missing user in userMap gracefully', async () => {
      prisma.transferRecipient.findMany.mockResolvedValue([
        { recipientId: 'deleted-user', lastTransferAt: new Date() },
      ]);
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.getRecentRecipients('user-123');

      expect(result[0].name).toBe('Usuário');
    });
  });

  // ==========================================
  // searchUsersForTransfer
  // ==========================================

  describe('searchUsersForTransfer', () => {
    it('should return users matching query (excludes current user)', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser2]);

      const result = await service.searchUsersForTransfer('user-123', 'Another');

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-456');
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: 'user-123' },
            status: 'ACTIVE',
          }),
        }),
      );
    });

    it('should return empty array when no matches', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.searchUsersForTransfer('user-123', 'NonExistent');

      expect(result).toEqual([]);
    });
  });

  // ==========================================
  // creditPoints
  // ==========================================

  describe('creditPoints', () => {
    it('should credit points to existing user', async () => {
      const mockTx = {
        userPoints: {
          findUnique: vi.fn().mockResolvedValue(mockUserPoints),
          update: vi.fn().mockResolvedValue({}),
        },
        pointTransaction: {
          create: vi.fn().mockResolvedValue({ id: 'tx-new', amount: 100 }),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.creditPoints('user-123', 100, 'EVENT_CHECKIN' as any, 'Test');

      expect(mockTx.userPoints.update).toHaveBeenCalled();
      expect(result.amount).toBe(100);
    });

    it('should create UserPoints for new user then credits', async () => {
      const mockTx = {
        userPoints: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ userId: 'new-user', balance: 0 }),
          update: vi.fn().mockResolvedValue({}),
        },
        pointTransaction: {
          create: vi.fn().mockResolvedValue({ id: 'tx-new' }),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      await service.creditPoints('new-user', 100, 'ADMIN_CREDIT' as any);

      expect(mockTx.userPoints.create).toHaveBeenCalledWith({
        data: { userId: 'new-user' },
      });
    });

    it('should throw BadRequestException for amount <= 0', async () => {
      await expect(
        service.creditPoints('user-123', 0, 'EVENT_CHECKIN' as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================================
  // debitPoints
  // ==========================================

  describe('debitPoints', () => {
    it('should debit points from user', async () => {
      const mockTx = {
        userPoints: {
          findUnique: vi.fn().mockResolvedValue(mockUserPoints),
          update: vi.fn().mockResolvedValue({}),
        },
        pointTransaction: {
          create: vi.fn().mockResolvedValue({ id: 'tx-new', amount: -100 }),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.debitPoints('user-123', 100, 'STORE_PURCHASE' as any, 'Test');

      expect(result.amount).toBe(-100);
    });

    it('should throw NotFoundException when user has no points', async () => {
      const mockTx = {
        userPoints: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      await expect(
        service.debitPoints('user-123', 100, 'STORE_PURCHASE' as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when insufficient balance', async () => {
      const mockTx = {
        userPoints: {
          findUnique: vi.fn().mockResolvedValue({ ...mockUserPoints, balance: 50 }),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      await expect(
        service.debitPoints('user-123', 100, 'STORE_PURCHASE' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for amount <= 0', async () => {
      await expect(
        service.debitPoints('user-123', 0, 'STORE_PURCHASE' as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================================
  // adminGrantPoints
  // ==========================================

  describe('adminGrantPoints', () => {
    it('should grant points and return response', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const mockTx = {
        userPoints: {
          findUnique: vi.fn().mockResolvedValue(mockUserPoints),
          update: vi.fn().mockResolvedValue({}),
        },
        pointTransaction: {
          create: vi.fn().mockResolvedValue({ id: 'tx-grant', createdAt: new Date() }),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));
      prisma.userPoints.findUnique.mockResolvedValue({ ...mockUserPoints, balance: 1100 });

      const result = await service.adminGrantPoints('admin-123', 'user-123', 100, 'Bônus');

      expect(result.amount).toBe(100);
      expect(result.grantedBy).toBe('admin-123');
      expect(result.userName).toBe('Test User');
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.adminGrantPoints('admin-123', 'non-existent', 100, 'Bônus'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================
  // adminDeductPoints
  // ==========================================

  describe('adminDeductPoints', () => {
    it('should deduct points and return response', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const mockTx = {
        userPoints: {
          findUnique: vi.fn().mockResolvedValue(mockUserPoints),
          update: vi.fn().mockResolvedValue({}),
        },
        pointTransaction: {
          create: vi.fn().mockResolvedValue({ id: 'tx-deduct', amount: -100, createdAt: new Date() }),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));
      prisma.userPoints.findUnique.mockResolvedValue({ ...mockUserPoints, balance: 900 });

      const result = await service.adminDeductPoints('admin-123', 'user-123', 100, 'Penalidade');

      expect(result.amount).toBe(100);
      expect(result.deductedBy).toBe('admin-123');
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.adminDeductPoints('admin-123', 'non-existent', 100, 'Penalidade'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================
  // adminRefundTransaction
  // ==========================================

  describe('adminRefundTransaction', () => {
    it('should refund credit transaction (subtracts points)', async () => {
      prisma.pointTransaction.findUnique.mockResolvedValue(mockCreditTransaction);
      prisma.pointTransaction.findFirst.mockResolvedValue(null);

      const mockTx = {
        userPoints: {
          findUnique: vi.fn().mockResolvedValue(mockUserPoints),
          update: vi.fn().mockResolvedValue({}),
        },
        pointTransaction: {
          create: vi.fn().mockResolvedValue({
            id: 'tx-refund',
            amount: -200,
            createdAt: new Date(),
          }),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.adminRefundTransaction('admin-123', 'tx-credit', 'Erro');

      expect(result.amount).toBe(200);
      expect(result.refundedBy).toBe('admin-123');
      expect(result.newBalance).toBe(800);
    });

    it('should refund debit transaction (adds points back)', async () => {
      prisma.pointTransaction.findUnique.mockResolvedValue(mockDebitTransaction);
      prisma.pointTransaction.findFirst.mockResolvedValue(null);

      const mockTx = {
        userPoints: {
          findUnique: vi.fn().mockResolvedValue(mockUserPoints),
          update: vi.fn().mockResolvedValue({}),
        },
        pointTransaction: {
          create: vi.fn().mockResolvedValue({
            id: 'tx-refund',
            amount: 150,
            createdAt: new Date(),
          }),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.adminRefundTransaction('admin-123', 'tx-debit', 'Erro');

      expect(result.newBalance).toBe(1150);
    });

    it('should throw NotFoundException when transaction not found', async () => {
      prisma.pointTransaction.findUnique.mockResolvedValue(null);

      await expect(
        service.adminRefundTransaction('admin-123', 'non-existent', 'Erro'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when already refunded', async () => {
      prisma.pointTransaction.findUnique.mockResolvedValue(mockCreditTransaction);
      prisma.pointTransaction.findFirst.mockResolvedValue({ id: 'existing-refund' });

      await expect(
        service.adminRefundTransaction('admin-123', 'tx-credit', 'Erro'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when refund causes negative balance', async () => {
      prisma.pointTransaction.findUnique.mockResolvedValue({
        ...mockCreditTransaction,
        amount: 2000,
      });
      prisma.pointTransaction.findFirst.mockResolvedValue(null);

      const mockTx = {
        userPoints: {
          findUnique: vi.fn().mockResolvedValue({ ...mockUserPoints, balance: 500 }),
        },
      };

      prisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      await expect(
        service.adminRefundTransaction('admin-123', 'tx-credit', 'Erro'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================================
  // getConfig
  // ==========================================

  describe('getConfig', () => {
    it('should return existing config', async () => {
      prisma.pointsConfig.findUnique.mockResolvedValue(mockPointsConfig);

      const result = await service.getConfig('assoc-1');

      expect(result.sources).toBeDefined();
      expect(result.strava).toBeDefined();
      expect(result.pointsToMoneyRate).toBeDefined();
    });

    it('should return default config when none exists', async () => {
      prisma.pointsConfig.findUnique.mockResolvedValue(null);

      const result = await service.getConfig('assoc-1');

      expect(result.sources).toHaveLength(3);
      expect(result.pointsToMoneyRate).toBe(0.5);
    });
  });

  // ==========================================
  // updateConfig
  // ==========================================

  describe('updateConfig', () => {
    it('should update existing config (upsert)', async () => {
      prisma.pointsConfig.upsert.mockResolvedValue({
        ...mockPointsConfig,
        checkInPoints: 100,
      });

      const result = await service.updateConfig('assoc-1', { checkInPoints: 100 });

      expect(result.updated).toBe(true);
      expect(prisma.pointsConfig.upsert).toHaveBeenCalled();
    });
  });

  // ==========================================
  // getReports
  // ==========================================

  describe('getReports', () => {
    const mockReportTransactions = [
      { ...mockTransaction, amount: 100, source: 'EVENT_CHECKIN', user: mockUser },
      { ...mockTransaction, amount: -50, source: 'STORE_PURCHASE', user: mockUser },
    ];

    it('should return correct aggregated report', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      prisma.pointTransaction.findMany.mockResolvedValue(mockReportTransactions);
      prisma.userPoints.aggregate.mockResolvedValue({
        _sum: { balance: 1000 },
        _count: { _all: 1 },
      });

      const result = await service.getReports('assoc-1', 'month' as any);

      expect(result.summary.totalEarned).toBe(100);
      expect(result.summary.totalSpent).toBe(50);
      expect(result.summary.totalInCirculation).toBe(1000);
    });

    it('should return top earners sorted correctly', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser, mockUser2]);
      prisma.pointTransaction.findMany.mockResolvedValue([
        { ...mockTransaction, amount: 200, userId: 'user-456', user: mockUser2 },
        { ...mockTransaction, amount: 100, userId: 'user-123', user: mockUser },
      ]);
      prisma.userPoints.aggregate.mockResolvedValue({
        _sum: { balance: 300 },
        _count: { _all: 2 },
      });

      const result = await service.getReports('assoc-1', 'month' as any);

      expect(result.topEarners[0].id).toBe('user-456');
      expect(result.topEarners[0].earned).toBe(200);
    });
  });
});
