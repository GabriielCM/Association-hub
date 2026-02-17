import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the API client typed helpers
vi.mock('@/services/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  api: {
    post: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
  },
}));

import { get, put } from '@/services/api/client';
import { api } from '@/services/api/client';
import {
  getProfile,
  getUserBadges,
  getUserRankings,
  updateProfile,
  uploadAvatar,
  updateBadgesDisplay,
  checkUsername,
} from '@/features/profile/api/profile.api';
import type {
  UserProfile,
  UserBadgesResponse,
  UserRankingsResponse,
  UpdateProfileResult,
  UpdateBadgesDisplayResult,
  UsernameCheckResponse,
} from '@ahub/shared/types';

const mockProfile: UserProfile = {
  id: 'user-1',
  name: 'João Silva',
  username: 'joaosilva',
  bio: 'Membro ativo',
  avatarUrl: 'https://example.com/avatar.jpg',
  isVerified: true,
  isMe: true,
  isOnline: true,
  subscriptionColor: '#8B5CF6',
  socialLinks: { instagram: 'joaosilva', facebook: 'joao.silva', x: 'joaosilva' },
  stats: { points: 1500, lifetimePoints: 5000 },
  badges: [
    { id: 'b1', name: 'Top 1', iconUrl: '🏆', earnedAt: new Date() },
  ],
  subscription: 'Premium',
  memberSince: new Date('2025-01-01'),
};

const mockBadgesResponse: UserBadgesResponse = {
  data: [
    {
      id: 'b1',
      name: 'Top 1',
      iconUrl: '🏆',
      description: 'Primeiro lugar',
      criteria: { type: 'points', value: 1000 },
      earnedAt: new Date(),
      isFeatured: true,
    },
  ],
  total: 1,
  featured: 1,
  lockedBadges: [],
};

const mockRankingsResponse: UserRankingsResponse = {
  data: [
    {
      type: 'points',
      name: 'Ranking Geral',
      position: 3,
      totalParticipants: 50,
      value: 5000,
      unit: 'pontos',
    },
    {
      type: 'events',
      name: 'Eventos',
      position: null,
      totalParticipants: 50,
      value: 12,
      unit: 'check-ins',
    },
  ],
};

const mockUpdateResult: UpdateProfileResult = {
  id: 'user-1',
  name: 'João Atualizado',
  username: 'joaosilva',
  bio: 'Nova bio',
  phone: '11999999999',
  avatarUrl: 'https://example.com/avatar.jpg',
  updatedAt: new Date(),
};

const mockBadgesDisplayResult: UpdateBadgesDisplayResult = {
  featuredBadges: [{ id: 'b1', name: 'Top 1', iconUrl: '🏆' }],
};

const mockUsernameCheck: UsernameCheckResponse = {
  username: 'joaosilva',
  isAvailable: true,
};

describe('Profile API (Mobile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should call get with correct URL', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockProfile);
      const result = await getProfile('user-1');
      expect(get).toHaveBeenCalledWith('/user/user-1/profile');
      expect(result).toEqual(mockProfile);
    });

    it('should handle different user IDs', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockProfile);
      await getProfile('user-99');
      expect(get).toHaveBeenCalledWith('/user/user-99/profile');
    });
  });

  describe('getUserBadges', () => {
    it('should call get with correct URL', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockBadgesResponse);
      const result = await getUserBadges('user-1');
      expect(get).toHaveBeenCalledWith('/user/user-1/badges');
      expect(result).toEqual(mockBadgesResponse);
    });
  });

  describe('getUserRankings', () => {
    it('should call get with correct URL', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockRankingsResponse);
      const result = await getUserRankings('user-1');
      expect(get).toHaveBeenCalledWith('/user/user-1/rankings');
      expect(result).toEqual(mockRankingsResponse);
    });
  });

  describe('updateProfile', () => {
    it('should call put with correct URL and data', async () => {
      vi.mocked(put).mockResolvedValueOnce(mockUpdateResult);
      const data = { name: 'João Atualizado', bio: 'Nova bio' };
      const result = await updateProfile(data);
      expect(put).toHaveBeenCalledWith('/user/profile', data);
      expect(result).toEqual(mockUpdateResult);
    });

    it('should support partial updates', async () => {
      vi.mocked(put).mockResolvedValueOnce(mockUpdateResult);
      const data = { username: 'newusername' };
      await updateProfile(data);
      expect(put).toHaveBeenCalledWith('/user/profile', data);
    });
  });

  describe('uploadAvatar', () => {
    it('should send multipart form data', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: { id: 'user-1', avatarUrl: 'https://new-url.com', updatedAt: new Date() },
        },
      });

      const file = { uri: 'file:///photo.jpg', name: 'photo.jpg', type: 'image/jpeg' };
      await uploadAvatar(file);

      expect(api.post).toHaveBeenCalledWith(
        '/user/avatar',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    });

    it('should throw on failure', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: false,
          error: { message: 'File too large' },
        },
      });

      const file = { uri: 'file:///photo.jpg', name: 'photo.jpg', type: 'image/jpeg' };
      await expect(uploadAvatar(file)).rejects.toThrow('File too large');
    });
  });

  describe('updateBadgesDisplay', () => {
    it('should call put with badge IDs', async () => {
      vi.mocked(put).mockResolvedValueOnce(mockBadgesDisplayResult);
      const result = await updateBadgesDisplay(['b1', 'b2']);
      expect(put).toHaveBeenCalledWith('/user/badges/display', {
        badgeIds: ['b1', 'b2'],
      });
      expect(result).toEqual(mockBadgesDisplayResult);
    });
  });

  describe('checkUsername', () => {
    it('should call get with username query', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockUsernameCheck);
      const result = await checkUsername('joaosilva');
      expect(get).toHaveBeenCalledWith('/user/username/check', {
        username: 'joaosilva',
      });
      expect(result).toEqual(mockUsernameCheck);
    });
  });
});
