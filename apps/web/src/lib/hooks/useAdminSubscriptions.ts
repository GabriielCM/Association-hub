'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getSubscribers,
  suspendUser,
  activateUser,
  getReport,
} from '@/lib/api/subscriptions.api';
import type { AdminSubscriptionReport } from '@ahub/shared/types';

const subsAdminKeys = {
  plans: ['admin', 'subscriptions', 'plans'] as const,
  subscribers: (query?: Record<string, unknown>) =>
    ['admin', 'subscriptions', 'subscribers', query] as const,
  report: (period: string) => ['admin', 'subscriptions', 'report', period] as const,
};

export function useAdminPlans() {
  return useQuery({
    queryKey: subsAdminKeys.plans,
    queryFn: getPlans,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subsAdminKeys.plans });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: Parameters<typeof updatePlan>[1] }) =>
      updatePlan(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subsAdminKeys.plans });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subsAdminKeys.plans });
    },
  });
}

export function useSubscribers(query?: {
  page?: number | undefined;
  limit?: number | undefined;
  planId?: string | undefined;
  status?: string | undefined;
  search?: string | undefined;
}) {
  return useQuery({
    queryKey: subsAdminKeys.subscribers(query as Record<string, unknown>),
    queryFn: () => getSubscribers(query),
    staleTime: 2 * 60 * 1000,
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions', 'subscribers'] });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions', 'subscribers'] });
    },
  });
}

export function useSubscriptionReport(period: '7d' | '30d' | '90d' | '12m' = '30d') {
  return useQuery<AdminSubscriptionReport>({
    queryKey: subsAdminKeys.report(period),
    queryFn: () => getReport(period),
    staleTime: 5 * 60 * 1000,
  });
}
