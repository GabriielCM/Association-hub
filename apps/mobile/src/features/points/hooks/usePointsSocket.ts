import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketEvent } from '@/providers/WebSocketProvider';
import { usePointsStore } from '@/stores/points.store';
import { pointsKeys } from './usePoints';
import type { UserPoints } from '@ahub/shared/types';

interface PointsUpdateEvent {
  type: 'credit' | 'debit';
  amount: number;
  source: string;
  newBalance: number;
}

interface CheckinConfirmedEvent {
  points: number;
  eventName: string;
  newBalance: number;
}

export function usePointsSocket() {
  const queryClient = useQueryClient();
  const { showCelebration, setCachedBalance } = usePointsStore();

  const updateBalanceImmediate = useCallback(
    (newBalance: number) => {
      // Immediately update React Query cache for instant UI feedback
      queryClient.setQueryData<UserPoints>(pointsKeys.balance(), (old) => {
        if (!old) return old;
        return { ...old, balance: newBalance };
      });
      // Also invalidate to get fresh full data from server
      queryClient.invalidateQueries({ queryKey: pointsKeys.balance() });
      queryClient.invalidateQueries({ queryKey: pointsKeys.history() });
      // Update Zustand cache for offline support
      setCachedBalance(newBalance);
    },
    [queryClient, setCachedBalance],
  );

  const handlePointsUpdate = useCallback(
    (data: unknown) => {
      const event = data as PointsUpdateEvent;
      updateBalanceImmediate(event.newBalance);
    },
    [updateBalanceImmediate],
  );

  const handleCheckinConfirmed = useCallback(
    (data: unknown) => {
      const event = data as CheckinConfirmedEvent;
      updateBalanceImmediate(event.newBalance);
      showCelebration(event.points, event.eventName);
    },
    [updateBalanceImmediate, showCelebration],
  );

  useSocketEvent('points_update', handlePointsUpdate);
  useSocketEvent('checkin_confirmed', handleCheckinConfirmed);
}
