import { XStack, YStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import type { EventComment } from '@ahub/shared/types';

interface CommentItemProps {
  comment: EventComment;
}

function timeAgo(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <XStack gap="$3" alignItems="flex-start">
      {/* Avatar */}
      <View
        width={36}
        height={36}
        borderRadius="$full"
        backgroundColor="$backgroundHover"
        alignItems="center"
        justifyContent="center"
      >
        <Text size="sm" weight="bold">
          {comment.author.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Content */}
      <YStack flex={1} gap="$1">
        <XStack gap="$2" alignItems="center">
          <Text weight="semibold" size="sm">
            {comment.author.name}
          </Text>
          <Text color="secondary" size="xs">
            {timeAgo(comment.createdAt)}
          </Text>
        </XStack>
        <Text size="sm">{comment.text}</Text>
      </YStack>
    </XStack>
  );
}
