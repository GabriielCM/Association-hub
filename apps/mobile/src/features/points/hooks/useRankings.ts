import { useQuery } from '@tanstack/react-query';
import { getRanking } from '../api/rankings.api';
import type { RankingResponse, RankingType, RankingPeriod } from '@ahub/shared/types';

export const rankingKeys = {
  all: ['rankings'] as const,
  byType: (type: RankingType, period: RankingPeriod) =>
    [...rankingKeys.all, type, period] as const,
};

export function useRankings(
  type: RankingType,
  period: RankingPeriod = 'all_time',
  limit = 20
) {
  return useQuery<RankingResponse>({
    queryKey: rankingKeys.byType(type, period),
    queryFn: () => getRanking(type, period, limit),
    staleTime: 15 * 60 * 1000, // 15 min
  });
}
