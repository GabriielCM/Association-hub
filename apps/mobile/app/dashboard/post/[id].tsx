import { useCallback, useRef, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Text, Avatar, Icon, Spinner } from '@ahub/ui';
import { Heart, ChatCircle } from '@ahub/ui/src/icons';
import DotsThree from 'phosphor-react-native/src/icons/DotsThree';
import SealCheck from 'phosphor-react-native/src/icons/SealCheck';
import { useUserPosts } from '@/features/dashboard/hooks/useDashboard';
import { useLikePost } from '@/features/dashboard/hooks/useFeedMutations';
import { PostOptionsMenu } from '@/features/dashboard/components/PostOptionsMenu';
import { resolveUploadUrl } from '@/config/constants';
import type { FeedPost } from '@ahub/shared/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH;
const ESTIMATED_ITEM_HEIGHT = IMAGE_SIZE + 160;

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
    ({ item }: { item: FeedPost }) => {
      const { author, content, created_at } = item;
      const isVerified = (author as any).is_verified;
      const imageUrl = resolveUploadUrl(content.image_url);

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
            <Pressable onPress={() => setMenuPost(item)} hitSlop={8}>
              <Icon icon={DotsThree} size="lg" color="secondary" weight="bold" />
            </Pressable>
          </XStack>

          {/* Image - full width, edge-to-edge */}
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
              }}
              resizeMode="cover"
            />
          )}

          {/* Actions, likes, description, comments */}
          <YStack paddingHorizontal="$4" gap="$3">
            {/* Actions bar */}
            <XStack gap="$4">
              <Pressable onPress={() => handleLike(item)}>
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

              <Pressable onPress={() => handleCommentPress(item.id)}>
                <XStack alignItems="center" gap="$1">
                  <Icon icon={ChatCircle} size="lg" color="secondary" />
                  <Text size="sm" color="secondary">
                    {content.comments_count}
                  </Text>
                </XStack>
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
              <Pressable onPress={() => handleCommentPress(item.id)}>
                <Text color="secondary" size="sm">
                  Ver todos os {content.comments_count} comentarios
                </Text>
              </Pressable>
            )}
          </YStack>
        </YStack>
      );
    },
    [router, handleLike, handleCommentPress],
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
