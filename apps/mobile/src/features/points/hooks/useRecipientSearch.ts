import { useQuery } from '@tanstack/react-query';
import { getRecentRecipients, searchUsers } from '../api/points.api';
import type { RecentRecipient, UserSearchResult } from '@ahub/shared/types';

export function useRecentRecipients() {
  return useQuery<RecentRecipient[]>({
    queryKey: ['points', 'transfer', 'recent'],
    queryFn: () => getRecentRecipients(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchUsers(query: string) {
  return useQuery<UserSearchResult[]>({
    queryKey: ['points', 'transfer', 'search', query],
    queryFn: () => searchUsers(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30s
  });
}
