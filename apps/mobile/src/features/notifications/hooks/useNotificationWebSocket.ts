import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketEvent } from '@/providers/WebSocketProvider';
import { useNotificationStore } from '@/stores/notification.store';
import { notificationKeys } from './useNotifications';
import type {
  WsNotificationNew,
  UnreadCount,
  Notification,
  NotificationsListResponse,
} from '@ahub/shared/types';

export function useNotificationWebSocket() {
  const queryClient = useQueryClient();
  const { setUnreadCount } = useNotificationStore();

  const handleNotificationNew = useCallback(
    (data: unknown) => {
      const event = data as WsNotificationNew;

      // Update unread count immediately
      queryClient.setQueryData<UnreadCount>(
        notificationKeys.unreadCount(),
        () => event.unreadCount
      );
      setUnreadCount(event.unreadCount.total);

      // Prepend to notification list cache
      queryClient.setQueryData<NotificationsListResponse>(
        notificationKeys.list(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [event.notification, ...old.data],
            meta: {
              ...old.meta,
              total: old.meta.total + 1,
              unreadCount: old.meta.unreadCount + 1,
            },
          };
        }
      );

      // Also invalidate to get fresh data
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
    [queryClient, setUnreadCount]
  );

  const handleNotificationRead = useCallback(
    (data: unknown) => {
      const event = data as {
        notificationIds: string[];
        unreadCount: UnreadCount;
      };

      // Update unread count
      queryClient.setQueryData<UnreadCount>(
        notificationKeys.unreadCount(),
        () => event.unreadCount
      );
      setUnreadCount(event.unreadCount.total);

      // Update notification list cache
      queryClient.setQueryData<NotificationsListResponse>(
        notificationKeys.list(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((n: Notification) =>
              event.notificationIds.includes(n.id)
                ? { ...n, isRead: true }
                : n
            ),
          };
        }
      );
    },
    [queryClient, setUnreadCount]
  );

  const handleNotificationDeleted = useCallback(
    (data: unknown) => {
      const event = data as { notificationId: string };

      queryClient.setQueryData<NotificationsListResponse>(
        notificationKeys.list(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter(
              (n: Notification) => n.id !== event.notificationId
            ),
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
    [queryClient]
  );

  const handleUnreadCountUpdate = useCallback(
    (data: unknown) => {
      const unreadCount = data as UnreadCount;
      queryClient.setQueryData<UnreadCount>(
        notificationKeys.unreadCount(),
        () => unreadCount
      );
      setUnreadCount(unreadCount.total);
    },
    [queryClient, setUnreadCount]
  );

  useSocketEvent('notification.new', handleNotificationNew);
  useSocketEvent('notification.read', handleNotificationRead);
  useSocketEvent('notification.deleted', handleNotificationDeleted);
  useSocketEvent('unread_count.update', handleUnreadCountUpdate);
}
