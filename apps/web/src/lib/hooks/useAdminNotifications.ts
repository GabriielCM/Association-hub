'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminNotifications,
  sendBroadcast,
  type BroadcastRequest,
} from '@/lib/api/notifications.api';

const notificationsAdminKeys = {
  all: ['admin', 'notifications'] as const,
  list: (query?: Record<string, unknown>) =>
    ['admin', 'notifications', 'list', query] as const,
};

export function useAdminNotifications(query?: {
  page?: number;
  perPage?: number;
  category?: string;
}) {
  return useQuery({
    queryKey: notificationsAdminKeys.list(query as Record<string, unknown>),
    queryFn: () => getAdminNotifications(query),
    staleTime: 30 * 1000,
  });
}

export function useSendBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BroadcastRequest) => sendBroadcast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsAdminKeys.all,
      });
    },
  });
}
