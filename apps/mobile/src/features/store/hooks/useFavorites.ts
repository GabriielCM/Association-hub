import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFavorites, toggleFavorite } from '../api/store.api';
import { storeKeys } from './useCategories';
import type { FavoriteItem } from '@ahub/shared/types';

export function useFavorites() {
  return useQuery<FavoriteItem[]>({
    queryKey: storeKeys.favorites(),
    queryFn: getFavorites,
    staleTime: 2 * 60 * 1000,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => toggleFavorite(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.favorites() });
      // Also invalidate product queries since isFavorited may have changed
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
}
