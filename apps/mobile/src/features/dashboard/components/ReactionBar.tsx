import { useState, useEffect, useCallback, useRef } from 'react';
import { Pressable } from 'react-native';
import { XStack } from 'tamagui';

import { Text } from '@ahub/ui';
import { useDashboardTheme } from '../hooks/useDashboardTheme';
import { addReaction, removeReaction } from '../api/dashboard.api';
import { useQueryClient } from '@tanstack/react-query';
import type { CommentReactions, ReactionType } from '@ahub/shared/types';

const REACTION_EMOJIS: Record<ReactionType, string> = {
  heart: '❤️',
  thumbs_up: '👍',
  laugh: '😂',
  wow: '😮',
};

/** Normalize backend enum (HEART) to frontend type (heart) */
const normalize = (r?: ReactionType | string | null): ReactionType | null =>
  (r?.toLowerCase() as ReactionType) ?? null;

interface ReactionBarProps {
  reactions: CommentReactions;
  myReaction?: ReactionType | null | undefined;
  commentId: string;
}

export function ReactionBar({
  reactions,
  myReaction,
  commentId,
}: ReactionBarProps) {
  const queryClient = useQueryClient();
  const dt = useDashboardTheme();

  // Optimistic local state — normalized to lowercase
  const [localReactions, setLocalReactions] = useState<CommentReactions>(reactions);
  const [localMyReaction, setLocalMyReaction] = useState<ReactionType | null>(normalize(myReaction));

  // Ref to always read latest localMyReaction in callbacks (avoids stale closure)
  const localMyReactionRef = useRef(localMyReaction);
  localMyReactionRef.current = localMyReaction;

  // Sync when server data changes
  useEffect(() => {
    setLocalReactions(reactions);
    setLocalMyReaction(normalize(myReaction));
  }, [reactions, myReaction]);

  const handleReaction = useCallback(async (type: ReactionType) => {
    const currentReaction = localMyReactionRef.current;
    const wasActive = currentReaction === type;

    // Optimistic update
    if (wasActive) {
      setLocalMyReaction(null);
      setLocalReactions((prev) => ({
        ...prev,
        [type]: Math.max(0, (prev[type] || 0) - 1),
      }));
    } else {
      // If switching from another reaction, decrement old one
      if (currentReaction) {
        setLocalReactions((prev) => ({
          ...prev,
          [currentReaction]: Math.max(0, (prev[currentReaction] || 0) - 1),
          [type]: (prev[type] || 0) + 1,
        }));
      } else {
        setLocalReactions((prev) => ({
          ...prev,
          [type]: (prev[type] || 0) + 1,
        }));
      }
      setLocalMyReaction(type);
    }

    try {
      if (wasActive) {
        await removeReaction(commentId);
      } else {
        await addReaction(commentId, { reaction: type });
      }
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'comments'] });
    } catch {
      // Rollback on error
      setLocalReactions(reactions);
      setLocalMyReaction(normalize(myReaction));
    }
  }, [commentId, reactions, myReaction, queryClient]);

  return (
    <XStack alignItems="center" gap="$1">
      {(Object.entries(REACTION_EMOJIS) as [ReactionType, string][]).map(
        ([type, emoji]) => {
          const count = localReactions[type] || 0;
          const isActive = localMyReaction === type;

          if (count === 0 && !isActive) return null;

          return (
            <Pressable key={type} onPress={() => handleReaction(type)}>
              <XStack
                alignItems="center"
                gap={2}
                paddingHorizontal="$1"
                paddingVertical={2}
                borderRadius="$2"
                backgroundColor={isActive ? '$accent' : undefined}
                opacity={isActive ? 1 : 0.7}
              >
                <Text size="xs">{emoji}</Text>
                {count > 0 && (
                  <Text
                    size="xs"
                    style={{ color: isActive ? '#FFF' : dt.textSecondary }}
                  >
                    {count}
                  </Text>
                )}
              </XStack>
            </Pressable>
          );
        },
      )}

      {/* Quick add reaction */}
      {!localMyReaction && (
        <Pressable onPress={() => handleReaction('heart')}>
          <Text size="xs" style={{ color: dt.textSecondary }}>
            ❤️
          </Text>
        </Pressable>
      )}
    </XStack>
  );
}
