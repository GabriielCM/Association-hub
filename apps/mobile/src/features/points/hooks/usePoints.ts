import { useQuery } from '@tanstack/react-query';
import { getBalance, getSummary } from '../api/points.api';
import type { UserPoints, PointsSummary } from '@ahub/shared/types';

export const pointsKeys = {
  all: ['points'] as const,
  balance: () => [...pointsKeys.all, 'balance'] as const,
  summary: (period: string) => [...pointsKeys.all, 'summary', period] as const,
  history: () => [...pointsKeys.all, 'history'] as const,
  historyFiltered: (filters: Record<string, unknown>) =>
    [...pointsKeys.history(), filters] as const,
};

export function useBalance() {
  return useQuery<UserPoints>({
    queryKey: pointsKeys.balance(),
    queryFn: getBalance,
    staleTime: 60 * 1000, // 1 min
  });
}

export function useSummary(
  period: 'today' | 'week' | 'month' | 'year' = 'month'
) {
  return useQuery<PointsSummary>({
    queryKey: pointsKeys.summary(period),
    queryFn: () => getSummary(period),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
