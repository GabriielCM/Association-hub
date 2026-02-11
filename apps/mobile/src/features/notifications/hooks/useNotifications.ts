import { useQuery } from '@tanstack/react-query';
import {
  listNotifications,
  getNotification,
  getUnreadCount,
  getNotificationGroup,
} from '../api/notifications.api';
import type {
  NotificationsListResponse,
  NotificationsQueryParams,
  Notification,
  UnreadCount,
  NotificationGroupItem,
} from '@ahub/shared/types';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: NotificationsQueryParams) =>
    [...notificationKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) =>
    [...notificationKeys.all, 'detail', id] as const,
  group: (groupKey: string) =>
    [...notificationKeys.all, 'group', groupKey] as const,
  unreadCount: () =>
    [...notificationKeys.all, 'unread-count'] as const,
  settings: () =>
    [...notificationKeys.all, 'settings'] as const,
  dnd: () =>
    [...notificationKeys.all, 'dnd'] as const,
};

export function useNotifications(params?: NotificationsQueryParams) {
  return useQuery<NotificationsListResponse>({
    queryKey: notificationKeys.list(params),
    queryFn: () => listNotifications(params),
    staleTime: 60 * 1000,
  });
}

export function useNotification(id: string) {
  return useQuery<Notification>({
    queryKey: notificationKeys.detail(id),
    queryFn: () => getNotification(id),
    enabled: !!id,
  });
}

export function useUnreadCount() {
  return useQuery<UnreadCount>({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => getUnreadCount(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useNotificationGroup(groupKey: string) {
  return useQuery<NotificationGroupItem>({
    queryKey: notificationKeys.group(groupKey),
    queryFn: () => getNotificationGroup(groupKey),
    enabled: !!groupKey,
  });
}
