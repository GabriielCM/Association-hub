import { Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';

import { Text, Avatar } from '@ahub/ui';
import { useAuthContext } from '@/providers/AuthProvider';
import { useDashboardTheme } from '../hooks/useDashboardTheme';
import { ReactionBar } from './ReactionBar';
import type { FeedComment } from '@ahub/shared/types';

interface CommentItemProps {
  comment: FeedComment;
  onReply: (comment: FeedComment) => void;
  onDelete: (commentId: string) => void;
  isReply?: boolean;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export function CommentItem({
  comment,
  onReply,
  onDelete,
  isReply = false,
}: CommentItemProps) {
  const { user } = useAuthContext();
  const dt = useDashboardTheme();
  const isOwn = user?.id === comment.author.id;

  return (
    <YStack
      gap="$2"
      paddingVertical="$2"
      paddingLeft={isReply ? '$6' : undefined}
    >
      <XStack gap="$2">
        <Avatar
          src={comment.author.avatar_url}
          name={comment.author.name}
          size="xs"
        />
        <YStack flex={1} gap="$1">
          <XStack alignItems="center" gap="$2">
            <Text weight="semibold" size="xs" style={{ color: dt.textPrimary }}>
              {comment.author.name}
            </Text>
            <Text size="xs" style={{ color: dt.textSecondary }}>
              {timeAgo(comment.created_at)}
            </Text>
          </XStack>

          <Text size="sm" style={{ color: dt.textPrimary }}>{comment.text}</Text>

          {/* Actions */}
          <XStack alignItems="center" gap="$3">
            <ReactionBar
              reactions={comment.reactions}
              myReaction={comment.my_reaction}
              commentId={comment.id}
            />

            {!isReply && (
              <Pressable onPress={() => onReply(comment)}>
                <Text size="xs" style={{ color: dt.accent }}>
                  Responder
                </Text>
              </Pressable>
            )}

            {isOwn && (
              <Pressable onPress={() => onDelete(comment.id)}>
                <Text size="xs" style={{ color: '#EF4444' }}>
                  Excluir
                </Text>
              </Pressable>
            )}
          </XStack>
        </YStack>
      </XStack>

      {/* Nested replies (1 level) */}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onReply={onReply}
          onDelete={onDelete}
          isReply
        />
      ))}
    </YStack>
  );
}
