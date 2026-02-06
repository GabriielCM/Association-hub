import { get } from '@/services/api/client';
import type { RankingResponse, RankingType, RankingPeriod } from '@ahub/shared/types';

export async function getRanking(
  type: RankingType,
  period: RankingPeriod = 'all_time',
  limit = 20
): Promise<RankingResponse> {
  return get<RankingResponse>(`/rankings/${type}`, { period, limit });
}
