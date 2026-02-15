import { useQuery } from '@tanstack/react-query';
import {
  getProducts,
  getFeaturedProducts,
  getPromotionalProducts,
} from '../api/store.api';
import { storeKeys } from './useCategories';
import type {
  StoreProductsFilter,
  StoreProductsResponse,
  StoreProductListItem,
} from '@ahub/shared/types';

export function useProducts(filters?: StoreProductsFilter) {
  return useQuery<StoreProductsResponse>({
    queryKey: storeKeys.products(filters as Record<string, unknown>),
    queryFn: () => getProducts(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useFeaturedProducts() {
  return useQuery<StoreProductListItem[]>({
    queryKey: storeKeys.featuredProducts(),
    queryFn: getFeaturedProducts,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePromotionalProducts() {
  return useQuery<StoreProductListItem[]>({
    queryKey: storeKeys.promotionalProducts(),
    queryFn: getPromotionalProducts,
    staleTime: 5 * 60 * 1000,
  });
}
