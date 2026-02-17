import { memo } from 'react';
import { Pressable, Image, Dimensions } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';

import { Text, Card, Avatar, Icon } from '@ahub/ui';
import { Heart, ChatCircle } from '@ahub/ui/src/icons';
import SealCheck from 'phosphor-react-native/src/icons/SealCheck';
import { useLikePost } from '../hooks/useFeedMutations';
import type { FeedPost } from '@ahub/shared/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `ha ${diffMin}min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `ha ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `ha ${diffDays}d`;

  return `ha ${Math.floor(diffDays / 30)}m`;
}

interface FeedPostCardProps {
  post: FeedPost;
  onCommentPress?: (postId: string) => void;
}

export const FeedPostCard = memo(function FeedPostCard({ post, onCommentPress }: FeedPostCardProps) {
  const router = useRouter();
  const { mutate: toggleLike } = useLikePost();

  const { author, content, created_at } = post;
  const isVerified = (author as any).is_verified;

  const handleLike = () => {
    toggleLike({ postId: post.id, liked: content.liked_by_me });
  };

  return (
    <Card variant="flat">
      <YStack gap="$3">
        {/* Author header */}
        <XStack alignItems="center" justifyContent="space-between">
          <Pressable
            onPress={() => router.push(`/profile/${author.id}` as any)}
          >
            <XStack alignItems="center" gap="$2">
              <Avatar
                src={author.avatar_url}
                name={author.name}
                size="sm"
              />
              <YStack>
                <XStack alignItems="center" gap="$1">
                  <Text weight="semibold" size="sm">
                    {author.name}
                  </Text>
                  {isVerified && <Icon icon={SealCheck} size="sm" color="#FFD700" weight="fill" />}
                </XStack>
                <Text color="secondary" size="xs">
                  {timeAgo(created_at)}
                </Text>
              </YStack>
            </XStack>
          </Pressable>
        </XStack>

        {/* Image */}
        {content.image_url && (
          <Image
            source={{ uri: content.image_url }}
            style={{
              width: SCREEN_WIDTH - 48,
              height: SCREEN_WIDTH - 48,
              borderRadius: 8,
            }}
            resizeMode="cover"
          />
        )}

        {/* Actions */}
        <XStack gap="$4">
          <Pressable onPress={handleLike}>
            <XStack alignItems="center" gap="$1">
              <Icon icon={Heart} size="lg" color={content.liked_by_me ? 'error' : 'muted'} weight={content.liked_by_me ? 'fill' : 'regular'} />
              <Text size="sm" color="secondary">
                {content.likes_count}
              </Text>
            </XStack>
          </Pressable>

          <Pressable onPress={() => onCommentPress?.(post.id)}>
            <XStack alignItems="center" gap="$1">
              <Icon icon={ChatCircle} size="lg" color="secondary" />
              <Text size="sm" color="secondary">
                {content.comments_count}
              </Text>
            </XStack>
          </Pressable>
        </XStack>

        {/* Description */}
        {content.description && (
          <Text size="sm" numberOfLines={3}>
            {content.description}
          </Text>
        )}
      </YStack>
    </Card>
  );
});
