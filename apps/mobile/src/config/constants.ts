import Constants from 'expo-constants';

// API Configuration
export const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:3001/api/v1';

export const WS_URL =
  Constants.expoConfig?.extra?.wsUrl ||
  process.env.EXPO_PUBLIC_WS_URL ||
  'ws://localhost:3001';

// Base URL for uploaded files (strips /api/v1 from API_URL)
export const UPLOADS_BASE_URL = API_URL.replace(/\/api\/v1$/, '');

/**
 * Resolve an upload path to a full URL.
 * Handles both relative paths (/uploads/...) and legacy absolute URLs.
 */
export function resolveUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${UPLOADS_BASE_URL}${path}`;
}

// Stripe
export const STRIPE_PUBLISHABLE_KEY =
  Constants.expoConfig?.extra?.stripePublishableKey ||
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  '';

// Timeouts
export const API_TIMEOUT = 10000; // 10 seconds
export const WS_RECONNECT_INTERVAL = 5000; // 5 seconds

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  BIOMETRICS_ENABLED: 'biometricsEnabled',
  ONBOARDING_COMPLETE: 'onboardingComplete',
} as const;

// App Info
export const APP_VERSION = Constants.expoConfig?.version || '0.1.0';
export const APP_NAME = Constants.expoConfig?.name || 'A-hub';

// Feature Flags
export const FEATURES = {
  BIOMETRICS: true,
  DARK_MODE: true,
  PUSH_NOTIFICATIONS: true,
} as const;
