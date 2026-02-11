import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocketEvent, useWebSocket } from '@/providers/WebSocketProvider';
import { getOnlineContacts } from '../api/messages.api';
import { messageKeys } from './useConversations';
import type { WsPresenceUpdate, WsTypingUpdate, WsRecordingUpdate } from '@ahub/shared/types';

interface PresenceInfo {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

interface TypingUser {
  id: string;
  name: string;
}

/**
 * Hook for global presence and typing tracking.
 * Used by ConversationsScreen to show online status and typing previews.
 */
export function usePresence() {
  const queryClient = useQueryClient();
  const { isConnected } = useWebSocket();
  const [presenceMap, setPresenceMap] = useState<Map<string, PresenceInfo>>(new Map());
  const [typingMap, setTypingMap] = useState<Map<string, TypingUser[]>>(new Map());
  const [recordingMap, setRecordingMap] = useState<Map<string, TypingUser[]>>(new Map());
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const recordingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Fetch initial online contacts via REST API
  const { data: onlineData } = useQuery({
    queryKey: [...messageKeys.all, 'presence', 'online'],
    queryFn: getOnlineContacts,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  // Initialize presenceMap from API response
  useEffect(() => {
    if (onlineData?.userIds) {
      setPresenceMap((prev) => {
        const next = new Map(prev);
        for (const userId of onlineData.userIds) {
          next.set(userId, { userId, isOnline: true });
        }
        return next;
      });
    }
  }, [onlineData]);

  // Re-fetch presence when WebSocket reconnects
  useEffect(() => {
    if (isConnected) {
      queryClient.invalidateQueries({
        queryKey: [...messageKeys.all, 'presence', 'online'],
      });
    }
  }, [isConnected, queryClient]);

  // Handle real-time presence updates
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

  // Handle typing updates for conversation list preview
  const handleTypingUpdate = useCallback((data: unknown) => {
    const event = data as WsTypingUpdate & { userId?: string };

    const conversationId = event.conversationId;
    const userId = event.user?.id ?? event.userId ?? '';
    const userName = event.user?.name ?? '';

    if (!userId || !conversationId) return;

    // Clear existing auto-remove timer for this user in this conversation
    const timerKey = `${conversationId}:${userId}`;
    const existingTimer = typingTimers.current.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      typingTimers.current.delete(timerKey);
    }

    setTypingMap((prev) => {
      const next = new Map(prev);
      const current = next.get(conversationId) ?? [];

      if (event.isTyping) {
        const exists = current.some((u) => u.id === userId);
        if (!exists) {
          next.set(conversationId, [...current, { id: userId, name: userName }]);
        }

        // Auto-remove after 5s (safety net if stop event is missed)
        const timer = setTimeout(() => {
          setTypingMap((p) => {
            const n = new Map(p);
            const c = n.get(conversationId) ?? [];
            n.set(conversationId, c.filter((u) => u.id !== userId));
            if (n.get(conversationId)?.length === 0) n.delete(conversationId);
            return n;
          });
          typingTimers.current.delete(timerKey);
        }, 5000);
        typingTimers.current.set(timerKey, timer);
      } else {
        const filtered = current.filter((u) => u.id !== userId);
        if (filtered.length > 0) {
          next.set(conversationId, filtered);
        } else {
          next.delete(conversationId);
        }
      }

      return next;
    });
  }, []);

  // Handle recording updates for conversation list preview
  const handleRecordingUpdate = useCallback((data: unknown) => {
    const event = data as WsRecordingUpdate & { userId?: string };

    const conversationId = event.conversationId;
    const userId = event.user?.id ?? event.userId ?? '';
    const userName = event.user?.name ?? '';

    if (!userId || !conversationId) return;

    const timerKey = `${conversationId}:${userId}`;
    const existingTimer = recordingTimers.current.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      recordingTimers.current.delete(timerKey);
    }

    setRecordingMap((prev) => {
      const next = new Map(prev);
      const current = next.get(conversationId) ?? [];

      if (event.isRecording) {
        const exists = current.some((u) => u.id === userId);
        if (!exists) {
          next.set(conversationId, [...current, { id: userId, name: userName }]);
        }

        // Auto-remove after 30s (safety net)
        const timer = setTimeout(() => {
          setRecordingMap((p) => {
            const n = new Map(p);
            const c = n.get(conversationId) ?? [];
            n.set(conversationId, c.filter((u) => u.id !== userId));
            if (n.get(conversationId)?.length === 0) n.delete(conversationId);
            return n;
          });
          recordingTimers.current.delete(timerKey);
        }, 30000);
        recordingTimers.current.set(timerKey, timer);
      } else {
        const filtered = current.filter((u) => u.id !== userId);
        if (filtered.length > 0) {
          next.set(conversationId, filtered);
        } else {
          next.delete(conversationId);
        }
      }

      return next;
    });
  }, []);

  useSocketEvent('presence.update', handlePresenceUpdate);
  useSocketEvent('typing.update', handleTypingUpdate);
  useSocketEvent('recording.update', handleRecordingUpdate);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of typingTimers.current.values()) {
        clearTimeout(timer);
      }
      for (const timer of recordingTimers.current.values()) {
        clearTimeout(timer);
      }
    };
  }, []);

  return { presenceMap, typingMap, recordingMap };
}
