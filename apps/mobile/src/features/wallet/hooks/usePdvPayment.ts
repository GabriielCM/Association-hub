import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCheckoutDetails, payPdvCheckout } from '../api/wallet.api';
import { walletKeys } from './useWallet';

export const pdvKeys = {
  all: ['pdv'] as const,
  checkout: (code: string) => [...pdvKeys.all, 'checkout', code] as const,
};

export function useCheckoutDetails(code: string) {
  return useQuery({
    queryKey: pdvKeys.checkout(code),
    queryFn: () => getCheckoutDetails(code),
    enabled: !!code,
    staleTime: 0, // Always fresh - checkout can expire
    refetchInterval: 15_000, // Poll every 15s for expiry
  });
}

export function usePdvPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payPdvCheckout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.dashboard() });
    },
  });
}
