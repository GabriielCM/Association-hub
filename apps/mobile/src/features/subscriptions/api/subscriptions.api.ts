import { get, post } from '@/services/api/client';
import type {
  PlansListResponse,
  SubscriptionPlanDetail,
  UserSubscription,
  SubscriptionBenefits,
  SubscriptionHistoryEntry,
} from '@ahub/shared/types';

export async function getPlans(): Promise<PlansListResponse> {
  return get<PlansListResponse>('/subscriptions/plans');
}

export async function getPlanDetails(
  planId: string
): Promise<SubscriptionPlanDetail> {
  return get<SubscriptionPlanDetail>(`/subscriptions/plans/${planId}`);
}

export async function getMySubscription(): Promise<UserSubscription | null> {
  return get<UserSubscription | null>('/subscriptions/my');
}

export async function subscribe(
  planId: string
): Promise<{ subscription: UserSubscription; message: string }> {
  return post('/subscriptions/subscribe', { planId });
}

export async function changePlan(
  planId: string
): Promise<{
  subscription: UserSubscription;
  previousPlan: { id: string; name: string };
  newPlan: { id: string; name: string };
  message: string;
}> {
  return post('/subscriptions/change', { planId });
}

export async function cancelSubscription(
  reason?: string
): Promise<{
  subscription: { id: string; status: string; cancelledAt: Date; benefitsUntil: Date };
  message: string;
}> {
  return post('/subscriptions/cancel', { reason });
}

export async function getSubscriptionHistory(
  page = 1,
  limit = 20
): Promise<{
  history: SubscriptionHistoryEntry[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  return get('/subscriptions/history', { page, limit });
}

export async function getBenefits(): Promise<SubscriptionBenefits> {
  return get<SubscriptionBenefits>('/subscriptions/benefits');
}
