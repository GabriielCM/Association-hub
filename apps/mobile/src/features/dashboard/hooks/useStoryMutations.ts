import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTextStory,
  createMediaStory,
  recordStoryView,
  deleteStory,
} from '../api/dashboard.api';
import { dashboardKeys } from './useDashboard';
import type { CreateTextStoryRequest } from '@ahub/shared/types';

export function useCreateTextStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTextStoryRequest) => createTextStory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stories() });
    },
  });
}

export function useCreateMediaStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createMediaStory(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stories() });
    },
  });
}

export function useRecordStoryView() {
  return useMutation({
    mutationFn: (storyId: string) => recordStoryView(storyId),
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyId: string) => deleteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stories() });
    },
  });
}
