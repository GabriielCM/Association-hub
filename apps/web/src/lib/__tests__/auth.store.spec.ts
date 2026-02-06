import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies
vi.mock('@/lib/api/auth.api', () => ({
  getStoredUser: vi.fn(),
  updateStoredUser: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  getAccessToken: vi.fn(),
  clearTokens: vi.fn(),
}));

import { useAuthStore } from '@/lib/stores/auth.store';
import { getStoredUser, updateStoredUser } from '@/lib/api/auth.api';
import { getAccessToken, clearTokens } from '@/lib/api/client';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER' as const,
  status: 'ACTIVE' as const,
  isVerified: true,
  associationId: 'assoc-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Auth Store (Web)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
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
      expect(state.isLoading).toBe(false);
    });

    it('should call updateStoredUser when user is provided', () => {
      useAuthStore.getState().setUser(mockUser);
      expect(updateStoredUser).toHaveBeenCalledWith(mockUser);
    });

    it('should clear user when null', () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setUser(null);
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should not call updateStoredUser when user is null', () => {
      useAuthStore.getState().setUser(null);
      expect(updateStoredUser).not.toHaveBeenCalled();
    });
  });

  describe('clearAuth', () => {
    it('should clear auth state and tokens', () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(clearTokens).toHaveBeenCalled();
    });
  });

  describe('hydrate', () => {
    it('should hydrate with stored user when token exists', () => {
      vi.mocked(getAccessToken).mockReturnValue('access-token');
      vi.mocked(getStoredUser).mockReturnValue(mockUser);

      useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isHydrated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should set unauthenticated when no token', () => {
      vi.mocked(getAccessToken).mockReturnValue(null);
      vi.mocked(getStoredUser).mockReturnValue(null);

      useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isHydrated).toBe(true);
    });

    it('should set unauthenticated when token but no user', () => {
      vi.mocked(getAccessToken).mockReturnValue('token');
      vi.mocked(getStoredUser).mockReturnValue(null);

      useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isHydrated).toBe(true);
    });
  });

  describe('updateUser', () => {
    it('should partially update user', () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      useAuthStore.getState().updateUser({ name: 'Updated Name' });

      const state = useAuthStore.getState();
      expect(state.user?.name).toBe('Updated Name');
      expect(state.user?.email).toBe('test@example.com');
      expect(updateStoredUser).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Updated Name' })
      );
    });

    it('should do nothing when no user is set', () => {
      useAuthStore.getState().updateUser({ name: 'New Name' });
      expect(useAuthStore.getState().user).toBeNull();
      expect(updateStoredUser).not.toHaveBeenCalled();
    });
  });
});
