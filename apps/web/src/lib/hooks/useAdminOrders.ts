'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminOrders,
  getAdminOrder,
  getOrdersSummary,
  updateOrderStatus,
  batchUpdateStatus,
  cancelOrder,
  validatePickup,
  completeOrder,
  getOrdersReport,
} from '@/lib/api/orders.api';
import type {
  GetAdminOrdersQuery,
  GetOrdersReportQuery,
  UpdateOrderStatusInput,
  BatchUpdateStatusInput,
  CancelOrderInput,
} from '@/lib/api/orders.api';

const ordersAdminKeys = {
  all: ['admin', 'orders'] as const,
  list: (query?: Record<string, unknown>) =>
    ['admin', 'orders', 'list', query] as const,
  detail: (id: string) => ['admin', 'orders', 'detail', id] as const,
  summary: () => ['admin', 'orders', 'summary'] as const,
  report: (query?: Record<string, unknown>) =>
    ['admin', 'orders', 'report', query] as const,
};

// ===========================================
// ORDERS QUERIES
// ===========================================

export function useAdminOrders(query: GetAdminOrdersQuery) {
  return useQuery({
    queryKey: ordersAdminKeys.list(query as Record<string, unknown>),
    queryFn: () => getAdminOrders(query),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ordersAdminKeys.detail(id),
    queryFn: () => getAdminOrder(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useOrdersSummary() {
  return useQuery({
    queryKey: ordersAdminKeys.summary(),
    queryFn: () => getOrdersSummary(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useOrdersReport(query: GetOrdersReportQuery) {
  return useQuery({
    queryKey: ordersAdminKeys.report(query as Record<string, unknown>),
    queryFn: () => getOrdersReport(query),
    staleTime: 2 * 60 * 1000,
  });
}

// ===========================================
// ORDER STATUS MUTATIONS
// ===========================================

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateOrderStatusInput;
    }) => updateOrderStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersAdminKeys.all });
    },
  });
}

export function useBatchUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchUpdateStatusInput) => batchUpdateStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersAdminKeys.all });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CancelOrderInput;
    }) => cancelOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersAdminKeys.all });
    },
  });
}

// ===========================================
// PICKUP & COMPLETE MUTATIONS
// ===========================================

export function useValidatePickup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => validatePickup(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersAdminKeys.all });
    },
  });
}

export function useCompleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersAdminKeys.all });
    },
  });
}
