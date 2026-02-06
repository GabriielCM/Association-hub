import { useQuery } from '@tanstack/react-query';
import { getPlans, getPlanDetails } from '../api/subscriptions.api';
import type { PlansListResponse, SubscriptionPlanDetail } from '@ahub/shared/types';

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  planDetail: (id: string) => [...subscriptionKeys.all, 'plans', id] as const,
  my: () => [...subscriptionKeys.all, 'my'] as const,
  benefits: () => [...subscriptionKeys.all, 'benefits'] as const,
  history: () => [...subscriptionKeys.all, 'history'] as const,
};

export function usePlans() {
  return useQuery<PlansListResponse>({
    queryKey: subscriptionKeys.plans(),
    queryFn: getPlans,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlanDetails(planId: string) {
  return useQuery<SubscriptionPlanDetail>({
    queryKey: subscriptionKeys.planDetail(planId),
    queryFn: () => getPlanDetails(planId),
    enabled: !!planId,
    staleTime: 5 * 60 * 1000,
  });
}
