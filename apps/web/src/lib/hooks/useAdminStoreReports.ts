'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getStoreReport,
  getProductSalesReport,
  getLowStockProducts,
} from '@/lib/api/store.api';
import type { ReportPeriod } from '@ahub/shared/types';

const storeReportKeys = {
  all: ['admin', 'store', 'reports'] as const,
  sales: (period?: string) => ['admin', 'store', 'reports', 'sales', period] as const,
  products: (period?: string) => ['admin', 'store', 'reports', 'products', period] as const,
  lowStock: () => ['admin', 'store', 'low-stock'] as const,
};

export function useStoreReport(period: ReportPeriod) {
  return useQuery({
    queryKey: storeReportKeys.sales(period),
    queryFn: () => getStoreReport({ period }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductSalesReport(period: ReportPeriod) {
  return useQuery({
    queryKey: storeReportKeys.products(period),
    queryFn: () => getProductSalesReport({ period }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: storeReportKeys.lowStock(),
    queryFn: () => getLowStockProducts(),
    staleTime: 2 * 60 * 1000,
  });
}
