import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProfileController } from '../profile.controller';
import { ProfileService } from '../profile.service';
import { JwtPayload } from '../../../common/types';

describe('ProfileController', () => {
  let controller: ProfileController;
  let service: ProfileService;

  const mockUser: JwtPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    role: 'USER',
    associationId: 'assoc-1',
  };

  const mockProfile = {
    id: 'user-123',
    name: 'João Silva',
    username: 'joaosilva',
    bio: 'Desenvolvedor',
    avatarUrl: 'https://example.com/avatar.jpg',
    isVerified: true,
    isMe: true,
    stats: { points: 1000, lifetimePoints: 5000 },
    badges: [],
    subscription: 'Premium',
    memberSince: new Date('2024-01-01'),
  };

  const mockBadges = {
    data: [
      {
        id: 'badge-1',
        name: 'Top 1',
        iconUrl: 'https://example.com/badge.png',
        description: 'Primeiro lugar',
        criteria: { type: 'points_earned', value: 1000 },
        earnedAt: new Date(),
        isFeatured: true,
      },
    ],
    total: 1,
    featured: 1,
  };

  const mockRankings = {
    data: [
      {
        type: 'points',
        name: 'Ranking Geral',
        position: 5,
        totalParticipants: 100,
        value: 5000,
        unit: 'pontos',
      },
    ],
  };

  beforeEach(() => {
    service = {
      getProfile: vi.fn().mockResolvedValue(mockProfile),
      getUserBadges: vi.fn().mockResolvedValue(mockBadges),
      getUserRankings: vi.fn().mockResolvedValue(mockRankings),
      updateProfile: vi.fn().mockResolvedValue({
        id: 'user-123',
        name: 'João Atualizado',
        username: 'joaosilva',
        bio: 'Nova bio',
        phone: null,
        avatarUrl: null,
        updatedAt: new Date(),
      }),
      updateAvatar: vi.fn().mockResolvedValue({
        id: 'user-123',
        avatarUrl: 'https://example.com/new-avatar.jpg',
        updatedAt: new Date(),
      }),
      updateBadgesDisplay: vi.fn().mockResolvedValue({
        featuredBadges: [{ id: 'badge-1', name: 'Badge 1', iconUrl: 'url' }],
      }),
      checkUsernameAvailability: vi.fn().mockResolvedValue({
        username: 'testuser',
        isAvailable: true,
      }),
    } as unknown as ProfileService;

    controller = new ProfileController(service);
  });

  // ===========================================
  // getProfile
  // ===========================================

  describe('getProfile', () => {
    it('should return profile data wrapped in data object', async () => {
      const result = await controller.getProfile('user-123', mockUser);

      expect(result).toEqual({ data: mockProfile });
      expect(service.getProfile).toHaveBeenCalledWith('user-123', 'user-123');
    });

    it('should pass correct userId and currentUserId', async () => {
      await controller.getProfile('other-user', mockUser);

      expect(service.getProfile).toHaveBeenCalledWith('other-user', 'user-123');
    });
  });

  // ===========================================
  // getUserBadges
  // ===========================================

  describe('getUserBadges', () => {
    it('should return badges data', async () => {
      const result = await controller.getUserBadges('user-123');

      expect(result).toEqual(mockBadges);
      expect(service.getUserBadges).toHaveBeenCalledWith('user-123');
    });
  });

  // ===========================================
  // getUserRankings
  // ===========================================

  describe('getUserRankings', () => {
    it('should return rankings data', async () => {
      const result = await controller.getUserRankings('user-123', mockUser);

      expect(result).toEqual(mockRankings);
      expect(service.getUserRankings).toHaveBeenCalledWith('user-123', 'assoc-1');
    });
  });

  // ===========================================
  // updateProfile
  // ===========================================

  describe('updateProfile', () => {
    it('should update profile and return success message', async () => {
      const dto = { name: 'João Atualizado', bio: 'Nova bio' };

      const result = await controller.updateProfile(mockUser, dto);

      expect(result.data.name).toBe('João Atualizado');
      expect(result.message).toBe('Perfil atualizado com sucesso');
      expect(service.updateProfile).toHaveBeenCalledWith('user-123', dto);
    });
  });

  // ===========================================
  // uploadAvatar
  // ===========================================

  describe('uploadAvatar', () => {
    it('should upload avatar and return success message', async () => {
      const mockFile = {
        originalname: 'avatar.jpg',
        buffer: Buffer.from('fake-image'),
      } as Express.Multer.File;

      const result = await controller.uploadAvatar(mockUser, mockFile);

      expect(result.message).toBe('Avatar atualizado com sucesso');
      expect(service.updateAvatar).toHaveBeenCalled();
    });
  });

  // ===========================================
  // updateBadgesDisplay
  // ===========================================

  describe('updateBadgesDisplay', () => {
    it('should update featured badges and return success message', async () => {
      const dto = { badgeIds: ['badge-1', 'badge-2'] };

      const result = await controller.updateBadgesDisplay(mockUser, dto);

      expect(result.data.featuredBadges).toHaveLength(1);
      expect(result.message).toBe('Badges atualizados com sucesso');
      expect(service.updateBadgesDisplay).toHaveBeenCalledWith('user-123', dto);
    });
  });

  // ===========================================
  // checkUsername
  // ===========================================

  describe('checkUsername', () => {
    it('should return username availability wrapped in data object', async () => {
      const result = await controller.checkUsername('testuser', mockUser);

      expect(result).toEqual({
        data: { username: 'testuser', isAvailable: true },
      });
      expect(service.checkUsernameAvailability).toHaveBeenCalledWith('testuser', 'user-123');
    });
  });
});
