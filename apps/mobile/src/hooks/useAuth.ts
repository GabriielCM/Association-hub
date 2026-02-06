import { useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import * as authApi from '@/services/api/auth.api';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeLogin = useAuthStore((state) => state.login);
  const storeLogout = useAuthStore((state) => state.logout);

  const login = useCallback(
    async (data: LoginInput): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.login(data);
        await storeLogin(response.tokens, response.user);
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
    [storeLogin]
  );

  const register = useCallback(
    async (data: RegisterInput): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.register(data);
        await storeLogin(response.tokens, response.user);
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
    [storeLogin]
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await storeLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [storeLogout]);

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
