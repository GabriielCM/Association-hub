'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPartners,
  getPartnerDetail,
  createPartner,
  updatePartner,
  deletePartner,
  getCategories,
  createCategory,
  updateCategory,
} from '@/lib/api/partners.api';

const partnersAdminKeys = {
  all: ['admin', 'partners'] as const,
  partners: (query?: Record<string, unknown>) =>
    ['admin', 'partners', 'list', query] as const,
  partner: (id: string) =>
    ['admin', 'partners', 'detail', id] as const,
  categories: ['admin', 'partners', 'categories'] as const,
};

export function useAdminPartners(query?: {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: partnersAdminKeys.partners(query as Record<string, unknown>),
    queryFn: () => getPartners(query),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminPartnerDetail(partnerId: string | null) {
  return useQuery({
    queryKey: partnersAdminKeys.partner(partnerId || ''),
    queryFn: () => getPartnerDetail(partnerId!),
    enabled: !!partnerId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnersAdminKeys.all });
    },
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ partnerId, data }: { partnerId: string; data: Parameters<typeof updatePartner>[1] }) =>
      updatePartner(partnerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnersAdminKeys.all });
    },
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnersAdminKeys.all });
    },
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: partnersAdminKeys.categories,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnersAdminKeys.categories });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: Parameters<typeof updateCategory>[1] }) =>
      updateCategory(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnersAdminKeys.categories });
    },
  });
}
