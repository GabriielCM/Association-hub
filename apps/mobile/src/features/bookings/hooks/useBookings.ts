import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getMyBookings,
  getBooking,
  createBooking,
  cancelBooking,
  joinWaitlist,
  getWaitlistPosition,
  leaveWaitlist,
  confirmWaitlistSlot,
} from '../api/bookings.api';
import { spacesKeys } from '../../spaces/hooks/useSpaces';
import type {
  MyBookingsFilter,
  MyBookingsResponse,
  CreateBookingInput,
  JoinWaitlistInput,
} from '@ahub/shared/types';

export const bookingsKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingsKeys.all, 'list'] as const,
  list: (filters: MyBookingsFilter) =>
    [...bookingsKeys.lists(), filters] as const,
  details: () => [...bookingsKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingsKeys.details(), id] as const,
  waitlist: () => [...bookingsKeys.all, 'waitlist'] as const,
};

export function useMyBookings(filters: MyBookingsFilter = {}) {
  return useInfiniteQuery<MyBookingsResponse>({
    queryKey: bookingsKeys.list(filters),
    queryFn: ({ pageParam }) =>
      getMyBookings({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 30_000,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingsKeys.detail(id),
    queryFn: () => getBooking(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => createBooking(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.all });
      queryClient.invalidateQueries({ queryKey: spacesKeys.all });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.all });
      queryClient.invalidateQueries({ queryKey: spacesKeys.all });
    },
  });
}

export function useWaitlistPosition() {
  return useQuery({
    queryKey: bookingsKeys.waitlist(),
    queryFn: getWaitlistPosition,
    staleTime: 30_000,
  });
}

export function useJoinWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: JoinWaitlistInput) => joinWaitlist(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.waitlist() });
    },
  });
}

export function useLeaveWaitlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveWaitlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.waitlist() });
    },
  });
}

export function useConfirmWaitlistSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmWaitlistSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.all });
      queryClient.invalidateQueries({ queryKey: bookingsKeys.waitlist() });
    },
  });
}
