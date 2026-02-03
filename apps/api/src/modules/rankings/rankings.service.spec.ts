import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RankingsService } from './rankings.service';
import { mockUser, mockUser2 } from '../../test/fixtures/user.fixtures';
import { mockUserPoints, mockUserPoints2 } from '../../test/fixtures/points.fixtures';
import { RankingPeriod } from './dto';

describe('RankingsService', () => {
  let service: RankingsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      user: {
        findMany: vi.fn(),
      },
      pointTransaction: {
        groupBy: vi.fn(),
      },
      stravaConnection: {
        findMany: vi.fn(),
      },
      stravaActivity: {
        groupBy: vi.fn(),
      },
    };

    service = new RankingsService(prisma);
  });

  // ==========================================
  // getPointsRanking
  // ==========================================

  describe('getPointsRanking', () => {
    const mockUsersWithPoints = [
      { ...mockUser, points: { lifetimeEarned: 5000 } },
      { ...mockUser2, points: { lifetimeEarned: 3000 } },
    ];

    it('should return ALL_TIME ranking using lifetimeEarned', async () => {
      prisma.user.findMany.mockResolvedValue(mockUsersWithPoints);

      const result = await service.getPointsRanking('user-123', 'assoc-1', RankingPeriod.ALL_TIME, 10);

      expect(result.type).toBe('points');
      expect(result.period).toBe(RankingPeriod.ALL_TIME);
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].value).toBe(5000);
      expect(result.entries[0].position).toBe(1);
    });

    it('should return MONTHLY ranking using transaction sums', async () => {
      const usersWithoutPoints = [
        { ...mockUser, points: null },
        { ...mockUser2, points: null },
      ];
      prisma.user.findMany.mockResolvedValue(usersWithoutPoints);
      prisma.pointTransaction.groupBy.mockResolvedValue([
        { userId: 'user-123', _sum: { amount: 200 } },
        { userId: 'user-456', _sum: { amount: 150 } },
      ]);

      const result = await service.getPointsRanking('user-123', 'assoc-1', RankingPeriod.MONTHLY, 10);

      expect(result.entries[0].value).toBe(200);
      expect(result.entries[1].value).toBe(150);
    });

    it('should return WEEKLY ranking using transaction sums', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      prisma.pointTransaction.groupBy.mockResolvedValue([
        { userId: 'user-123', _sum: { amount: 100 } },
      ]);

      const result = await service.getPointsRanking('user-123', 'assoc-1', RankingPeriod.WEEKLY, 10);

      expect(result.period).toBe(RankingPeriod.WEEKLY);
      expect(result.entries).toHaveLength(1);
    });

    it('should correctly identify current user position', async () => {
      prisma.user.findMany.mockResolvedValue(mockUsersWithPoints);

      const result = await service.getPointsRanking('user-456', 'assoc-1', RankingPeriod.ALL_TIME, 10);

      expect(result.currentUser?.position).toBe(2);
      expect(result.currentUser?.value).toBe(3000);
    });

    it('should sort entries by value descending', async () => {
      prisma.user.findMany.mockResolvedValue(mockUsersWithPoints);

      const result = await service.getPointsRanking('user-123', 'assoc-1', RankingPeriod.ALL_TIME, 10);

      expect(result.entries[0].value).toBeGreaterThan(result.entries[1].value);
    });

    it('should respect limit parameter', async () => {
      const manyUsers = Array.from({ length: 20 }, (_, i) => ({
        ...mockUser,
        id: `user-${i}`,
        points: { lifetimeEarned: 1000 - i * 10 },
      }));
      prisma.user.findMany.mockResolvedValue(manyUsers);

      const result = await service.getPointsRanking('user-0', 'assoc-1', RankingPeriod.ALL_TIME, 5);

      expect(result.entries).toHaveLength(5);
    });

    it('should return undefined currentUser when not in results', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      prisma.pointTransaction.groupBy.mockResolvedValue([]);

      const result = await service.getPointsRanking('non-existent', 'assoc-1', RankingPeriod.MONTHLY, 10);

      expect(result.currentUser).toBeUndefined();
    });

    it('should handle users with no points (value: 0)', async () => {
      const usersNoPoints = [{ ...mockUser, points: null }];
      prisma.user.findMany.mockResolvedValue(usersNoPoints);
      prisma.pointTransaction.groupBy.mockResolvedValue([]);

      const result = await service.getPointsRanking('user-123', 'assoc-1', RankingPeriod.MONTHLY, 10);

      expect(result.entries[0].value).toBe(0);
    });
  });

  // ==========================================
  // getEventsRanking
  // ==========================================

  describe('getEventsRanking', () => {
    it('should count EVENT_CHECKIN transactions', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser, mockUser2]);
      prisma.pointTransaction.groupBy.mockResolvedValue([
        { userId: 'user-123', _count: { _all: 10 } },
        { userId: 'user-456', _count: { _all: 5 } },
      ]);

      const result = await service.getEventsRanking('user-123', 'assoc-1', RankingPeriod.MONTHLY, 10);

      expect(result.type).toBe('events');
      expect(result.entries[0].value).toBe(10);
      expect(result.entries[1].value).toBe(5);
    });

    it('should filter by period (MONTHLY)', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      prisma.pointTransaction.groupBy.mockResolvedValue([]);

      await service.getEventsRanking('user-123', 'assoc-1', RankingPeriod.MONTHLY, 10);

      const groupByCall = prisma.pointTransaction.groupBy.mock.calls[0][0];
      expect(groupByCall.where.source).toBe('EVENT_CHECKIN');
      expect(groupByCall.where.createdAt).toBeDefined();
    });

    it('should include ALL check-ins for ALL_TIME', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      prisma.pointTransaction.groupBy.mockResolvedValue([
        { userId: 'user-123', _count: { _all: 100 } },
      ]);

      await service.getEventsRanking('user-123', 'assoc-1', RankingPeriod.ALL_TIME, 10);

      const groupByCall = prisma.pointTransaction.groupBy.mock.calls[0][0];
      expect(groupByCall.where.createdAt).toBeUndefined();
    });

    it('should return correct positions', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser, mockUser2]);
      prisma.pointTransaction.groupBy.mockResolvedValue([
        { userId: 'user-123', _count: { _all: 10 } },
        { userId: 'user-456', _count: { _all: 5 } },
      ]);

      const result = await service.getEventsRanking('user-123', 'assoc-1', RankingPeriod.ALL_TIME, 10);

      expect(result.entries[0].position).toBe(1);
      expect(result.entries[1].position).toBe(2);
    });

    it('should handle users with zero check-ins', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      prisma.pointTransaction.groupBy.mockResolvedValue([]);

      const result = await service.getEventsRanking('user-123', 'assoc-1', RankingPeriod.MONTHLY, 10);

      expect(result.entries[0].value).toBe(0);
    });

    it('should correctly identify current user', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser, mockUser2]);
      prisma.pointTransaction.groupBy.mockResolvedValue([
        { userId: 'user-123', _count: { _all: 10 } },
        { userId: 'user-456', _count: { _all: 15 } },
      ]);

      const result = await service.getEventsRanking('user-123', 'assoc-1', RankingPeriod.ALL_TIME, 10);

      const currentUserEntry = result.entries.find(e => e.isCurrentUser);
      expect(currentUserEntry?.userId).toBe('user-123');
    });
  });

  // ==========================================
  // getStravaRanking
  // ==========================================

  describe('getStravaRanking', () => {
    const mockConnections = [
      { id: 'conn-1', userId: 'user-123' },
      { id: 'conn-2', userId: 'user-456' },
    ];

    it('should return empty when no Strava connections', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      prisma.stravaConnection.findMany.mockResolvedValue([]);

      const result = await service.getStravaRanking('user-123', 'assoc-1', RankingPeriod.MONTHLY, 10);

      expect(result.type).toBe('strava');
      expect(result.entries).toEqual([]);
      expect(result.currentUser).toBeUndefined();
    });

    it('should aggregate km from activities', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser, mockUser2]);
      prisma.stravaConnection.findMany.mockResolvedValue(mockConnections);
      prisma.stravaActivity.groupBy.mockResolvedValue([
        { connectionId: 'conn-1', _sum: { distanceKm: 50.5 } },
        { connectionId: 'conn-2', _sum: { distanceKm: 30.25 } },
      ]);

      const result = await service.getStravaRanking('user-123', 'assoc-1', RankingPeriod.MONTHLY, 10);

      expect(result.entries[0].value).toBe(50.5);
      expect(result.entries[1].value).toBe(30.3); // rounded
    });

    it('should map connectionId to userId correctly', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser, mockUser2]);
      prisma.stravaConnection.findMany.mockResolvedValue(mockConnections);
      prisma.stravaActivity.groupBy.mockResolvedValue([
        { connectionId: 'conn-1', _sum: { distanceKm: 100 } },
      ]);

      const result = await service.getStravaRanking('user-123', 'assoc-1', RankingPeriod.MONTHLY, 10);

      expect(result.entries[0].userId).toBe('user-123');
    });

    it('should filter activities by period', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      prisma.stravaConnection.findMany.mockResolvedValue([mockConnections[0]]);
      prisma.stravaActivity.groupBy.mockResolvedValue([]);

      await service.getStravaRanking('user-123', 'assoc-1', RankingPeriod.WEEKLY, 10);

      const groupByCall = prisma.stravaActivity.groupBy.mock.calls[0][0];
      expect(groupByCall.where.activityDate).toBeDefined();
    });

    it('should round km to 1 decimal place', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      prisma.stravaConnection.findMany.mockResolvedValue([mockConnections[0]]);
      prisma.stravaActivity.groupBy.mockResolvedValue([
        { connectionId: 'conn-1', _sum: { distanceKm: 10.456 } },
      ]);

      const result = await service.getStravaRanking('user-123', 'assoc-1', RankingPeriod.MONTHLY, 10);

      expect(result.entries[0].value).toBe(10.5);
    });

    it('should handle multiple connections aggregated per user', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      prisma.stravaConnection.findMany.mockResolvedValue([
        { id: 'conn-1', userId: 'user-123' },
        { id: 'conn-1b', userId: 'user-123' },
      ]);
      prisma.stravaActivity.groupBy.mockResolvedValue([
        { connectionId: 'conn-1', _sum: { distanceKm: 30 } },
        { connectionId: 'conn-1b', _sum: { distanceKm: 20 } },
      ]);

      const result = await service.getStravaRanking('user-123', 'assoc-1', RankingPeriod.MONTHLY, 10);

      expect(result.entries[0].value).toBe(50);
    });
  });
});
