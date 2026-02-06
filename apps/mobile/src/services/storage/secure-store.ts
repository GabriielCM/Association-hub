import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/config/constants';
import type { AuthTokens } from '@ahub/shared/types';

/**
 * Secure storage for sensitive data (tokens, etc.)
 * Uses iOS Keychain / Android Keystore
 */

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
}

export async function getTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
  ]);
  return { accessToken, refreshToken };
}

export async function setTokens(tokens: AuthTokens): Promise<void> {
  try {
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ]);
  } catch (error) {
    console.error('Failed to save tokens:', error);
    throw error;
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
}

export async function setBiometricsEnabled(enabled: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      STORAGE_KEYS.BIOMETRICS_ENABLED,
      String(enabled)
    );
  } catch (error) {
    console.error('Failed to set biometrics preference:', error);
  }
}

export async function isBiometricsEnabled(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(STORAGE_KEYS.BIOMETRICS_ENABLED);
    return value === 'true';
  } catch (error) {
    console.error('Failed to get biometrics preference:', error);
    return false;
  }
}
