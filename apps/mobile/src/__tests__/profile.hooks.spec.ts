import { describe, it, expect, vi } from 'vitest';

vi.mock('@/services/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  api: {
    post: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
  },
}));

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((selector) =>
    selector({ updateUser: vi.fn() }),
  ),
}));

import {
  profileKeys,
} from '@/features/profile/hooks/useProfile';

describe('Profile Hooks', () => {
  // ===========================================
  // profileKeys factory
  // ===========================================

  describe('profileKeys', () => {
    it('should generate correct base key', () => {
      expect(profileKeys.all).toEqual(['profile']);
    });

    it('should generate correct detail key', () => {
      expect(profileKeys.detail('user-1')).toEqual(['profile', 'user-1']);
    });

    it('should generate correct badges key', () => {
      expect(profileKeys.badges('user-1')).toEqual([
        'profile',
        'user-1',
        'badges',
      ]);
    });

    it('should generate correct rankings key', () => {
      expect(profileKeys.rankings('user-1')).toEqual([
        'profile',
        'user-1',
        'rankings',
      ]);
    });

    it('should generate correct username check key', () => {
      expect(profileKeys.usernameCheck('joao')).toEqual([
        'profile',
        'username',
        'joao',
      ]);
    });

    it('should generate unique keys for different users', () => {
      const key1 = profileKeys.detail('user-1');
      const key2 = profileKeys.detail('user-2');
      expect(key1).not.toEqual(key2);
    });

    it('should nest badges key under user key', () => {
      const detailKey = profileKeys.detail('user-1');
      const badgesKey = profileKeys.badges('user-1');
      expect(badgesKey.slice(0, 2)).toEqual(detailKey);
    });
  });
});
