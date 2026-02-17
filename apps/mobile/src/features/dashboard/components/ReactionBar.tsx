import { useState, useEffect, useCallback } from 'react';
import { Pressable } from 'react-native';
import { XStack } from 'tamagui';

import { Text } from '@ahub/ui';
import { addReaction, removeReaction } from '../api/dashboard.api';
import { useQueryClient } from '@tanstack/react-query';
import type { CommentReactions, ReactionType } from '@ahub/shared/types';

const REACTION_EMOJIS: Record<ReactionType, string> = {
  heart: '❤️',
  thumbs_up: '👍',
  laugh: '😂',
  wow: '😮',
};

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

  // Optimistic local state
  const [localReactions, setLocalReactions] = useState<CommentReactions>(reactions);
  const [localMyReaction, setLocalMyReaction] = useState<ReactionType | null>(myReaction ?? null);

  // Sync when server data changes
  useEffect(() => {
    setLocalReactions(reactions);
    setLocalMyReaction(myReaction ?? null);
  }, [reactions, myReaction]);

  const handleReaction = useCallback(async (type: ReactionType) => {
    const wasActive = localMyReaction === type;

    // Optimistic update
    if (wasActive) {
      setLocalMyReaction(null);
      setLocalReactions((prev) => ({
        ...prev,
        [type]: Math.max(0, (prev[type] || 0) - 1),
      }));
    } else {
      // If switching from another reaction, decrement old one
      if (localMyReaction) {
        setLocalReactions((prev) => ({
          ...prev,
          [localMyReaction]: Math.max(0, (prev[localMyReaction] || 0) - 1),
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
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'comments'] });
    } catch {
      // Rollback on error
      setLocalReactions(reactions);
      setLocalMyReaction(myReaction ?? null);
    }
  }, [localMyReaction, commentId, reactions, myReaction, queryClient]);

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
                    color={isActive ? 'white' : 'secondary'}
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
          <Text size="xs" color="secondary">
            ❤️
          </Text>
        </Pressable>
      )}
    </XStack>
  );
}
