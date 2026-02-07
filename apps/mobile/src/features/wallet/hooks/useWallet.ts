import { useQuery } from '@tanstack/react-query';
import { getWalletDashboard, getWalletSummary } from '../api/wallet.api';
import { useWalletStore } from '@/stores/wallet.store';
import type { WalletSummaryPeriod } from '@ahub/shared/types';

export const walletKeys = {
  all: ['wallet'] as const,
  dashboard: () => [...walletKeys.all, 'dashboard'] as const,
  summary: (period: WalletSummaryPeriod) =>
    [...walletKeys.all, 'summary', period] as const,
};

export function useWalletDashboard() {
  const setCachedBalance = useWalletStore((s) => s.setCachedBalance);

  return useQuery({
    queryKey: walletKeys.dashboard(),
    queryFn: async () => {
      const data = await getWalletDashboard();
      setCachedBalance(data.balance);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWalletSummary(period: WalletSummaryPeriod = 'month') {
  return useQuery({
    queryKey: walletKeys.summary(period),
    queryFn: () => getWalletSummary(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
