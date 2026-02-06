import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock secure-store
vi.mock('@/services/storage/secure-store', () => ({
  setTokens: vi.fn().mockResolvedValue(undefined),
  clearTokens: vi.fn().mockResolvedValue(undefined),
  getAccessToken: vi.fn().mockResolvedValue(null),
}));

// Mock auth API
vi.mock('@/services/api/auth.api', () => ({
  getProfile: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
}));

import { useAuthStore } from '@/stores/auth.store';
import {
  setTokens,
  clearTokens,
  getAccessToken,
} from '@/services/storage/secure-store';
import { getProfile, logout as apiLogout } from '@/services/api/auth.api';
import type { User, AuthTokens } from '@ahub/shared/types';

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  status: 'ACTIVE',
  isVerified: true,
  associationId: 'assoc-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTokens: AuthTokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresIn: 3600,
};

describe('Auth Store (Mobile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
      expect(state.isHydrated).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      useAuthStore.getState().setUser(mockUser);
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should clear user when null', () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setUser(null);
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should save tokens and set user', async () => {
      await useAuthStore.getState().login(mockTokens, mockUser);

      expect(setTokens).toHaveBeenCalledWith(mockTokens);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should call API, clear tokens and reset state', async () => {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });

      await useAuthStore.getState().logout();

      expect(apiLogout).toHaveBeenCalled();
      expect(clearTokens).toHaveBeenCalled();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear tokens even when API fails', async () => {
      vi.mocked(apiLogout).mockRejectedValueOnce(new Error('Network error'));

      await useAuthStore.getState().logout();

      expect(clearTokens).toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('hydrate', () => {
    it('should set authenticated when token and profile exist', async () => {
      vi.mocked(getAccessToken).mockResolvedValueOnce('access-token');
      vi.mocked(getProfile).mockResolvedValueOnce(mockUser);

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isHydrated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should set unauthenticated when no token', async () => {
      vi.mocked(getAccessToken).mockResolvedValueOnce(null);

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isHydrated).toBe(true);
    });

    it('should logout when profile fetch fails', async () => {
      vi.mocked(getAccessToken).mockResolvedValueOnce('token');
      vi.mocked(getProfile).mockRejectedValueOnce(new Error('Expired'));

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.isHydrated).toBe(true);
      expect(clearTokens).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should partially update user', () => {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      });

      useAuthStore.getState().updateUser({ name: 'Updated Name' });

      const state = useAuthStore.getState();
      expect(state.user?.name).toBe('Updated Name');
      expect(state.user?.email).toBe('test@example.com');
    });

    it('should do nothing when no user is set', () => {
      useAuthStore.getState().updateUser({ name: 'New Name' });
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
