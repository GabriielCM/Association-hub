import { useQuery } from '@tanstack/react-query';
import { listEvents, getEvent, getComments } from '../api/events.api';
import type {
  EventsListResponse,
  EventDetail,
  EventCommentsResponse,
  EventsFilterParams,
} from '@ahub/shared/types';

export const eventsKeys = {
  all: ['events'] as const,
  list: (filters?: EventsFilterParams) =>
    [...eventsKeys.all, 'list', filters ?? {}] as const,
  detail: (id: string) => [...eventsKeys.all, 'detail', id] as const,
  comments: (id: string, params?: { page?: number }) =>
    [...eventsKeys.all, 'comments', id, params ?? {}] as const,
};

export function useEvents(filters?: EventsFilterParams) {
  return useQuery<EventsListResponse>({
    queryKey: eventsKeys.list(filters),
    queryFn: () => listEvents(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useEvent(eventId: string) {
  return useQuery<EventDetail>({
    queryKey: eventsKeys.detail(eventId),
    queryFn: () => getEvent(eventId),
    staleTime: 60 * 1000, // 1 minute
    enabled: !!eventId,
  });
}

export function useEventComments(
  eventId: string,
  params?: { page?: number; perPage?: number }
) {
  return useQuery<EventCommentsResponse>({
    queryKey: eventsKeys.comments(eventId, params),
    queryFn: () => getComments(eventId, params),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!eventId,
  });
}
