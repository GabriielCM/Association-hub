import { create } from 'zustand';
import { getItem, setItem, STORAGE_KEYS } from '@/services/storage/mmkv';

interface BookmarksState {
  bookmarkedIds: string[];
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

function loadBookmarks(): string[] {
  const raw = getItem(STORAGE_KEYS.BOOKMARKED_PARTNERS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveBookmarks(ids: string[]) {
  setItem(STORAGE_KEYS.BOOKMARKED_PARTNERS, JSON.stringify(ids));
}

export const useBookmarksStore = create<BookmarksState>((set, get) => ({
  bookmarkedIds: loadBookmarks(),

  toggleBookmark: (id: string) => {
    const current = get().bookmarkedIds;
    const next = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id];
    saveBookmarks(next);
    set({ bookmarkedIds: next });
  },

  isBookmarked: (id: string) => get().bookmarkedIds.includes(id),
}));

// Selector hooks
export const useIsBookmarked = (id: string) =>
  useBookmarksStore((s) => s.bookmarkedIds.includes(id));

export const useToggleBookmark = () =>
  useBookmarksStore((s) => s.toggleBookmark);
