import { useCallback, useRef, useEffect, useState, memo } from 'react';
import {
  FlatList,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
  View,
} from 'react-native';
import { YStack, XStack, ZStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

import { Text, Avatar, Icon, Spinner } from '@ahub/ui';
import { Heart, ChatCircle, ShareNetwork } from '@ahub/ui/src/icons';
import DotsThree from 'phosphor-react-native/src/icons/DotsThree';
import SealCheck from 'phosphor-react-native/src/icons/SealCheck';
import { useUserPosts } from '@/features/dashboard/hooks/useDashboard';
import { useLikePost } from '@/features/dashboard/hooks/useFeedMutations';
import { PostOptionsMenu } from '@/features/dashboard/components/PostOptionsMenu';
import { ShareCard } from '@/features/dashboard/components/ShareCard';
import { resolveUploadUrl } from '@/config/constants';
import type { FeedPost } from '@ahub/shared/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH;
const ESTIMATED_ITEM_HEIGHT = IMAGE_SIZE + 160;
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

// Extracted as component so it can use hooks (useSharedValue)
const PostItem = memo(function PostItem({
  item,
  onLike,
  onComment,
  onMenu,
}: {
  item: FeedPost;
  onLike: (post: FeedPost) => void;
  onComment: (postId: string) => void;
  onMenu: (post: FeedPost) => void;
}) {
  const router = useRouter();
  const { author, content, created_at } = item;
  const isVerified = (author as any).is_verified;
  const imageUrl = resolveUploadUrl(content.image_url);
  const lastTapRef = useRef(0);
  const shareCardRef = useRef<View>(null);

  // Double-tap heart animation
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  const triggerLike = useCallback(() => {
    if (!content.liked_by_me) {
      onLike(item);
    }
  }, [content.liked_by_me, item, onLike]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
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

  const handleShare = useCallback(async () => {
    try {
      const uri = await captureRef(shareCardRef, {
        format: 'jpg',
        quality: 0.9,
      });
      await Sharing.shareAsync(uri, { mimeType: 'image/jpeg' });
    } catch {
      const { Share } = require('react-native');
      Share.share({ message: content.description || 'Confira este post no A-hub!' });
    }
  }, [content.description]);

  return (
    <YStack gap="$3" paddingVertical="$3">
      {/* Author header */}
      <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$2">
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
                {isVerified && (
                  <Icon
                    icon={SealCheck}
                    size="sm"
                    color="#FFD700"
                    weight="fill"
                  />
                )}
              </XStack>
              <Text color="secondary" size="xs">
                {timeAgo(created_at)}
              </Text>
            </YStack>
          </XStack>
        </Pressable>
        <Pressable onPress={() => onMenu(item)} hitSlop={8}>
          <Icon icon={DotsThree} size="lg" color="secondary" weight="bold" />
        </Pressable>
      </XStack>

      {/* Image with double-tap like */}
      {imageUrl && (
        <Pressable onPress={handleDoubleTap}>
          <ZStack width={IMAGE_SIZE} height={IMAGE_SIZE}>
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
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

      {/* Actions, likes, description, comments */}
      <YStack paddingHorizontal="$4" gap="$3">
        {/* Actions bar */}
        <XStack gap="$4">
          <Pressable onPress={() => onLike(item)}>
            <XStack alignItems="center" gap="$1">
              <Icon
                icon={Heart}
                size="lg"
                color={content.liked_by_me ? 'error' : 'muted'}
                weight={content.liked_by_me ? 'fill' : 'regular'}
              />
              <Text size="sm" color="secondary">
                {content.likes_count}
              </Text>
            </XStack>
          </Pressable>

          <Pressable onPress={() => onComment(item.id)}>
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

        {/* Likes count */}
        {content.likes_count > 0 && (
          <Text weight="semibold" size="sm">
            {content.likes_count} curtida{content.likes_count !== 1 ? 's' : ''}
          </Text>
        )}

        {/* Description */}
        {content.description && (
          <Text size="sm" numberOfLines={3}>
            <Text weight="semibold" size="sm">
              {author.name}{' '}
            </Text>
            {content.description}
          </Text>
        )}

        {/* View all comments link */}
        {content.comments_count > 0 && (
          <Pressable onPress={() => onComment(item.id)}>
            <Text color="secondary" size="sm">
              Ver todos os {content.comments_count} comentarios
            </Text>
          </Pressable>
        )}
      </YStack>

      {/* Off-screen share card for capture */}
      <ShareCard
        ref={shareCardRef}
        imageUrl={imageUrl}
        description={content.description}
        authorName={author.name}
      />
    </YStack>
  );
});

export default function UserPostsFeedScreen() {
  const router = useRouter();
  const { id, userId } = useLocalSearchParams<{
    id: string;
    userId: string;
  }>();

  const flatListRef = useRef<FlatList>(null);
  const hasScrolled = useRef(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useUserPosts(userId || '');

  const { mutate: toggleLike } = useLikePost();
  const [menuPost, setMenuPost] = useState<FeedPost | null>(null);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  // Scroll to the tapped post once data loads
  useEffect(() => {
    if (posts.length > 0 && id && !hasScrolled.current) {
      const targetIndex = posts.findIndex((p) => p.id === id);
      if (targetIndex > 0) {
        hasScrolled.current = true;
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: targetIndex,
            animated: false,
          });
        }, 100);
      } else {
        hasScrolled.current = true;
      }
    }
  }, [posts.length, id]);

  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: ESTIMATED_ITEM_HEIGHT,
      offset: ESTIMATED_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const onScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      flatListRef.current?.scrollToOffset({
        offset: info.index * info.averageItemLength,
        animated: false,
      });
      setTimeout(() => {
        if (posts.length > info.index) {
          flatListRef.current?.scrollToIndex({
            index: info.index,
            animated: false,
          });
        }
      }, 200);
    },
    [posts.length],
  );

  const handleLike = useCallback(
    (post: FeedPost) => {
      toggleLike({ postId: post.id, liked: post.content.liked_by_me });
    },
    [toggleLike],
  );

  const handleCommentPress = useCallback(
    (postId: string) => {
      router.push(`/dashboard/comments?postId=${postId}` as any);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: FeedPost }) => (
      <PostItem
        item={item}
        onLike={handleLike}
        onComment={handleCommentPress}
        onMenu={setMenuPost}
      />
    ),
    [handleLike, handleCommentPress],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" />
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {/* Header */}
      <XStack
        alignItems="center"
        justifyContent="center"
        padding="$4"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text weight="bold" size="lg">
          Posts
        </Text>
      </XStack>

      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ItemSeparatorComponent={() => (
          <YStack
            height={1}
            backgroundColor="$borderColor"
            marginHorizontal="$4"
          />
        )}
        ListFooterComponent={
          isFetchingNextPage ? (
            <YStack padding="$4" alignItems="center">
              <ActivityIndicator />
            </YStack>
          ) : !hasNextPage && posts.length > 0 ? (
            <YStack padding="$4" alignItems="center">
              <Text color="secondary" size="sm">
                Sem mais posts
              </Text>
            </YStack>
          ) : null
        }
        ListEmptyComponent={
          <YStack padding="$8" alignItems="center" gap="$2">
            <Text color="secondary">Nenhum post encontrado</Text>
          </YStack>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <PostOptionsMenu
        visible={!!menuPost}
        post={menuPost}
        onClose={() => setMenuPost(null)}
        onDeleteSuccess={() => router.back()}
      />
    </SafeAreaView>
  );
}
