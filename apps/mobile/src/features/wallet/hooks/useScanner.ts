import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scanQrCode } from '../api/wallet.api';
import { walletKeys } from './useWallet';
import { useWalletStore } from '@/stores/wallet.store';

export function useScanQr() {
  const queryClient = useQueryClient();
  const setLastScanResult = useWalletStore((s) => s.setLastScanResult);
  const setIsProcessing = useWalletStore((s) => s.setIsProcessing);

  return useMutation({
    mutationFn: scanQrCode,
    onMutate: () => {
      setIsProcessing(true);
    },
    onSuccess: (result) => {
      setLastScanResult(result);
      // Refresh wallet dashboard after successful scan
      queryClient.invalidateQueries({ queryKey: walletKeys.dashboard() });
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });
}
