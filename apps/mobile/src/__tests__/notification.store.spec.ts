import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '@/stores/notification.store';

describe('Notification Store (Mobile)', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
    });
  });

  describe('addNotification', () => {
    it('should add notification with auto-generated ID', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test',
        message: 'Test message',
        type: 'info',
      });

      const state = useNotificationStore.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].id).toMatch(/^notif_/);
      expect(state.notifications[0].read).toBe(false);
      expect(state.notifications[0].createdAt).toBeDefined();
    });

    it('should increment unread count', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test 1',
        message: 'M1',
        type: 'info',
      });
      useNotificationStore.getState().addNotification({
        title: 'Test 2',
        message: 'M2',
        type: 'success',
      });

      expect(useNotificationStore.getState().unreadCount).toBe(2);
    });

    it('should prepend new notifications', () => {
      useNotificationStore.getState().addNotification({
        title: 'First',
        message: 'First',
        type: 'info',
      });
      useNotificationStore.getState().addNotification({
        title: 'Second',
        message: 'Second',
        type: 'info',
      });

      expect(useNotificationStore.getState().notifications[0].title).toBe(
        'Second'
      );
    });

    it('should limit to 50 notifications', () => {
      for (let i = 0; i < 55; i++) {
        useNotificationStore.getState().addNotification({
          title: `Notif ${i}`,
          message: `Msg ${i}`,
          type: 'info',
        });
      }

      expect(useNotificationStore.getState().notifications).toHaveLength(50);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read and decrement count', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test',
        message: 'Msg',
        type: 'info',
      });

      const id = useNotificationStore.getState().notifications[0].id;
      useNotificationStore.getState().markAsRead(id);

      expect(useNotificationStore.getState().notifications[0].read).toBe(true);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('should not change state for non-existing ID', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test',
        message: 'Msg',
        type: 'info',
      });

      useNotificationStore.getState().markAsRead('non-existing');
      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });

    it('should not double-decrement for already-read notification', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test',
        message: 'Msg',
        type: 'info',
      });

      const id = useNotificationStore.getState().notifications[0].id;
      useNotificationStore.getState().markAsRead(id);
      useNotificationStore.getState().markAsRead(id);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read and reset count', () => {
      useNotificationStore.getState().addNotification({
        title: 'T1',
        message: 'M1',
        type: 'info',
      });
      useNotificationStore.getState().addNotification({
        title: 'T2',
        message: 'M2',
        type: 'error',
      });

      useNotificationStore.getState().markAllAsRead();

      const state = useNotificationStore.getState();
      expect(state.notifications.every((n) => n.read)).toBe(true);
      expect(state.unreadCount).toBe(0);
    });
  });

  describe('removeNotification', () => {
    it('should remove and decrement count for unread', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test',
        message: 'Msg',
        type: 'info',
      });

      const id = useNotificationStore.getState().notifications[0].id;
      useNotificationStore.getState().removeNotification(id);

      expect(useNotificationStore.getState().notifications).toHaveLength(0);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('should not decrement count when removing read notification', () => {
      useNotificationStore.getState().addNotification({
        title: 'T1',
        message: 'M1',
        type: 'info',
      });
      useNotificationStore.getState().addNotification({
        title: 'T2',
        message: 'M2',
        type: 'info',
      });

      const id = useNotificationStore.getState().notifications[0].id;
      useNotificationStore.getState().markAsRead(id);
      useNotificationStore.getState().removeNotification(id);

      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });
  });

  describe('clearAll', () => {
    it('should clear all notifications', () => {
      for (let i = 0; i < 5; i++) {
        useNotificationStore.getState().addNotification({
          title: `T${i}`,
          message: `M${i}`,
          type: 'info',
        });
      }

      useNotificationStore.getState().clearAll();

      expect(useNotificationStore.getState().notifications).toHaveLength(0);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });
});
