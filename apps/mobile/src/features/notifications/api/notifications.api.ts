import { get, post, put, del } from '@/services/api/client';
import type {
  NotificationsListResponse,
  NotificationsQueryParams,
  Notification,
  UnreadCount,
  NotificationSettingsResponse,
  NotificationCategorySettings,
  DoNotDisturbSettings,
  NotificationCategory,
  NotificationGroupItem,
} from '@ahub/shared/types';

export async function listNotifications(
  params?: NotificationsQueryParams
): Promise<NotificationsListResponse> {
  return get<NotificationsListResponse>('/notifications', params);
}

export async function getNotification(id: string): Promise<Notification> {
  return get<Notification>(`/notifications/${id}`);
}

export async function getUnreadCount(): Promise<UnreadCount> {
  return get<UnreadCount>('/notifications/unread-count');
}

export async function getNotificationGroup(
  groupKey: string
): Promise<NotificationGroupItem> {
  return get<NotificationGroupItem>(`/notifications/group/${groupKey}`);
}

export async function markAsRead(id: string): Promise<{ id: string; isRead: boolean }> {
  return post<{ id: string; isRead: boolean }>(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<{ markedCount: number }> {
  return post<{ markedCount: number }>('/notifications/read-all');
}

export async function markCategoryAsRead(
  category: NotificationCategory
): Promise<{ category: string; markedCount: number }> {
  return post<{ category: string; markedCount: number }>(
    `/notifications/read-category/${category}`
  );
}

export async function markGroupAsRead(
  groupKey: string
): Promise<{ groupKey: string; markedCount: number }> {
  return post<{ groupKey: string; markedCount: number }>(
    `/notifications/group/${groupKey}/read`
  );
}

export async function deleteNotification(id: string): Promise<void> {
  return del<void>(`/notifications/${id}`);
}

export async function clearReadNotifications(): Promise<{ deletedCount: number }> {
  return del<{ deletedCount: number }>('/notifications/clear');
}

export async function getSettings(): Promise<NotificationSettingsResponse> {
  return get<NotificationSettingsResponse>('/notifications/settings');
}

export async function getCategorySettings(
  category: NotificationCategory
): Promise<NotificationCategorySettings> {
  return get<NotificationCategorySettings>(`/notifications/settings/${category}`);
}

export async function updateSettings(
  category: NotificationCategory,
  data: { pushEnabled: boolean; inAppEnabled: boolean }
): Promise<NotificationCategorySettings> {
  return put<NotificationCategorySettings>(
    `/notifications/settings/${category}`,
    data
  );
}

export async function getDndSettings(): Promise<DoNotDisturbSettings> {
  return get<DoNotDisturbSettings>('/notifications/dnd');
}

export async function updateDndSettings(
  data: Omit<DoNotDisturbSettings, 'isActiveNow'>
): Promise<DoNotDisturbSettings> {
  return put<DoNotDisturbSettings>('/notifications/dnd', data);
}

export async function registerDeviceToken(
  token: string,
  platform: string
): Promise<void> {
  return post<void>('/notifications/device-token', { token, platform });
}
