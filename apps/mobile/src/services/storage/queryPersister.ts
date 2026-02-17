import { setItem, getItem, removeItem } from './mmkv';
import type { PersistedClient } from '@tanstack/react-query-persist-client';

const QUERY_CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE';

/**
 * MMKV-based persister for TanStack Query.
 * Only activated when @tanstack/react-query-persist-client is installed.
 * Until then, this module provides the storage interface for future use.
 */
export const mmkvPersister = {
  persistClient: (client: PersistedClient) => {
    try {
      setItem(QUERY_CACHE_KEY, JSON.stringify(client));
    } catch {
      // Silently fail on storage errors
    }
  },
  restoreClient: (): PersistedClient | undefined => {
    try {
      const data = getItem(QUERY_CACHE_KEY);
      if (data) {
        return JSON.parse(data) as PersistedClient;
      }
    } catch {
      // Silently fail
    }
    return undefined;
  },
  removeClient: () => {
    try {
      removeItem(QUERY_CACHE_KEY);
    } catch {
      // Silently fail
    }
  },
};
