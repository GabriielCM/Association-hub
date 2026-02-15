import { useQuery } from '@tanstack/react-query';
import { getProductBySlug } from '../api/store.api';
import { storeKeys } from './useCategories';
import type { StoreProduct } from '@ahub/shared/types';

export function useProduct(slug: string) {
  return useQuery<StoreProduct>({
    queryKey: storeKeys.product(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
    staleTime: 60 * 1000,
  });
}
