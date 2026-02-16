import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '@/lib/stores/notification.store';

describe('Notification Store (Web)', () => {
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
      expect(state.notifications[0]!.id).toMatch(/^notif_/);
      expect(state.notifications[0]!.title).toBe('Test');
      expect(state.notifications[0]!.read).toBe(false);
      expect(state.notifications[0]!.createdAt).toBeDefined();
    });

    it('should increment unread count', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test 1',
        message: 'Message 1',
        type: 'info',
      });
      useNotificationStore.getState().addNotification({
        title: 'Test 2',
        message: 'Message 2',
        type: 'success',
      });

      expect(useNotificationStore.getState().unreadCount).toBe(2);
    });

    it('should prepend new notifications (newest first)', () => {
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

      const { notifications } = useNotificationStore.getState();
      expect(notifications[0]!.title).toBe('Second');
      expect(notifications[1]!.title).toBe('First');
    });

    it('should limit to 50 notifications', () => {
      for (let i = 0; i < 55; i++) {
        useNotificationStore.getState().addNotification({
          title: `Notif ${i}`,
          message: `Message ${i}`,
          type: 'info',
        });
      }

      expect(useNotificationStore.getState().notifications).toHaveLength(50);
    });

    it('should accept optional data', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test',
        message: 'Message',
        type: 'warning',
        data: { orderId: '123' },
      });

      expect(useNotificationStore.getState().notifications[0]!.data).toEqual({
        orderId: '123',
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test',
        message: 'Message',
        type: 'info',
      });

      const id = useNotificationStore.getState().notifications[0]!.id;
      useNotificationStore.getState().markAsRead(id);

      const state = useNotificationStore.getState();
      expect(state.notifications[0]!.read).toBe(true);
      expect(state.unreadCount).toBe(0);
    });

    it('should not change state for non-existing ID', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test',
        message: 'Message',
        type: 'info',
      });

      useNotificationStore.getState().markAsRead('non-existing');

      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });

    it('should not decrement count for already-read notification', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test',
        message: 'Message',
        type: 'info',
      });

      const id = useNotificationStore.getState().notifications[0]!.id;
      useNotificationStore.getState().markAsRead(id);
      useNotificationStore.getState().markAsRead(id); // second time

      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test 1',
        message: 'M1',
        type: 'info',
      });
      useNotificationStore.getState().addNotification({
        title: 'Test 2',
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
    it('should remove notification and decrement unread count for unread', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test',
        message: 'Message',
        type: 'info',
      });

      const id = useNotificationStore.getState().notifications[0]!.id;
      useNotificationStore.getState().removeNotification(id);

      const state = useNotificationStore.getState();
      expect(state.notifications).toHaveLength(0);
      expect(state.unreadCount).toBe(0);
    });

    it('should not decrement unread count when removing read notification', () => {
      useNotificationStore.getState().addNotification({
        title: 'Test 1',
        message: 'M1',
        type: 'info',
      });
      useNotificationStore.getState().addNotification({
        title: 'Test 2',
        message: 'M2',
        type: 'info',
      });

      const id = useNotificationStore.getState().notifications[0]!.id;
      useNotificationStore.getState().markAsRead(id);
      useNotificationStore.getState().removeNotification(id);

      expect(useNotificationStore.getState().unreadCount).toBe(1);
      expect(useNotificationStore.getState().notifications).toHaveLength(1);
    });
  });

  describe('clearAll', () => {
    it('should clear all notifications and reset count', () => {
      for (let i = 0; i < 5; i++) {
        useNotificationStore.getState().addNotification({
          title: `Test ${i}`,
          message: `Message ${i}`,
          type: 'info',
        });
      }

      useNotificationStore.getState().clearAll();

      const state = useNotificationStore.getState();
      expect(state.notifications).toHaveLength(0);
      expect(state.unreadCount).toBe(0);
    });
  });
});
