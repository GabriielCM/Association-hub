import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forwardMessage } from '../api/messages.api';
import { messageKeys } from './useConversations';

export function useForwardMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, conversationIds }: { messageId: string; conversationIds: string[] }) =>
      forwardMessage(messageId, conversationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
    },
  });
}
