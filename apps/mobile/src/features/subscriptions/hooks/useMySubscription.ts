import { useQuery } from '@tanstack/react-query';
import { getMySubscription, getBenefits } from '../api/subscriptions.api';
import { subscriptionKeys } from './usePlans';
import type { UserSubscription, SubscriptionBenefits } from '@ahub/shared/types';

export function useMySubscription() {
  return useQuery<UserSubscription | null>({
    queryKey: subscriptionKeys.my(),
    queryFn: getMySubscription,
    staleTime: 60 * 1000, // 1 min
  });
}

export function useBenefits() {
  return useQuery<SubscriptionBenefits>({
    queryKey: subscriptionKeys.benefits(),
    queryFn: getBenefits,
    staleTime: 60 * 1000,
  });
}
