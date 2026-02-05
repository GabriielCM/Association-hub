import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardService } from '../services/dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: any;
  let pointsService: any;
  let notificationsService: any;
  let storiesService: any;
  let feedService: any;

  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
      },
      pointTransaction: {
        aggregate: vi.fn(),
      },
    };

    pointsService = {
      getBalance: vi.fn(),
    };

    notificationsService = {
      getUnreadCount: vi.fn(),
    };

    storiesService = {
      hasUnviewedStories: vi.fn(),
    };

    feedService = {
      getPreview: vi.fn(),
    };

    service = new DashboardService(
      prisma,
      pointsService,
      notificationsService,
      storiesService,
      feedService,
    );
  });

  describe('getSummary', () => {
    it('should return complete dashboard summary', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      pointsService.getBalance.mockResolvedValue({ balance: 1500 });
      prisma.pointTransaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 50 } }) // Today's variation
        .mockResolvedValue({ _sum: { amount: 20 } }); // Last 7 days (called 7 times)
      notificationsService.getUnreadCount.mockResolvedValue({ total: 3, byCategory: {} });
      storiesService.hasUnviewedStories.mockResolvedValue(true);
      feedService.getPreview.mockResolvedValue([
        { id: 'post-1', type: 'photo' },
        { id: 'post-2', type: 'poll' },
      ]);

      const result = await service.getSummary('user-1', 'assoc-1');

      expect(result.user.name).toBe('Test');
      expect(result.user.points).toBe(1500);
      expect(result.user.points_today).toBe(50);
      expect(result.user.points_chart).toHaveLength(7);
      expect(result.unread_notifications).toBe(3);
      expect(result.has_stories).toBe(true);
      expect(result.feed_preview).toHaveLength(2);
    });

    it('should handle user without avatar', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        avatarUrl: null,
      });
      pointsService.getBalance.mockResolvedValue({ balance: 0 });
      prisma.pointTransaction.aggregate.mockResolvedValue({ _sum: { amount: null } });
      notificationsService.getUnreadCount.mockResolvedValue({ total: 0, byCategory: {} });
      storiesService.hasUnviewedStories.mockResolvedValue(false);
      feedService.getPreview.mockResolvedValue([]);

      const result = await service.getSummary('user-1', 'assoc-1');

      expect(result.user.avatar_url).toBeNull();
      expect(result.user.points).toBe(0);
      expect(result.user.points_today).toBe(0);
    });

    it('should handle user not found with default values', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      pointsService.getBalance.mockResolvedValue({ balance: 0 });
      prisma.pointTransaction.aggregate.mockResolvedValue({ _sum: { amount: null } });
      notificationsService.getUnreadCount.mockResolvedValue({ total: 0, byCategory: {} });
      storiesService.hasUnviewedStories.mockResolvedValue(false);
      feedService.getPreview.mockResolvedValue([]);

      const result = await service.getSummary('user-1', 'assoc-1');

      expect(result.user.name).toBe('Usuário');
      expect(result.user.avatar_url).toBeNull();
    });

    it('should extract first name only', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        name: 'John Doe Smith',
      });
      pointsService.getBalance.mockResolvedValue({ balance: 100 });
      prisma.pointTransaction.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
      notificationsService.getUnreadCount.mockResolvedValue({ total: 0, byCategory: {} });
      storiesService.hasUnviewedStories.mockResolvedValue(false);
      feedService.getPreview.mockResolvedValue([]);

      const result = await service.getSummary('user-1', 'assoc-1');

      expect(result.user.name).toBe('John');
    });

    it('should fetch all data in parallel', async () => {
      const getUserDataSpy = vi.spyOn(service as any, 'getUserData');
      const getPointsDataSpy = vi.spyOn(service as any, 'getPointsData');

      prisma.user.findUnique.mockResolvedValue(mockUser);
      pointsService.getBalance.mockResolvedValue({ balance: 0 });
      prisma.pointTransaction.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
      notificationsService.getUnreadCount.mockResolvedValue({ total: 0, byCategory: {} });
      storiesService.hasUnviewedStories.mockResolvedValue(false);
      feedService.getPreview.mockResolvedValue([]);

      await service.getSummary('user-1', 'assoc-1');

      // Verify all services were called
      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(pointsService.getBalance).toHaveBeenCalled();
      expect(notificationsService.getUnreadCount).toHaveBeenCalled();
      expect(storiesService.hasUnviewedStories).toHaveBeenCalled();
      expect(feedService.getPreview).toHaveBeenCalled();
    });

    it('should calculate last 7 days chart correctly', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      pointsService.getBalance.mockResolvedValue({ balance: 100 });

      // Mock different values for each day
      let callCount = 0;
      prisma.pointTransaction.aggregate.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ _sum: { amount: 10 } }); // Today's variation
        }
        // Days chart (7 calls)
        const dayValues = [5, 10, 0, 15, 20, 8, 12];
        return Promise.resolve({ _sum: { amount: dayValues[callCount - 2] || 0 } });
      });

      notificationsService.getUnreadCount.mockResolvedValue({ total: 0, byCategory: {} });
      storiesService.hasUnviewedStories.mockResolvedValue(false);
      feedService.getPreview.mockResolvedValue([]);

      const result = await service.getSummary('user-1', 'assoc-1');

      expect(result.user.points_chart).toHaveLength(7);
      expect(result.user.points_chart.every(n => typeof n === 'number')).toBe(true);
    });
  });
});
