import { describe, it, expect, beforeEach, vi } from 'vitest';

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
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Import after setting up mocks
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/api/client';

describe('Token Management', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getAccessToken', () => {
    it('should return token from localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce('my-access-token');
      const token = getAccessToken();
      expect(token).toBe('my-access-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('ahub_access_token');
    });

    it('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token from localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce('my-refresh-token');
      const token = getRefreshToken();
      expect(token).toBe('my-refresh-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('ahub_refresh_token');
    });

    it('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe('setTokens', () => {
    it('should save both tokens to localStorage', () => {
      setTokens({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresIn: 3600,
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ahub_access_token',
        'access-123'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ahub_refresh_token',
        'refresh-456'
      );
    });
  });

  describe('clearTokens', () => {
    it('should remove all auth-related items from localStorage', () => {
      clearTokens();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ahub_access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ahub_refresh_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ahub_user');
    });
  });
});
