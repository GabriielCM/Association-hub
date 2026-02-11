import { useInfiniteQuery } from '@tanstack/react-query';
import { listMessages } from '../api/messages.api';
import { messageKeys } from './useConversations';
import type { MessagesListResponse } from '@ahub/shared/types';

export function useMessages(conversationId: string) {
  return useInfiniteQuery<MessagesListResponse>({
    queryKey: messageKeys.messages(conversationId),
    queryFn: ({ pageParam }) =>
      listMessages(conversationId, {
        limit: 50,
        before: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.oldestId : undefined,
    enabled: !!conversationId,
    staleTime: 0,
  });
}
