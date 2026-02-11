import { useCallback, useState, useEffect, useRef } from 'react';
import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useSocketEvent, useWebSocket } from '@/providers/WebSocketProvider';
import { messageKeys } from './useConversations';
import type {
  WsMessageNew,
  WsMessageDelivered,
  WsMessageRead,
  WsTypingUpdate,
  WsRecordingUpdate,
  WsPresenceUpdate,
  MessagesListResponse,
  Message,
  ConversationsListResponse,
  Conversation,
} from '@ahub/shared/types';

interface TypingUser {
  id: string;
  name: string;
}

interface PresenceInfo {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

export function useMessageWebSocket(conversationId: string) {
  const queryClient = useQueryClient();
  const { emit, isConnected } = useWebSocket();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [recordingUsers, setRecordingUsers] = useState<TypingUser[]>([]);
  const [presenceMap, setPresenceMap] = useState<Map<string, PresenceInfo>>(
    new Map()
  );
  const prevConnected = useRef(isConnected);

  // Join/leave conversation room
  useEffect(() => {
    if (!conversationId) return;
    emit('join', { conversationId });
    return () => {
      emit('leave', { conversationId });
    };
  }, [conversationId, emit]);

  // Invalidate message cache on reconnect (coming back from background)
  useEffect(() => {
    if (isConnected && !prevConnected.current && conversationId) {
      queryClient.invalidateQueries({
        queryKey: messageKeys.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversations(),
      });
    }
    prevConnected.current = isConnected;
  }, [isConnected, conversationId, queryClient]);

  const handleMessageNew = useCallback(
    (data: unknown) => {
      const event = data as WsMessageNew;

      // Only update if it's for the current conversation
      if (event.conversationId === conversationId) {
        queryClient.setQueryData<InfiniteData<MessagesListResponse>>(
          messageKeys.messages(conversationId),
          (old): InfiniteData<MessagesListResponse> | undefined => {
            if (!old || old.pages.length === 0) return old;
            const firstPage = old.pages[0]!;

            // Deduplicate: skip if message already exists or replace optimistic (temp_*) message
            const existingIdx = firstPage.data.findIndex(
              (m: Message) => m.id === event.message.id
            );
            if (existingIdx !== -1) return old; // Already in cache

            // Remove optimistic temp message from the same sender
            const filtered = firstPage.data.filter(
              (m: Message) => !m.id.startsWith('temp_')
            );

            return {
              ...old,
              pages: [
                {
                  ...firstPage,
                  data: [event.message, ...filtered],
                },
                ...old.pages.slice(1),
              ],
            };
          }
        );
      }

      // Always update conversations list (last message preview)
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversations(),
      });
    },
    [conversationId, queryClient]
  );

  const handleMessageDelivered = useCallback(
    (data: unknown) => {
      const event = data as WsMessageDelivered;

      queryClient.setQueryData<InfiniteData<MessagesListResponse>>(
        messageKeys.messages(conversationId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((msg: Message) =>
                msg.id === event.messageId
                  ? { ...msg, status: 'DELIVERED' as const }
                  : msg
              ),
            })),
          };
        }
      );
    },
    [conversationId, queryClient]
  );

  const handleMessageRead = useCallback(
    (data: unknown) => {
      const event = data as WsMessageRead;

      if (event.conversationId === conversationId) {
        queryClient.setQueryData<InfiniteData<MessagesListResponse>>(
          messageKeys.messages(conversationId),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((msg: Message) =>
                  msg.status !== 'READ'
                    ? { ...msg, status: 'READ' as const }
                    : msg
                ),
              })),
            };
          }
        );

        // Update unread count in conversations list
        queryClient.setQueryData<ConversationsListResponse>(
          messageKeys.conversations(),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.map((conv: Conversation) =>
                conv.id === conversationId
                  ? { ...conv, unreadCount: 0 }
                  : conv
              ),
            };
          }
        );
      }
    },
    [conversationId, queryClient]
  );

  const handleMessageDeleted = useCallback(
    (data: unknown) => {
      const event = data as { messageId: string; conversationId: string };

      if (event.conversationId === conversationId) {
        queryClient.setQueryData<InfiniteData<MessagesListResponse>>(
          messageKeys.messages(conversationId),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter(
                  (msg: Message) => msg.id !== event.messageId
                ),
              })),
            };
          }
        );
      }
    },
    [conversationId, queryClient]
  );

  const handleMessageReaction = useCallback(
    (data: unknown) => {
      const event = data as {
        messageId: string;
        conversationId: string;
      };

      if (event.conversationId === conversationId) {
        // Invalidate to get fresh reaction data
        queryClient.invalidateQueries({
          queryKey: messageKeys.messages(conversationId),
        });
      }
    },
    [conversationId, queryClient]
  );

  const handleTypingUpdate = useCallback(
    (data: unknown) => {
      const event = data as WsTypingUpdate & { userId?: string };

      if (event.conversationId !== conversationId) return;

      const userId = event.user?.id ?? event.userId ?? '';
      const userName = event.user?.name ?? '';

      if (!userId) return;

      setTypingUsers((prev) => {
        if (event.isTyping) {
          const exists = prev.some((u) => u.id === userId);
          if (exists) return prev;
          return [...prev, { id: userId, name: userName }];
        }
        return prev.filter((u) => u.id !== userId);
      });
    },
    [conversationId]
  );

  const handleRecordingUpdate = useCallback(
    (data: unknown) => {
      const event = data as WsRecordingUpdate & { userId?: string };

      if (event.conversationId !== conversationId) return;

      const userId = event.user?.id ?? event.userId ?? '';
      const userName = event.user?.name ?? '';

      if (!userId) return;

      setRecordingUsers((prev) => {
        if (event.isRecording) {
          const exists = prev.some((u) => u.id === userId);
          if (exists) return prev;
          return [...prev, { id: userId, name: userName }];
        }
        return prev.filter((u) => u.id !== userId);
      });
    },
    [conversationId]
  );

  const handlePresenceUpdate = useCallback((data: unknown) => {
    const event = data as WsPresenceUpdate;

    setPresenceMap((prev) => {
      const next = new Map(prev);
      next.set(event.userId, {
        userId: event.userId,
        isOnline: event.isOnline,
        ...(event.lastSeenAt != null ? { lastSeenAt: event.lastSeenAt } : {}),
      });
      return next;
    });
  }, []);

  useSocketEvent('message.new', handleMessageNew);
  useSocketEvent('message.delivered', handleMessageDelivered);
  useSocketEvent('message.read', handleMessageRead);
  useSocketEvent('message.deleted', handleMessageDeleted);
  useSocketEvent('message.reaction', handleMessageReaction);
  useSocketEvent('typing.update', handleTypingUpdate);
  useSocketEvent('recording.update', handleRecordingUpdate);
  useSocketEvent('presence.update', handlePresenceUpdate);

  return { typingUsers, recordingUsers, presenceMap };
}
