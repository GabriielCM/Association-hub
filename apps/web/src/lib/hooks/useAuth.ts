'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { LoginInput, RegisterInput } from '@ahub/shared/validation';

interface UseAuthReturn {
  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginInput) => Promise<boolean>;
  register: (data: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const login = useCallback(
    async (data: LoginInput): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.login(data);
        setUser(response.user);
        router.push('/dashboard');
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao fazer login';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router, setUser]
  );

  const register = useCallback(
    async (data: RegisterInput): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.register(data);
        setUser(response.user);
        router.push('/dashboard');
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao criar conta';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router, setUser]
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.logout();
      clearAuth();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router, clearAuth]);

  const requestPasswordReset = useCallback(
    async (email: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await authApi.requestPasswordReset(email);
        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Erro ao enviar email de recuperação';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resetPassword = useCallback(
    async (token: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await authApi.resetPassword(token, password);
        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Erro ao redefinir senha';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    clearError,
  };
}
