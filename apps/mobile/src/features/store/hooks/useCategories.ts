import { useQuery } from '@tanstack/react-query';
import { getCategories, getCategoryBySlug } from '../api/store.api';
import type { StoreCategory } from '@ahub/shared/types';

export const storeKeys = {
  all: ['store'] as const,
  categories: () => [...storeKeys.all, 'categories'] as const,
  category: (slug: string) => [...storeKeys.all, 'category', slug] as const,
  products: (filters?: Record<string, unknown>) =>
    [...storeKeys.all, 'products', filters] as const,
  featuredProducts: () => [...storeKeys.all, 'products', 'featured'] as const,
  promotionalProducts: () =>
    [...storeKeys.all, 'products', 'promotional'] as const,
  product: (slug: string) => [...storeKeys.all, 'product', slug] as const,
  favorites: () => [...storeKeys.all, 'favorites'] as const,
  cart: () => [...storeKeys.all, 'cart'] as const,
  reviews: (productId: string) =>
    [...storeKeys.all, 'reviews', productId] as const,
};

export function useCategories() {
  return useQuery<StoreCategory[]>({
    queryKey: storeKeys.categories(),
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery<StoreCategory>({
    queryKey: storeKeys.category(slug),
    queryFn: () => getCategoryBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
