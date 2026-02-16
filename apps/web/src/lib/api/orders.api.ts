import { api } from './client';
import type { ApiResponse, SalesReport, OrdersSummaryCounters } from '@ahub/shared/types';

// ===========================================
// RESPONSE INTERFACES
// ===========================================

export interface OrderItem {
  id: string;
  orderNumber: string;
  code?: string;
  userId: string;
  userName?: string;
  source: string;
  status: string;
  items: {
    id?: string;
    productId: string;
    productName: string;
    productImage?: string;
    variantName?: string;
    quantity: number;
    unitPricePoints: number;
    unitPriceMoney: number;
    totalPoints?: number;
    totalMoney?: number;
  }[];
  paymentMethod: string;
  totalPoints: number;
  totalMoney: number;
  pointsUsed?: number;
  moneyPaid?: number | string;
  cashbackEarned: number;
  pickupCode?: string;
  pickupLocation?: string;
  statusHistory?: Array<{ status: string; label: string; description?: string; createdAt: string }>;
  timeline?: Array<{ status: string; label: string; description?: string; createdAt: string }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersPagination {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalCount: number;
}

// ===========================================
// QUERY INTERFACES
// ===========================================

export interface GetAdminOrdersQuery {
  status?: string | undefined;
  source?: string | undefined;
  search?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface GetOrdersReportQuery {
  period?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: string;
}

export interface UpdateOrderStatusInput {
  status: string;
  notes?: string;
}

export interface BatchUpdateStatusInput {
  orderIds: string[];
  status: string;
  notes?: string;
}

export interface CancelOrderInput {
  reason: string;
  refundPoints?: boolean;
  refundMoney?: boolean;
}

// ===========================================
// ADMIN ORDERS
// ===========================================

export async function getAdminOrders(
  query: GetAdminOrdersQuery
): Promise<{ data: OrderItem[]; pagination: OrdersPagination }> {
  const response = await api.get<ApiResponse<OrderItem[]>>('/admin/orders', {
    params: query,
  });
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Falha ao buscar pedidos');
  }
  return {
    data: response.data.data as OrderItem[],
    pagination: (response.data as any).pagination,
  };
}

export async function getAdminOrder(id: string): Promise<OrderItem> {
  const response = await api.get<ApiResponse<OrderItem>>(
    `/admin/orders/${id}`
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Falha ao buscar pedido');
  }
  return response.data.data;
}

export async function getOrdersSummary(): Promise<OrdersSummaryCounters> {
  const response = await api.get<ApiResponse<OrdersSummaryCounters>>(
    '/admin/orders/summary'
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.error?.message || 'Falha ao buscar resumo de pedidos'
    );
  }
  return response.data.data;
}

// ===========================================
// ORDER STATUS
// ===========================================

export async function updateOrderStatus(
  id: string,
  data: UpdateOrderStatusInput
): Promise<OrderItem> {
  const response = await api.patch<ApiResponse<OrderItem>>(
    `/admin/orders/${id}/status`,
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.error?.message || 'Falha ao atualizar status do pedido'
    );
  }
  return response.data.data;
}

export async function batchUpdateStatus(
  data: BatchUpdateStatusInput
): Promise<{ updated: number }> {
  const response = await api.post<ApiResponse<{ updated: number }>>(
    '/admin/orders/batch/status',
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.error?.message ||
        'Falha ao atualizar status dos pedidos em lote'
    );
  }
  return response.data.data;
}

export async function cancelOrder(
  id: string,
  data: CancelOrderInput
): Promise<OrderItem> {
  const response = await api.post<ApiResponse<OrderItem>>(
    `/admin/orders/${id}/cancel`,
    data
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.error?.message || 'Falha ao cancelar pedido'
    );
  }
  return response.data.data;
}

// ===========================================
// PICKUP & COMPLETE
// ===========================================

export async function validatePickup(
  code: string
): Promise<OrderItem> {
  const response = await api.post<ApiResponse<OrderItem>>(
    '/admin/orders/pickup/validate',
    { code }
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.error?.message || 'Falha ao validar retirada'
    );
  }
  return response.data.data;
}

export async function completeOrder(id: string): Promise<OrderItem> {
  const response = await api.post<ApiResponse<OrderItem>>(
    `/admin/orders/${id}/complete`
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.error?.message || 'Falha ao concluir pedido'
    );
  }
  return response.data.data;
}

// ===========================================
// REPORTS
// ===========================================

export async function getOrdersReport(
  query: GetOrdersReportQuery
): Promise<SalesReport> {
  const response = await api.get<ApiResponse<SalesReport>>(
    '/admin/orders/reports/sales',
    { params: query }
  );
  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.error?.message || 'Falha ao buscar relatório de vendas'
    );
  }
  return response.data.data;
}

export async function exportOrdersCsv(
  query: { period?: string; startDate?: string; endDate?: string }
): Promise<Blob> {
  const response = await api.get('/admin/orders/reports/export', {
    params: query,
    responseType: 'blob',
  });
  return response.data;
}
