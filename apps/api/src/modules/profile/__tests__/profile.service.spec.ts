import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ProfileService } from '../profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: any;

  const mockUser = {
    id: 'user-123',
    name: 'João Silva',
    username: 'joaosilva',
    bio: 'Desenvolvedor',
    avatarUrl: 'https://example.com/avatar.jpg',
    status: 'ACTIVE',
    isVerified: false,
    createdAt: new Date('2024-01-01'),
    associationId: 'assoc-1',
    points: { balance: 1000, lifetimeEarned: 5000 },
    subscriptions: [
      {
        plan: { name: 'Premium', verifiedBadge: true },
      },
    ],
    badges: [
      {
        badge: {
          id: 'badge-1',
          name: 'Top 1',
          iconUrl: 'https://example.com/badge.png',
          description: 'Primeiro lugar',
        },
        earnedAt: new Date('2024-06-01'),
      },
    ],
  };

  const mockUserBadges = [
    {
      badge: {
        id: 'badge-1',
        name: 'Top 1',
        iconUrl: 'https://example.com/badge.png',
        description: 'Primeiro lugar',
        criteriaType: 'points_earned',
        criteriaValue: 1000,
      },
      earnedAt: new Date('2024-06-01'),
      isFeatured: true,
    },
    {
      badge: {
        id: 'badge-2',
        name: 'Veterano',
        iconUrl: 'https://example.com/badge2.png',
        description: 'Membro há 1 ano',
        criteriaType: 'member_days',
        criteriaValue: 365,
      },
      earnedAt: new Date('2024-03-01'),
      isFeatured: false,
    },
  ];

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      userBadge: {
        findMany: vi.fn(),
        updateMany: vi.fn(),
      },
      pointTransaction: {
        count: vi.fn(),
      },
      stravaConnection: {
        findUnique: vi.fn(),
      },
      stravaActivity: {
        aggregate: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    service = new ProfileService(prisma);
  });

  // ===========================================
  // getProfile
  // ===========================================

  describe('getProfile', () => {
    it('should return profile with verified badge when user has active subscription', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-123', 'current-user');

      expect(result).toMatchObject({
        id: 'user-123',
        name: 'João Silva',
        username: 'joaosilva',
        bio: 'Desenvolvedor',
        isVerified: true,
        isMe: false,
        stats: { points: 1000, lifetimePoints: 5000 },
        subscription: 'Premium',
      });
    });

    it('should set isMe to true when viewing own profile', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-123', 'user-123');

      expect(result.isMe).toBe(true);
    });

    it('should return isVerified false when no active subscription', async () => {
      const userWithoutSub = { ...mockUser, subscriptions: [] };
      prisma.user.findUnique.mockResolvedValue(userWithoutSub);

      const result = await service.getProfile('user-123', 'current-user');

      expect(result.isVerified).toBe(false);
      expect(result.subscription).toBeNull();
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('invalid-id', 'current-user')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return badges array with proper structure', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-123', 'current-user');

      expect(result.badges).toHaveLength(1);
      expect(result.badges[0]).toMatchObject({
        id: 'badge-1',
        name: 'Top 1',
        iconUrl: 'https://example.com/badge.png',
      });
    });

    it('should handle user with no points record', async () => {
      const userWithoutPoints = { ...mockUser, points: null };
      prisma.user.findUnique.mockResolvedValue(userWithoutPoints);

      const result = await service.getProfile('user-123', 'current-user');

      expect(result.stats.points).toBe(0);
      expect(result.stats.lifetimePoints).toBe(0);
    });

    it('should handle user with empty badges array', async () => {
      const userWithoutBadges = { ...mockUser, badges: [] };
      prisma.user.findUnique.mockResolvedValue(userWithoutBadges);

      const result = await service.getProfile('user-123', 'current-user');

      expect(result.badges).toHaveLength(0);
    });

    it('should set isVerified based on subscription verifiedBadge flag', async () => {
      const userWithNonVerifiedSub = {
        ...mockUser,
        subscriptions: [{ plan: { name: 'Basic', verifiedBadge: false } }],
      };
      prisma.user.findUnique.mockResolvedValue(userWithNonVerifiedSub);

      const result = await service.getProfile('user-123', 'current-user');

      expect(result.isVerified).toBe(false);
    });
  });

  // ===========================================
  // getUserBadges
  // ===========================================

  describe('getUserBadges', () => {
    it('should return all badges for user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-123' });
      prisma.userBadge.findMany.mockResolvedValue(mockUserBadges);

      const result = await service.getUserBadges('user-123');

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.featured).toBe(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserBadges('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should include badge criteria in response', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-123' });
      prisma.userBadge.findMany.mockResolvedValue(mockUserBadges);

      const result = await service.getUserBadges('user-123');

      expect(result.data[0].criteria).toEqual({
        type: 'points_earned',
        value: 1000,
      });
    });
  });

  // ===========================================
  // getUserRankings
  // ===========================================

  describe('getUserRankings', () => {
    it('should return rankings data for user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-123', associationId: 'assoc-1' });
      prisma.user.findMany.mockResolvedValue([
        { id: 'user-1', points: { lifetimeEarned: 5000 } },
        { id: 'user-123', points: { lifetimeEarned: 3000 } },
        { id: 'user-2', points: { lifetimeEarned: 1000 } },
      ]);
      prisma.pointTransaction.count.mockResolvedValue(10);
      prisma.stravaConnection.findUnique.mockResolvedValue(null);

      const result = await service.getUserRankings('user-123', 'assoc-1');

      expect(result.data).toHaveLength(3);
      expect(result.data[0].type).toBe('points');
      expect(result.data[0].position).toBe(2);
      expect(result.data[0].value).toBe(3000);
    });

    it('should include strava km when user has connection', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-123', associationId: 'assoc-1' });
      prisma.user.findMany.mockResolvedValue([{ id: 'user-123', points: null }]);
      prisma.pointTransaction.count.mockResolvedValue(5);
      prisma.stravaConnection.findUnique.mockResolvedValue({ id: 'strava-1' });
      prisma.stravaActivity.aggregate.mockResolvedValue({ _sum: { distanceKm: 42.5 } });

      const result = await service.getUserRankings('user-123', 'assoc-1');

      const stravaRanking = result.data.find((r) => r.type === 'strava');
      expect(stravaRanking?.value).toBe(42.5);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserRankings('invalid-id', 'assoc-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle user not in rankings (position 0)', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'new-user', associationId: 'assoc-1' });
      prisma.user.findMany.mockResolvedValue([
        { id: 'user-1', points: { lifetimeEarned: 5000 } },
        { id: 'user-2', points: { lifetimeEarned: 3000 } },
      ]);
      prisma.pointTransaction.count.mockResolvedValue(0);
      prisma.stravaConnection.findUnique.mockResolvedValue(null);

      const result = await service.getUserRankings('new-user', 'assoc-1');
      const pointsRanking = result.data.find((r) => r.type === 'points');

      expect(pointsRanking?.position).toBe(0);
    });

    it('should handle null strava aggregate sum', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-123', associationId: 'assoc-1' });
      prisma.user.findMany.mockResolvedValue([]);
      prisma.pointTransaction.count.mockResolvedValue(0);
      prisma.stravaConnection.findUnique.mockResolvedValue({ id: 'strava-1' });
      prisma.stravaActivity.aggregate.mockResolvedValue({ _sum: { distanceKm: null } });

      const result = await service.getUserRankings('user-123', 'assoc-1');
      const stravaRanking = result.data.find((r) => r.type === 'strava');

      expect(stravaRanking?.value).toBe(0);
    });
  });

  // ===========================================
  // updateProfile
  // ===========================================

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(null); // No existing username
      prisma.user.update.mockResolvedValue({
        id: 'user-123',
        name: 'João Atualizado',
        username: 'novousername',
        bio: 'Nova bio',
        phone: '11999999999',
        avatarUrl: 'https://example.com/avatar.jpg',
        updatedAt: new Date(),
      });

      const result = await service.updateProfile('user-123', {
        name: 'João Atualizado',
        username: 'novousername',
        bio: 'Nova bio',
      });

      expect(result.name).toBe('João Atualizado');
      expect(result.username).toBe('novousername');
    });

    it('should throw ConflictException when username already taken', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'other-user' });

      await expect(
        service.updateProfile('user-123', { username: 'takenusername' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow keeping same username', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-123' }); // Same user
      prisma.user.update.mockResolvedValue({
        id: 'user-123',
        username: 'sameusername',
        name: 'João',
        bio: null,
        phone: null,
        avatarUrl: null,
        updatedAt: new Date(),
      });

      const result = await service.updateProfile('user-123', { username: 'sameusername' });

      expect(result.username).toBe('sameusername');
    });
  });

  // ===========================================
  // updateAvatar
  // ===========================================

  describe('updateAvatar', () => {
    it('should update avatar URL successfully', async () => {
      prisma.user.update.mockResolvedValue({
        id: 'user-123',
        avatarUrl: 'https://new-avatar.com/image.jpg',
        updatedAt: new Date(),
      });

      const result = await service.updateAvatar('user-123', 'https://new-avatar.com/image.jpg');

      expect(result.avatarUrl).toBe('https://new-avatar.com/image.jpg');
    });

    it('should handle empty/null avatar URL', async () => {
      prisma.user.update.mockResolvedValue({
        id: 'user-123',
        avatarUrl: null,
        updatedAt: new Date(),
      });

      const result = await service.updateAvatar('user-123', '');

      expect(result.avatarUrl).toBeNull();
    });
  });

  // ===========================================
  // updateBadgesDisplay
  // ===========================================

  describe('updateBadgesDisplay', () => {
    it('should update featured badges successfully', async () => {
      prisma.userBadge.findMany
        .mockResolvedValueOnce([{ badgeId: 'badge-1' }, { badgeId: 'badge-2' }])
        .mockResolvedValueOnce([
          { badge: { id: 'badge-1', name: 'Badge 1', iconUrl: 'url1' } },
          { badge: { id: 'badge-2', name: 'Badge 2', iconUrl: 'url2' } },
        ]);

      prisma.$transaction.mockImplementation(async (fn) => {
        const txMock = {
          userBadge: {
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
        };
        return fn(txMock);
      });

      const result = await service.updateBadgesDisplay('user-123', {
        badgeIds: ['badge-1', 'badge-2'],
      });

      expect(result.featuredBadges).toHaveLength(2);
    });

    it('should throw BadRequestException when badge does not belong to user', async () => {
      prisma.userBadge.findMany.mockResolvedValue([{ badgeId: 'badge-1' }]); // Only 1 badge found

      await expect(
        service.updateBadgesDisplay('user-123', { badgeIds: ['badge-1', 'badge-2', 'badge-3'] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // checkUsernameAvailability
  // ===========================================

  describe('checkUsernameAvailability', () => {
    it('should return available when username not taken', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.checkUsernameAvailability('newusername');

      expect(result.isAvailable).toBe(true);
    });

    it('should return not available when username taken by another user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'other-user' });

      const result = await service.checkUsernameAvailability('takenusername', 'user-123');

      expect(result.isAvailable).toBe(false);
    });

    it('should return available when username belongs to current user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-123' });

      const result = await service.checkUsernameAvailability('myusername', 'user-123');

      expect(result.isAvailable).toBe(true);
    });
  });
});
