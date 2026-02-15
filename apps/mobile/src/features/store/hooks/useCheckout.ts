import { useMutation, useQueryClient } from '@tanstack/react-query';
import { validateCheckout, processCheckout } from '../api/store.api';
import { storeKeys } from './useCategories';
import { walletKeys } from '@/features/wallet/hooks/useWallet';
import type { OrderPaymentMethod } from '@ahub/shared/types';

export function useValidateCheckout() {
  return useMutation({
    mutationFn: (subscriptionPlanId?: string) =>
      validateCheckout(subscriptionPlanId),
  });
}

export function useProcessCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      paymentMethod: OrderPaymentMethod;
      pointsToUse?: number;
    }) => processCheckout(data),
    onSuccess: (result) => {
      // For POINTS payment, cart and wallet are already updated on backend
      if ('orderId' in result) {
        queryClient.invalidateQueries({ queryKey: storeKeys.cart() });
        queryClient.invalidateQueries({ queryKey: walletKeys.dashboard() });
      }
      // For CARD/MIXED, webhook will handle backend state
      // We invalidate after PaymentSheet completes (in the payment screen)
    },
  });
}
