// API Configuration
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

// Timeouts
export const API_TIMEOUT = 10000; // 10 seconds

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ahub_access_token',
  REFRESH_TOKEN: 'ahub_refresh_token',
  USER: 'ahub_user',
  THEME: 'ahub_theme',
} as const;

// App Info
export const APP_VERSION = '0.1.0';
export const APP_NAME = 'A-hub Admin';
