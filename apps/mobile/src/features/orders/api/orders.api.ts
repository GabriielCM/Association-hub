import { get } from '@/services/api/client';
import type {
  Order,
  OrdersFilter,
  OrdersListResponse,
  OrderReceipt,
  Voucher,
} from '@ahub/shared/types';

export async function getOrders(
  filters?: OrdersFilter,
): Promise<OrdersListResponse> {
  return get<OrdersListResponse>('/orders', filters);
}

export async function getOrder(id: string): Promise<Order> {
  return get<Order>(`/orders/${id}`);
}

export async function getOrderReceipt(id: string): Promise<OrderReceipt> {
  return get<OrderReceipt>(`/orders/${id}/receipt`);
}

export async function getOrderVouchers(id: string): Promise<Voucher[]> {
  return get<Voucher[]>(`/orders/${id}/vouchers`);
}

export async function getMyVouchers(): Promise<Voucher[]> {
  return get<Voucher[]>('/orders/vouchers');
}
