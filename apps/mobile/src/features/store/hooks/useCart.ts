import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../api/store.api';
import { storeKeys } from './useCategories';
import type { Cart } from '@ahub/shared/types';

export function useCart() {
  return useQuery<Cart>({
    queryKey: storeKeys.cart(),
    queryFn: getCart,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      productId: string;
      variantId?: string;
      quantity: number;
    }) => addToCart(data),
    onSuccess: (cart) => {
      queryClient.setQueryData(storeKeys.cart(), cart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: storeKeys.cart() });
      const previous = queryClient.getQueryData<Cart>(storeKeys.cart());

      if (previous) {
        const updated: Cart = {
          ...previous,
          items: previous.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity,
                  totalPoints: item.unitPricePoints * quantity,
                  totalMoney: item.unitPriceMoney * quantity,
                }
              : item,
          ),
        };
        queryClient.setQueryData(storeKeys.cart(), updated);
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(storeKeys.cart(), context.previous);
      }
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(storeKeys.cart(), cart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: storeKeys.cart() });
      const previous = queryClient.getQueryData<Cart>(storeKeys.cart());

      if (previous) {
        const updated: Cart = {
          ...previous,
          items: previous.items.filter((item) => item.id !== itemId),
        };
        queryClient.setQueryData(storeKeys.cart(), updated);
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(storeKeys.cart(), context.previous);
      }
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(storeKeys.cart(), cart);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.cart() });
    },
  });
}
