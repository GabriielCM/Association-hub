'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminPdvs,
  getAdminPdv,
  createPdv,
  updatePdv,
  deletePdv,
  regenerateCredentials,
  getPdvProducts,
  addPdvProduct,
  updatePdvProduct,
  removePdvProduct,
  getPdvStock,
  updatePdvStock,
  getPdvSales,
} from '@/lib/api/pdv.api';
import type {
  CreatePdvInput,
  CreatePdvProductInput,
  UpdateStockInput,
  PdvStatus,
} from '@/lib/api/pdv.api';

const pdvAdminKeys = {
  all: ['admin', 'pdv'] as const,
  list: () => ['admin', 'pdv', 'list'] as const,
  detail: (id: string) => ['admin', 'pdv', 'detail', id] as const,
  products: (id: string) => ['admin', 'pdv', 'products', id] as const,
  stock: (id: string) => ['admin', 'pdv', 'stock', id] as const,
  sales: (id: string, query?: Record<string, unknown>) =>
    ['admin', 'pdv', 'sales', id, query] as const,
};

// ===========================================
// PDV CRUD
// ===========================================

export function useAdminPdvs() {
  return useQuery({
    queryKey: pdvAdminKeys.list(),
    queryFn: () => getAdminPdvs(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminPdv(id: string | null) {
  return useQuery({
    queryKey: pdvAdminKeys.detail(id || ''),
    queryFn: () => getAdminPdv(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreatePdv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePdvInput) => createPdv(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdvAdminKeys.all });
    },
  });
}

export function useUpdatePdv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreatePdvInput> & { status?: PdvStatus };
    }) => updatePdv(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdvAdminKeys.all });
    },
  });
}

export function useDeletePdv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePdv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdvAdminKeys.all });
    },
  });
}

export function useRegenerateCredentials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: regenerateCredentials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdvAdminKeys.all });
    },
  });
}

// ===========================================
// PDV PRODUCTS
// ===========================================

export function useAdminPdvProducts(
  pdvId: string | null,
  query?: { includeInactive?: boolean }
) {
  return useQuery({
    queryKey: pdvAdminKeys.products(pdvId || ''),
    queryFn: () => getPdvProducts(pdvId!, query),
    enabled: !!pdvId,
    staleTime: 30 * 1000,
  });
}

export function useAddPdvProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pdvId,
      data,
    }: {
      pdvId: string;
      data: CreatePdvProductInput;
    }) => addPdvProduct(pdvId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdvAdminKeys.all });
    },
  });
}

export function useUpdatePdvProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pdvId,
      productId,
      data,
    }: {
      pdvId: string;
      productId: string;
      data: Partial<CreatePdvProductInput> & { isActive?: boolean };
    }) => updatePdvProduct(pdvId, productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdvAdminKeys.all });
    },
  });
}

export function useRemovePdvProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pdvId,
      productId,
    }: {
      pdvId: string;
      productId: string;
    }) => removePdvProduct(pdvId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdvAdminKeys.all });
    },
  });
}

// ===========================================
// STOCK
// ===========================================

export function useAdminPdvStock(pdvId: string | null) {
  return useQuery({
    queryKey: pdvAdminKeys.stock(pdvId || ''),
    queryFn: () => getPdvStock(pdvId!),
    enabled: !!pdvId,
    staleTime: 30 * 1000,
  });
}

export function useUpdatePdvStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pdvId,
      data,
    }: {
      pdvId: string;
      data: UpdateStockInput;
    }) => updatePdvStock(pdvId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdvAdminKeys.all });
    },
  });
}

// ===========================================
// SALES
// ===========================================

export function useAdminPdvSales(
  pdvId: string | null,
  query?: { startDate?: string; endDate?: string }
) {
  return useQuery({
    queryKey: pdvAdminKeys.sales(pdvId || '', query as Record<string, unknown>),
    queryFn: () => getPdvSales(pdvId!, query),
    enabled: !!pdvId,
    staleTime: 60 * 1000,
  });
}
