import { XStack, YStack, View } from 'tamagui';
import { Text, Avatar } from '@ahub/ui';
import { ImageMessage } from '@/features/messages/components/ImageMessage';
import { useEventsTheme } from '@/features/events/hooks/useEventsTheme';
import { resolveUploadUrl } from '@/config/constants';
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
  const et = useEventsTheme();

  return (
    <XStack gap="$3" alignItems="flex-start">
      <Avatar
        src={resolveUploadUrl(comment.author.avatarUrl) || undefined}
        name={comment.author.name}
        size="sm"
      />

      {/* Content */}
      <YStack flex={1} gap="$1">
        <XStack gap="$2" alignItems="center">
          <Text weight="semibold" size="sm" style={{ color: et.textPrimary }}>
            {comment.author.name}
          </Text>
          <Text color="secondary" size="xs" style={{ color: et.textSecondary }}>
            {timeAgo(comment.createdAt)}
          </Text>
        </XStack>
        {comment.contentType === 'IMAGE' && comment.mediaUrl && (
          <View marginTop="$1" maxWidth={220}>
            <ImageMessage mediaUrl={resolveUploadUrl(comment.mediaUrl)!} />
          </View>
        )}
        {comment.text && (
          <Text size="sm" style={{ color: et.textPrimary }}>
            {comment.text}
          </Text>
        )}
      </YStack>
    </XStack>
  );
}
