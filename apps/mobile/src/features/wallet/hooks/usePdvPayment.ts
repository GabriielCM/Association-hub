import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCheckoutDetails,
  payPdvCheckout,
  initiatePixPayment,
  getPixStatus,
} from '../api/wallet.api';
import { walletKeys } from './useWallet';

export const pdvKeys = {
  all: ['pdv'] as const,
  checkout: (code: string) => [...pdvKeys.all, 'checkout', code] as const,
  pixStatus: (code: string) => [...pdvKeys.all, 'pix-status', code] as const,
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

export function useInitiatePixPayment() {
  return useMutation({
    mutationFn: (code: string) => initiatePixPayment(code),
  });
}

export function usePixStatus(code: string, enabled: boolean) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: pdvKeys.pixStatus(code),
    queryFn: () => getPixStatus(code),
    enabled: !!code && enabled,
    staleTime: 0,
    refetchInterval: 3_000, // Poll every 3s for PIX payment status
    select: (data) => {
      // Auto-invalidate wallet when paid
      if (data.status === 'PAID') {
        queryClient.invalidateQueries({ queryKey: walletKeys.dashboard() });
      }
      return data;
    },
  });
}
