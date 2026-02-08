'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminEvents,
  getAdminEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  cancelEvent,
  pauseEvent,
  manualCheckin,
  getEventAnalytics,
  getEventParticipants,
} from '@/lib/api/events.api';
import type { EventCategory, EventStatus } from '@ahub/shared/types';
import type { CreateEventInput } from '@ahub/shared/validation';

const eventsAdminKeys = {
  all: ['admin', 'events'] as const,
  list: (query?: Record<string, unknown>) =>
    ['admin', 'events', 'list', query] as const,
  detail: (id: string) =>
    ['admin', 'events', 'detail', id] as const,
  analytics: (id: string) =>
    ['admin', 'events', 'analytics', id] as const,
  participants: (id: string, query?: Record<string, unknown>) =>
    ['admin', 'events', 'participants', id, query] as const,
};

export function useAdminEvents(query?: {
  page?: number;
  perPage?: number;
  filter?: string;
  status?: EventStatus;
  category?: EventCategory;
  search?: string;
}) {
  return useQuery({
    queryKey: eventsAdminKeys.list(query as Record<string, unknown>),
    queryFn: () => getAdminEvents(query),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useAdminEventDetail(eventId: string | null) {
  return useQuery({
    queryKey: eventsAdminKeys.detail(eventId || ''),
    queryFn: () => getAdminEventDetail(eventId!),
    enabled: !!eventId,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useAdminEventAnalytics(eventId: string | null) {
  return useQuery({
    queryKey: eventsAdminKeys.analytics(eventId || ''),
    queryFn: () => getEventAnalytics(eventId!),
    enabled: !!eventId,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useAdminEventParticipants(
  eventId: string | null,
  query?: { page?: number; perPage?: number; search?: string }
) {
  return useQuery({
    queryKey: eventsAdminKeys.participants(
      eventId || '',
      query as Record<string, unknown>
    ),
    queryFn: () => getEventParticipants(eventId!, query),
    enabled: !!eventId,
    staleTime: 30 * 1000,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventInput) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsAdminKeys.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: Partial<CreateEventInput>;
    }) => updateEvent(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsAdminKeys.all });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsAdminKeys.all });
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsAdminKeys.all });
    },
  });
}

export function useCancelEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      reason,
    }: {
      eventId: string;
      reason: string;
    }) => cancelEvent(eventId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsAdminKeys.all });
    },
  });
}

export function usePauseEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      isPaused,
    }: {
      eventId: string;
      isPaused: boolean;
    }) => pauseEvent(eventId, isPaused),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsAdminKeys.all });
    },
  });
}

export function useManualCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: { userId: string; checkinNumber: number; reason: string };
    }) => manualCheckin(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsAdminKeys.all });
    },
  });
}
