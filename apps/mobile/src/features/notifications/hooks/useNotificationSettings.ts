import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSettings,
  updateSettings,
  getDndSettings,
  updateDndSettings,
} from '../api/notifications.api';
import { notificationKeys } from './useNotifications';
import type {
  NotificationSettingsResponse,
  DoNotDisturbSettings,
  NotificationCategory,
} from '@ahub/shared/types';

export function useNotificationSettings() {
  return useQuery<NotificationSettingsResponse>({
    queryKey: notificationKeys.settings(),
    queryFn: () => getSettings(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      category,
      data,
    }: {
      category: NotificationCategory;
      data: { pushEnabled: boolean; inAppEnabled: boolean };
    }) => updateSettings(category, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.settings() });
    },
  });
}

export function useDndSettings() {
  return useQuery<DoNotDisturbSettings>({
    queryKey: notificationKeys.dnd(),
    queryFn: () => getDndSettings(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateDnd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<DoNotDisturbSettings, 'isActiveNow'>) =>
      updateDndSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.dnd() });
    },
  });
}
