import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  confirmEvent,
  removeConfirmation,
  checkin,
  createComment,
} from '../api/events.api';
import { eventsKeys } from './useEvents';
import type { CheckinRequest, EventDetail } from '@ahub/shared/types';

export function useConfirmEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => confirmEvent(eventId),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: eventsKeys.detail(eventId),
      });
      const previous = queryClient.getQueryData<EventDetail>(
        eventsKeys.detail(eventId)
      );
      if (previous) {
        queryClient.setQueryData<EventDetail>(eventsKeys.detail(eventId), {
          ...previous,
          isConfirmed: true,
          confirmationsCount: previous.confirmationsCount + 1,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          eventsKeys.detail(eventId),
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventsKeys.list() });
    },
  });
}

export function useRemoveConfirmation(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeConfirmation(eventId),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: eventsKeys.detail(eventId),
      });
      const previous = queryClient.getQueryData<EventDetail>(
        eventsKeys.detail(eventId)
      );
      if (previous) {
        queryClient.setQueryData<EventDetail>(eventsKeys.detail(eventId), {
          ...previous,
          isConfirmed: false,
          confirmedAt: null,
          confirmationsCount: Math.max(0, previous.confirmationsCount - 1),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          eventsKeys.detail(eventId),
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventsKeys.list() });
    },
  });
}

export function useCheckin(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckinRequest) => checkin(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventsKeys.list() });
    },
  });
}

export function useCreateComment(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => createComment(eventId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventsKeys.comments(eventId),
      });
      queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) });
    },
  });
}
