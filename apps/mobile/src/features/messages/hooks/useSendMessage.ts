import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { sendMessage, deleteMessage, addReaction, removeReaction, uploadMedia } from '../api/messages.api';
import { messageKeys } from './useConversations';
import { useAuthStore } from '@/stores/auth.store';
import type { SendMessageRequest, MessagesListResponse, Message } from '@ahub/shared/types';

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      let finalData = data;
      // Upload local media before sending message
      if (data.mediaUrl && data.mediaUrl.startsWith('file://')) {
        const { url } = await uploadMedia(data.mediaUrl, data.contentType);
        finalData = { ...data, mediaUrl: url };
      }
      return sendMessage(conversationId, finalData);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.messages(conversationId),
      });

      const previous = queryClient.getQueryData<InfiniteData<MessagesListResponse>>(
        messageKeys.messages(conversationId)
      );

      // Optimistic update
      const optimisticMessage: Message = {
        id: `temp_${Date.now()}`,
        conversationId,
        sender: {
          id: user?.id ?? '',
          name: user?.name ?? '',
          avatarUrl: user?.avatarUrl,
        },
        content: data.content ?? '',
        contentType: data.contentType,
        mediaUrl: data.mediaUrl,
        mediaDuration: data.mediaDuration,
        reactions: [],
        status: 'SENDING',
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<InfiniteData<MessagesListResponse>>(
        messageKeys.messages(conversationId),
        (old) => {
          if (!old) return old;
          const firstPage = old.pages[0];
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                data: [optimisticMessage, ...firstPage.data],
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          messageKeys.messages(conversationId),
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversations(),
      });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}

export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      addReaction(messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      removeReaction(messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}
