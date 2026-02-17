import { memo, useState, useRef, useCallback } from 'react';
import { Pressable, Image, Dimensions, View } from 'react-native';
import { YStack, XStack, ZStack } from 'tamagui';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { Text, Card, Avatar, Icon } from '@ahub/ui';
import { Heart, ChatCircle, ShareNetwork } from '@ahub/ui/src/icons';
import DotsThree from 'phosphor-react-native/src/icons/DotsThree';
import SealCheck from 'phosphor-react-native/src/icons/SealCheck';
import { useLikePost } from '../hooks/useFeedMutations';
import { resolveUploadUrl } from '@/config/constants';
import { PostOptionsMenu } from './PostOptionsMenu';
import { ShareCard } from './ShareCard';
import type { FeedPost } from '@ahub/shared/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = SCREEN_WIDTH - 48;
const DOUBLE_TAP_DELAY = 300;

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
  const [menuVisible, setMenuVisible] = useState(false);
  const lastTapRef = useRef(0);
  const shareCardRef = useRef<View>(null);

  const { author, content, created_at } = post;
  const isVerified = (author as any).is_verified;

  // Double-tap heart animation
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  const triggerLike = useCallback(() => {
    if (!content.liked_by_me) {
      toggleLike({ postId: post.id, liked: false });
    }
  }, [content.liked_by_me, post.id, toggleLike]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      runOnJS(triggerLike)();
      heartScale.value = 0;
      heartOpacity.value = 1;
      heartScale.value = withSpring(1.1, { damping: 12, stiffness: 200 }, () => {
        heartScale.value = withTiming(1, { duration: 80 });
        heartOpacity.value = withDelay(100, withTiming(0, { duration: 200 }));
      });
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [triggerLike, heartScale, heartOpacity]);

  const handleLike = () => {
    toggleLike({ postId: post.id, liked: content.liked_by_me });
  };

  const handleShare = useCallback(async () => {
    try {
      const uri = await captureRef(shareCardRef, {
        format: 'jpg',
        quality: 0.9,
      });
      await Sharing.shareAsync(uri, { mimeType: 'image/jpeg' });
    } catch {
      // Fallback to text share
      const { Share } = require('react-native');
      Share.share({ message: content.description || 'Confira este post no A-hub!' });
    }
  }, [content.description]);

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
                src={resolveUploadUrl(author.avatar_url) || undefined}
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
          <Pressable onPress={() => setMenuVisible(true)} hitSlop={8}>
            <Icon icon={DotsThree} size="lg" color="secondary" weight="bold" />
          </Pressable>
        </XStack>

        {/* Image with double-tap like */}
        {content.image_url && (
          <Pressable onPress={handleDoubleTap}>
            <ZStack width={IMAGE_WIDTH} height={IMAGE_WIDTH}>
              <Image
                source={{ uri: resolveUploadUrl(content.image_url)! }}
                style={{
                  width: IMAGE_WIDTH,
                  height: IMAGE_WIDTH,
                  borderRadius: 8,
                }}
                resizeMode="cover"
              />
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  heartAnimatedStyle,
                ]}
                pointerEvents="none"
              >
                <Icon icon={Heart} size={80} color="#FFFFFF" weight="fill" />
              </Animated.View>
            </ZStack>
          </Pressable>
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

          <Pressable onPress={handleShare}>
            <Icon icon={ShareNetwork} size="lg" color="secondary" />
          </Pressable>
        </XStack>

        {/* Description */}
        {content.description && (
          <Text size="sm" numberOfLines={3}>
            {content.description}
          </Text>
        )}
      </YStack>

      <PostOptionsMenu
        visible={menuVisible}
        post={post}
        onClose={() => setMenuVisible(false)}
      />

      {/* Off-screen share card for capture */}
      <ShareCard
        ref={shareCardRef}
        imageUrl={resolveUploadUrl(content.image_url)}
        description={content.description}
        authorName={author.name}
      />
    </Card>
  );
});
