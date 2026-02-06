import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the API client
vi.mock('@/lib/api/client', () => {
  const mockApi = {
    post: vi.fn(),
    get: vi.fn(),
  };
  return {
    api: mockApi,
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    default: mockApi,
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

import {
  login,
  register,
  logout,
  getProfile,
  requestPasswordReset,
  resetPassword,
  getStoredUser,
  updateStoredUser,
} from '@/lib/api/auth.api';
import { api, setTokens, clearTokens } from '@/lib/api/client';

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

const mockTokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresIn: 3600,
};

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('login', () => {
    it('should call API, save tokens and user, return response', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: { tokens: mockTokens, user: mockUser },
        },
      });

      const result = await login({
        email: 'test@example.com',
        password: '123456',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: '123456',
      });
      expect(setTokens).toHaveBeenCalledWith(mockTokens);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ahub_user',
        JSON.stringify(mockUser)
      );
      expect(result.user).toEqual(mockUser);
      expect(result.tokens).toEqual(mockTokens);
    });

    it('should throw on API error response', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Wrong password' },
        },
      });

      await expect(
        login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('Wrong password');
    });

    it('should throw with default message when no error details', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: false },
      });

      await expect(
        login({ email: 'test@example.com', password: '123456' })
      ).rejects.toThrow('Login failed');
    });
  });

  describe('register', () => {
    it('should call API and save tokens', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: { tokens: mockTokens, user: mockUser },
        },
      });

      const result = await register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
      });
      expect(setTokens).toHaveBeenCalledWith(mockTokens);
      expect(result.user).toEqual(mockUser);
    });

    it('should throw on failure', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: false, error: { message: 'Email taken' } },
      });

      await expect(
        register({
          name: 'Test',
          email: 'taken@example.com',
          password: 'Password1',
        })
      ).rejects.toThrow('Email taken');
    });
  });

  describe('logout', () => {
    it('should call API and clear tokens', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } });
      await logout();
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(clearTokens).toHaveBeenCalled();
    });

    it('should clear tokens even when API fails', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Network error'));
      await logout();
      expect(clearTokens).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: mockUser },
      });

      const user = await getProfile();
      expect(user).toEqual(mockUser);
      expect(api.get).toHaveBeenCalledWith('/user/profile');
    });

    it('should throw on failure', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: false, error: { message: 'Unauthorized' } },
      });

      await expect(getProfile()).rejects.toThrow('Unauthorized');
    });
  });

  describe('requestPasswordReset', () => {
    it('should call API with email', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: true },
      });

      await requestPasswordReset('test@example.com');
      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });
    });

    it('should throw on failure', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: false, error: { message: 'User not found' } },
      });

      await expect(
        requestPasswordReset('unknown@example.com')
      ).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    it('should call API with token and password', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: true },
      });

      await resetPassword('token123', 'NewPass1');
      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'token123',
        password: 'NewPass1',
      });
    });

    it('should throw on failure', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: false, error: { message: 'Token expired' } },
      });

      await expect(resetPassword('expired', 'NewPass1')).rejects.toThrow(
        'Token expired'
      );
    });
  });

  describe('getStoredUser', () => {
    it('should parse user from localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockUser));
      const user = getStoredUser();
      expect(user).not.toBeNull();
      expect(user!.id).toBe(mockUser.id);
      expect(user!.email).toBe(mockUser.email);
      expect(user!.name).toBe(mockUser.name);
    });

    it('should return null when no user stored', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      expect(getStoredUser()).toBeNull();
    });

    it('should return null on invalid JSON', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-json');
      expect(getStoredUser()).toBeNull();
    });
  });

  describe('updateStoredUser', () => {
    it('should save user to localStorage', () => {
      updateStoredUser(mockUser);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ahub_user',
        JSON.stringify(mockUser)
      );
    });
  });
});
