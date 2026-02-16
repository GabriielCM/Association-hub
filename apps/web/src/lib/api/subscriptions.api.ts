import { api } from './client';
import type {
  ApiResponse,
  SubscriptionPlan,
  PlanMutators,
  AdminSubscriberEntry,
  AdminSubscriptionReport,
} from '@ahub/shared/types';

export interface AdminPlansResponse {
  plans: Array<SubscriptionPlan & { isActive: boolean; subscribersCount: number; createdAt: Date; updatedAt: Date }>;
  stats: {
    totalPlans: number;
    activePlans: number;
    totalSubscribers: number;
    monthlyRevenue: number;
  };
}

export async function getPlans(): Promise<AdminPlansResponse> {
  const response = await api.get<ApiResponse<AdminPlansResponse>>(
    '/admin/subscriptions/plans'
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao buscar planos');
  }
  return response.data.data;
}

export async function createPlan(data: {
  name: string;
  description: string;
  priceMonthly: number;
  iconUrl?: string;
  color?: string;
  displayOrder?: number;
  mutators?: PlanMutators;
}): Promise<{ plan: SubscriptionPlan; message: string }> {
  const response = await api.post<ApiResponse<{ plan: SubscriptionPlan; message: string }>>(
    '/admin/subscriptions/plans',
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao criar plano');
  }
  return response.data.data;
}

export async function updatePlan(
  planId: string,
  data: Partial<{
    name: string;
    description: string;
    priceMonthly: number;
    iconUrl: string;
    color: string;
    displayOrder: number;
    mutators: PlanMutators;
  }>
): Promise<{ plan: SubscriptionPlan; message: string }> {
  const response = await api.put<ApiResponse<{ plan: SubscriptionPlan; message: string }>>(
    `/admin/subscriptions/plans/${planId}`,
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao atualizar plano');
  }
  return response.data.data;
}

export async function deletePlan(planId: string): Promise<void> {
  const response = await api.delete<ApiResponse<void>>(
    `/admin/subscriptions/plans/${planId}`
  );
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Falha ao desativar plano');
  }
}

export async function getSubscribers(query?: {
  page?: number | undefined;
  limit?: number | undefined;
  planId?: string | undefined;
  status?: string | undefined;
  search?: string | undefined;
}): Promise<{
  subscribers: AdminSubscriberEntry[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const response = await api.get<ApiResponse<{
    subscribers: AdminSubscriberEntry[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>>('/admin/subscriptions/subscribers', { params: query });
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao buscar assinantes');
  }
  return response.data.data;
}

export async function suspendUser(
  userId: string,
  reason: string
): Promise<{ message: string }> {
  const response = await api.post<ApiResponse<{ message: string }>>(
    `/admin/subscriptions/users/${userId}/suspend`,
    { reason }
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao suspender assinatura');
  }
  return response.data.data;
}

export async function activateUser(
  userId: string
): Promise<{ message: string }> {
  const response = await api.post<ApiResponse<{ message: string }>>(
    `/admin/subscriptions/users/${userId}/activate`
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao reativar assinatura');
  }
  return response.data.data;
}

export async function getReport(
  period: '7d' | '30d' | '90d' | '12m' = '30d'
): Promise<AdminSubscriptionReport> {
  const response = await api.get<ApiResponse<AdminSubscriptionReport>>(
    '/admin/subscriptions/report',
    { params: { period } }
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao buscar relatório');
  }
  return response.data.data;
}
