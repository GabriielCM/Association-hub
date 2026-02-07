import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getCard, getQrCode, getCardHistory } from '../api/card.api';
import { useCardStore } from '@/stores/card.store';
import type { MemberCard, CardQrCode } from '@ahub/shared/types';

export const cardKeys = {
  all: ['card'] as const,
  detail: () => [...cardKeys.all, 'detail'] as const,
  status: () => [...cardKeys.all, 'status'] as const,
  qrCode: () => [...cardKeys.all, 'qrcode'] as const,
  history: () => [...cardKeys.all, 'history'] as const,
  historyFiltered: (filters: Record<string, unknown>) =>
    [...cardKeys.history(), filters] as const,
};

export function useCard() {
  const setCachedCard = useCardStore((s) => s.setCachedCard);

  return useQuery<MemberCard>({
    queryKey: cardKeys.detail(),
    queryFn: async () => {
      const card = await getCard();
      setCachedCard(card);
      return card;
    },
    staleTime: Infinity, // Offline support - never auto-refetch
  });
}

export function useCardQrCode() {
  const setCachedQrCode = useCardStore((s) => s.setCachedQrCode);

  return useQuery<CardQrCode>({
    queryKey: cardKeys.qrCode(),
    queryFn: async () => {
      const qr = await getQrCode();
      setCachedQrCode(qr);
      return qr;
    },
    staleTime: Infinity, // QR is static, cache forever
  });
}

export function useCardHistory(filters?: { type?: string }) {
  return useInfiniteQuery({
    queryKey: cardKeys.historyFiltered(filters || {}),
    queryFn: ({ pageParam = 1 }) =>
      getCardHistory({ page: pageParam as number, perPage: 20, ...filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.currentPage < lastPage.meta.totalPages) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
    staleTime: 10 * 60 * 1000, // 10 min
  });
}
