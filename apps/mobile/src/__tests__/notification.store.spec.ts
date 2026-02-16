import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '@/stores/notification.store';

describe('Notification Store (Mobile)', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      unreadCount: 0,
      unreadByCategory: {},
    });
  });

  describe('setUnreadCount', () => {
    it('should set the unread count', () => {
      useNotificationStore.getState().setUnreadCount(5);
      expect(useNotificationStore.getState().unreadCount).toBe(5);
    });
  });

  describe('setUnreadByCategory', () => {
    it('should set unread counts by category', () => {
      const byCategory = { POINTS: 3, EVENTS: 2 } as Record<string, number>;
      useNotificationStore.getState().setUnreadByCategory(byCategory);
      const state = useNotificationStore.getState();
      expect(state.unreadByCategory.POINTS).toBe(3);
      expect(state.unreadByCategory.EVENTS).toBe(2);
    });
  });

  describe('decrementUnread', () => {
    it('should decrement unread count by 1 by default', () => {
      useNotificationStore.getState().setUnreadCount(5);
      useNotificationStore.getState().decrementUnread();
      expect(useNotificationStore.getState().unreadCount).toBe(4);
    });

    it('should decrement by specified amount', () => {
      useNotificationStore.getState().setUnreadCount(10);
      useNotificationStore.getState().decrementUnread(3);
      expect(useNotificationStore.getState().unreadCount).toBe(7);
    });

    it('should not go below zero', () => {
      useNotificationStore.getState().setUnreadCount(2);
      useNotificationStore.getState().decrementUnread(5);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });

  describe('resetUnread', () => {
    it('should reset unread count and categories', () => {
      useNotificationStore.getState().setUnreadCount(10);
      useNotificationStore.getState().setUnreadByCategory({
        POINTS: 5,
      } as Record<string, number>);
      useNotificationStore.getState().resetUnread();

      const state = useNotificationStore.getState();
      expect(state.unreadCount).toBe(0);
      expect(state.unreadByCategory).toEqual({});
    });
  });
});
