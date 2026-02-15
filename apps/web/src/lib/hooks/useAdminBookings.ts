'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminBookings,
  getPendingBookings,
  approveBooking,
  rejectBooking,
  adminCancelBooking,
} from '@/lib/api/bookings.api';
import type { BookingStatus } from '@/lib/api/bookings.api';
import { spacesAdminKeys } from './useAdminSpaces';

// ===========================================
// QUERY KEYS
// ===========================================

export const bookingsAdminKeys = {
  all: ['admin', 'bookings'] as const,
  list: (query?: Record<string, unknown>) =>
    [...bookingsAdminKeys.all, 'list', query] as const,
  pending: () => [...bookingsAdminKeys.all, 'pending'] as const,
};

// ===========================================
// QUERIES
// ===========================================

export function useAdminBookings(query?: {
  status?: BookingStatus;
  spaceId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: bookingsAdminKeys.list(query as Record<string, unknown>),
    queryFn: () => getAdminBookings(query),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function usePendingBookings() {
  return useQuery({
    queryKey: bookingsAdminKeys.pending(),
    queryFn: () => getPendingBookings(),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}

// ===========================================
// MUTATIONS
// ===========================================

export function useApproveBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsAdminKeys.all });
      queryClient.invalidateQueries({ queryKey: spacesAdminKeys.all });
    },
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsAdminKeys.all });
      queryClient.invalidateQueries({ queryKey: spacesAdminKeys.all });
    },
  });
}

export function useAdminCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminCancelBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsAdminKeys.all });
      queryClient.invalidateQueries({ queryKey: spacesAdminKeys.all });
    },
  });
}
