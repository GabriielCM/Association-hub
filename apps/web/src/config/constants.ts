// API Configuration
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

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
