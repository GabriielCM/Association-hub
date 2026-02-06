import { create } from 'zustand';
import type { User, AuthTokens } from '@ahub/shared/types';
import {
  setTokens,
  clearTokens,
  getAccessToken,
} from '@/services/storage/secure-store';
import { getProfile, logout as apiLogout } from '@/services/api/auth.api';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  login: (tokens: AuthTokens, user: User) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isHydrated: false,

  // Set user directly
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  // Login - save tokens and set user
  login: async (tokens, user) => {
    await setTokens(tokens);
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  // Logout - clear tokens and reset state
  logout: async () => {
    try {
      await apiLogout();
    } catch (error) {
      // Ignore API errors during logout
    } finally {
      await clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Hydrate - check for existing session on app start
  hydrate: async () => {
    try {
      set({ isLoading: true });

      const accessToken = await getAccessToken();

      if (!accessToken) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isHydrated: true,
        });
        return;
      }

      // Try to get user profile
      try {
        const user = await getProfile();
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isHydrated: true,
        });
      } catch (error) {
        // Token might be expired, interceptor will try refresh
        // If that fails, user will be logged out
        console.warn('Failed to hydrate user:', error);
        await get().logout();
        set({ isHydrated: true });
      }
    } catch (error) {
      console.error('Hydration error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isHydrated: true,
      });
    }
  },

  // Update user partially
  updateUser: (updates) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...updates },
      });
    }
  },
}));

// Selector hooks for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useIsHydrated = () => useAuthStore((state) => state.isHydrated);
