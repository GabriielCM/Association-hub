import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  subscribe,
  changePlan,
  cancelSubscription,
} from '../api/subscriptions.api';
import { subscriptionKeys } from './usePlans';

export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => subscribe(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.my() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.benefits() });
    },
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => changePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.my() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.benefits() });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason?: string) => cancelSubscription(reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.my() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.benefits() });
    },
  });
}
