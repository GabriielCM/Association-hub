import { useQuery } from '@tanstack/react-query';
import { getReadReceipts } from '../api/messages.api';

export function useReadReceipts(messageId: string | null) {
  return useQuery({
    queryKey: ['readReceipts', messageId],
    queryFn: () => getReadReceipts(messageId!),
    enabled: !!messageId,
    staleTime: 30_000,
  });
}
