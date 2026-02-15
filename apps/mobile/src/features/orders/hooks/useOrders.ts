import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getOrders,
  getOrder,
  getOrderReceipt,
  getOrderVouchers,
  getMyVouchers,
} from '../api/orders.api';
import type { OrdersFilter, OrdersListResponse } from '@ahub/shared/types';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrdersFilter) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  receipt: (id: string) => [...orderKeys.all, 'receipt', id] as const,
  vouchers: (id: string) => [...orderKeys.all, 'vouchers', id] as const,
  myVouchers: () => [...orderKeys.all, 'my-vouchers'] as const,
};

export function useOrders(filters: OrdersFilter = {}) {
  return useInfiniteQuery<OrdersListResponse>({
    queryKey: orderKeys.list(filters),
    queryFn: ({ pageParam }) =>
      getOrders({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 30_000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrder(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useOrderReceipt(id: string) {
  return useQuery({
    queryKey: orderKeys.receipt(id),
    queryFn: () => getOrderReceipt(id),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useOrderVouchers(id: string) {
  return useQuery({
    queryKey: orderKeys.vouchers(id),
    queryFn: () => getOrderVouchers(id),
    enabled: !!id,
  });
}

export function useMyVouchers() {
  return useQuery({
    queryKey: orderKeys.myVouchers(),
    queryFn: getMyVouchers,
    staleTime: 60_000,
  });
}
