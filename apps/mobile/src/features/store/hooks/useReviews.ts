import { useQuery } from '@tanstack/react-query';
import { getProductReviews } from '../api/store.api';
import { storeKeys } from './useCategories';
import type { ProductReview } from '@ahub/shared/types';

export function useProductReviews(productId: string) {
  return useQuery<ProductReview[]>({
    queryKey: storeKeys.reviews(productId),
    queryFn: () => getProductReviews(productId),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });
}
