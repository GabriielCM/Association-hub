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
  myReaction?: ReactionType | null;
  commentId: string;
}

export function ReactionBar({
  reactions,
  myReaction,
  commentId,
}: ReactionBarProps) {
  const queryClient = useQueryClient();

  const handleReaction = async (type: ReactionType) => {
    if (myReaction === type) {
      await removeReaction(commentId, type);
    } else {
      await addReaction(commentId, type);
    }
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'comments'] });
  };

  const hasAnyReaction = Object.values(reactions).some((count) => count > 0);

  return (
    <XStack alignItems="center" gap="$1">
      {(Object.entries(REACTION_EMOJIS) as [ReactionType, string][]).map(
        ([type, emoji]) => {
          const count = reactions[type] || 0;
          const isActive = myReaction === type;

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
      {!myReaction && (
        <Pressable onPress={() => handleReaction('heart')}>
          <Text size="xs" color="secondary">
            ❤️
          </Text>
        </Pressable>
      )}
    </XStack>
  );
}
