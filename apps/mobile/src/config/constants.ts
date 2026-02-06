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
