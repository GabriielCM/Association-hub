import { get, post } from '@/services/api/client';
import type {
  UserPoints,
  PointsSummary,
  PointTransaction,
  TransferResult,
  RecentRecipient,
  UserSearchResult,
  PointsHistoryFilter,
} from '@ahub/shared/types';

export async function getBalance(): Promise<UserPoints> {
  return get<UserPoints>('/points/balance');
}

export async function getHistory(
  filters?: PointsHistoryFilter
): Promise<{ data: PointTransaction[]; meta: { currentPage: number; perPage: number; totalPages: number; totalCount: number } }> {
  return get('/points/history', filters);
}

export async function getSummary(
  period: 'today' | 'week' | 'month' | 'year' = 'month'
): Promise<PointsSummary> {
  return get<PointsSummary>('/points/summary', { period });
}

export async function transferPoints(data: {
  recipientId: string;
  amount: number;
  message?: string;
}): Promise<TransferResult> {
  return post<TransferResult>('/points/transfer', data);
}

export async function getRecentRecipients(
  limit = 5
): Promise<RecentRecipient[]> {
  return get<RecentRecipient[]>('/points/transfer/recent', { limit });
}

export async function searchUsers(
  q: string,
  limit = 10
): Promise<UserSearchResult[]> {
  return get<UserSearchResult[]>('/points/transfer/search', { q, limit });
}
