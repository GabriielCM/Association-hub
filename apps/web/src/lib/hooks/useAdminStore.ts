'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  setPromotion,
  removePromotion,
  updateProductStock,
  updateVariantStock,
  getPendingReviews,
  moderateReview,
} from '@/lib/api/store.api';
import type {
  CreateCategoryInput,
  CreateProductInput,
  CreateVariantInput,
  SetPromotionInput,
} from '@/lib/api/store.api';
import type { ProductType } from '@ahub/shared/types';

const storeAdminKeys = {
  all: ['admin', 'store'] as const,
  categories: () => ['admin', 'store', 'categories'] as const,
  products: () => ['admin', 'store', 'products'] as const,
  productList: (query?: Record<string, unknown>) =>
    ['admin', 'store', 'products', 'list', query] as const,
  productDetail: (id: string) =>
    ['admin', 'store', 'products', 'detail', id] as const,
  reviews: () => ['admin', 'store', 'reviews'] as const,
};

// ===========================================
// CATEGORIES
// ===========================================

export function useAdminCategories() {
  return useQuery({
    queryKey: storeAdminKeys.categories(),
    queryFn: () => getAdminCategories(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryInput) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCategoryInput> & { isActive?: boolean };
    }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}

// ===========================================
// PRODUCTS
// ===========================================

export function useAdminProducts(query?: {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: string;
  type?: ProductType;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: storeAdminKeys.productList(query as Record<string, unknown>),
    queryFn: () => getAdminProducts(query),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useAdminProduct(id: string | null) {
  return useQuery({
    queryKey: storeAdminKeys.productDetail(id || ''),
    queryFn: () => getAdminProduct(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductInput) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateProductInput> & { isActive?: boolean; isFeatured?: boolean };
    }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}

// ===========================================
// VARIANTS
// ===========================================

export function useCreateVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: CreateVariantInput;
    }) => createVariant(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: string;
      variantId: string;
      data: Partial<CreateVariantInput> & { isActive?: boolean };
    }) => updateVariant(productId, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      variantId,
    }: {
      productId: string;
      variantId: string;
    }) => deleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}

// ===========================================
// PROMOTIONS
// ===========================================

export function useSetPromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: SetPromotionInput;
    }) => setPromotion(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}

export function useRemovePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}

// ===========================================
// STOCK
// ===========================================

export function useUpdateProductStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      stockCount,
    }: {
      productId: string;
      stockCount: number;
    }) => updateProductStock(productId, stockCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}

export function useUpdateVariantStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      stockCount,
    }: {
      productId: string;
      variantId: string;
      stockCount: number;
    }) => updateVariantStock(productId, variantId, stockCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}

// ===========================================
// REVIEWS
// ===========================================

export function useAdminPendingReviews() {
  return useQuery({
    queryKey: storeAdminKeys.reviews(),
    queryFn: () => getPendingReviews(),
    staleTime: 30 * 1000,
  });
}

export function useModerateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
    }) => moderateReview(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeAdminKeys.all });
    },
  });
}
