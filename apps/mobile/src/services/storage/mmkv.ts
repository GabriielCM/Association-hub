import { MMKV } from 'react-native-mmkv';

// Lazy-initialized MMKV with in-memory fallback for environments
// where JSI is not available (remote debugger, Expo Go web, etc.)
let _storage: MMKV | null = null;
let _initAttempted = false;
const _fallback = new Map<string, string | boolean>();

function getStorage(): MMKV | null {
  if (_storage) return _storage;
  if (_initAttempted) return null;

  _initAttempted = true;
  try {
    _storage = new MMKV();
    return _storage;
  } catch {
    // JSI not available - use in-memory fallback
    return null;
  }
}

// Helper functions for typed storage
export function setItem(key: string, value: string): void {
  const s = getStorage();
  if (s) s.set(key, value);
  else _fallback.set(key, value);
}

export function getItem(key: string): string | undefined {
  const s = getStorage();
  if (s) return s.getString(key);
  const val = _fallback.get(key);
  return typeof val === 'string' ? val : undefined;
}

export function setBoolean(key: string, value: boolean): void {
  const s = getStorage();
  if (s) s.set(key, value);
  else _fallback.set(key, value);
}

export function getBoolean(key: string): boolean {
  const s = getStorage();
  if (s) return s.getBoolean(key) ?? false;
  const val = _fallback.get(key);
  return typeof val === 'boolean' ? val : false;
}

export function removeItem(key: string): void {
  const s = getStorage();
  if (s) s.delete(key);
  else _fallback.delete(key);
}

// Storage keys
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'dashboard:onboarding_completed',
  FEED_CACHE: 'dashboard:feed_cache',
  AUTH_TOKEN: 'auth:token',
  AUTH_REFRESH_TOKEN: 'auth:refresh_token',
} as const;
