import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transferPoints } from '../api/points.api';
import { pointsKeys } from './usePoints';
import type { TransferResult, UserPoints } from '@ahub/shared/types';

export function useTransfer() {
  const queryClient = useQueryClient();

  return useMutation<
    TransferResult,
    Error,
    { recipientId: string; amount: number; message?: string }
  >({
    mutationFn: transferPoints,
    onSuccess: (result) => {
      // Immediately update balance in cache for instant UI feedback
      queryClient.setQueryData<UserPoints>(pointsKeys.balance(), (old) => {
        if (!old) return old;
        return { ...old, balance: result.senderBalanceAfter };
      });
      // Also invalidate to get fresh full data from server
      queryClient.invalidateQueries({ queryKey: pointsKeys.balance() });
      queryClient.invalidateQueries({ queryKey: pointsKeys.history() });
    },
  });
}
