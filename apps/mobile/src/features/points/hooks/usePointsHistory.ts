import { useInfiniteQuery } from '@tanstack/react-query';
import { getHistory } from '../api/points.api';
import { pointsKeys } from './usePoints';
import type { PointsHistoryFilter, PointTransaction } from '@ahub/shared/types';

export function usePointsHistory(filters?: Omit<PointsHistoryFilter, 'page'>) {
  return useInfiniteQuery<
    { data: PointTransaction[]; meta: { currentPage: number; perPage: number; totalPages: number; totalCount: number } },
    Error
  >({
    queryKey: pointsKeys.historyFiltered(filters ?? {}),
    queryFn: ({ pageParam }) =>
      getHistory({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.currentPage < lastPage.meta.totalPages) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 min
  });
}
