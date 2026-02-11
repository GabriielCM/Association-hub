import { create } from 'zustand';
import type { NotificationCategory } from '@ahub/shared/types';

interface NotificationState {
  unreadCount: number;
  unreadByCategory: Partial<Record<NotificationCategory, number>>;

  setUnreadCount: (count: number) => void;
  setUnreadByCategory: (byCategory: Record<NotificationCategory, number>) => void;
  decrementUnread: (amount?: number) => void;
  resetUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  unreadByCategory: {},

  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },

  setUnreadByCategory: (byCategory) => {
    set({ unreadByCategory: byCategory });
  },

  decrementUnread: (amount = 1) => {
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - amount),
    }));
  },

  resetUnread: () => {
    set({ unreadCount: 0, unreadByCategory: {} });
  },
}));

// Selector hooks
export const useUnreadNotificationCount = () =>
  useNotificationStore((state) => state.unreadCount);
