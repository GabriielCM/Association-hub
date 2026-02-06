import { api } from './client';
import type { AuthTokens, User, ApiResponse } from '@ahub/shared/types';
import type { LoginInput, RegisterInput } from '@ahub/shared/validation';

export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
}

export interface RegisterResponse {
  tokens: AuthTokens;
  user: User;
}

/**
 * Login with email and password
 */
export async function login(data: LoginInput): Promise<LoginResponse> {
  const response = await api.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    data
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Login failed');
  }

  return response.data.data;
}

/**
 * Register a new user
 */
export async function register(data: RegisterInput): Promise<RegisterResponse> {
  const response = await api.post<ApiResponse<RegisterResponse>>(
    '/auth/register',
    data
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Registration failed');
  }

  return response.data.data;
}

/**
 * Refresh access token
 */
export async function refreshTokens(
  refreshToken: string
): Promise<AuthTokens> {
  const response = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', {
    refreshToken,
  });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Token refresh failed');
  }

  return response.data.data;
}

/**
 * Logout (invalidate refresh token)
 */
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Silently fail - token might already be invalid
    console.warn('Logout request failed:', error);
  }
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<User> {
  const response = await api.get<ApiResponse<User>>('/user/profile');

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to get profile');
  }

  return response.data.data;
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const response = await api.post<ApiResponse<void>>('/auth/forgot-password', {
    email,
  });

  if (!response.data.success) {
    throw new Error(
      response.data.error?.message || 'Failed to send reset email'
    );
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  password: string
): Promise<void> {
  const response = await api.post<ApiResponse<void>>('/auth/reset-password', {
    token,
    password,
  });

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to reset password');
  }
}
