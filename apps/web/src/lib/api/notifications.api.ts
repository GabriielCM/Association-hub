import api from './client';

export interface AdminNotification {
  id: string;
  type: string;
  category: string;
  title: string;
  body: string;
  recipientCount: number;
  createdAt: string;
}

export interface AdminNotificationsResponse {
  data: AdminNotification[];
  meta: {
    currentPage: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface BroadcastRequest {
  title: string;
  body: string;
  category: string;
  targetAudience?: 'ALL' | 'SUBSCRIBERS' | 'NON_SUBSCRIBERS';
  data?: Record<string, unknown>;
}

export async function getAdminNotifications(params?: {
  page?: number;
  perPage?: number;
  category?: string;
}): Promise<AdminNotificationsResponse> {
  const { data } = await api.get('/admin/notifications', { params });
  return data;
}

export async function sendBroadcast(
  payload: BroadcastRequest
): Promise<{ sent: number; notificationId: string }> {
  const { data } = await api.post('/admin/notifications/broadcast', payload);
  return data;
}
