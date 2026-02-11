import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  markAsRead,
  markAllAsRead,
  markCategoryAsRead,
  markGroupAsRead,
  deleteNotification,
  clearReadNotifications,
} from '../api/notifications.api';
import { notificationKeys } from './useNotifications';
import type { NotificationCategory } from '@ahub/shared/types';

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkCategoryAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: NotificationCategory) => markCategoryAsRead(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkGroupAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupKey: string) => markGroupAsRead(groupKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useClearReadNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearReadNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
