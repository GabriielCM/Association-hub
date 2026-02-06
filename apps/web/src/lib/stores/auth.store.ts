import { create } from 'zustand';
import type { User } from '@ahub/shared/types';
import { getStoredUser, updateStoredUser } from '@/lib/api/auth.api';
import { clearTokens, getAccessToken } from '@/lib/api/client';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  hydrate: () => void;
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
    if (user) {
      updateStoredUser(user);
    }
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  },

  // Clear auth state
  clearAuth: () => {
    clearTokens();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  // Hydrate from localStorage
  hydrate: () => {
    const token = getAccessToken();
    const user = getStoredUser();

    if (token && user) {
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      });
    } else {
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
      const updatedUser = { ...currentUser, ...updates };
      updateStoredUser(updatedUser);
      set({ user: updatedUser });
    }
  },
}));

// Selector hooks for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsAuthLoading = () => useAuthStore((state) => state.isLoading);
