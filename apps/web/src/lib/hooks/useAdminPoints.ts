'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConfig,
  updateConfig,
  grantPoints,
  deductPoints,
  refundTransaction,
  getReports,
} from '@/lib/api/points.api';
import type { AdminPointsConfig, AdminPointsReport } from '@ahub/shared/types';

const pointsAdminKeys = {
  config: ['admin', 'points', 'config'] as const,
  reports: (period: string) => ['admin', 'points', 'reports', period] as const,
};

export function usePointsConfig() {
  return useQuery<AdminPointsConfig>({
    queryKey: pointsAdminKeys.config,
    queryFn: getConfig,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pointsAdminKeys.config });
    },
  });
}

export function useGrantPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: grantPoints,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'points'] });
    },
  });
}

export function useDeductPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deductPoints,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'points'] });
    },
  });
}

export function useRefundTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason: string }) =>
      refundTransaction(transactionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'points'] });
    },
  });
}

export function usePointsReports(period: 'today' | 'week' | 'month' | 'year' = 'month') {
  return useQuery<AdminPointsReport>({
    queryKey: pointsAdminKeys.reports(period),
    queryFn: () => getReports(period),
    staleTime: 2 * 60 * 1000,
  });
}
