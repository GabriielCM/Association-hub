import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStravaStatus,
  connectStrava,
  syncStrava,
  disconnectStrava,
} from '../api/strava.api';
import { walletKeys } from './useWallet';

export const stravaKeys = {
  all: ['strava'] as const,
  status: () => [...stravaKeys.all, 'status'] as const,
};

export function useStravaStatus() {
  return useQuery({
    queryKey: stravaKeys.status(),
    queryFn: getStravaStatus,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useStravaConnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: connectStrava,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stravaKeys.status() });
      queryClient.invalidateQueries({ queryKey: walletKeys.dashboard() });
    },
  });
}

export function useStravaSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncStrava,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stravaKeys.status() });
      queryClient.invalidateQueries({ queryKey: walletKeys.dashboard() });
    },
  });
}

export function useStravaDisconnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectStrava,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stravaKeys.status() });
      queryClient.invalidateQueries({ queryKey: walletKeys.dashboard() });
    },
  });
}
