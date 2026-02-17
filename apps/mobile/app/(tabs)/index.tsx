import { useCallback, useRef } from 'react';
import { FlatList, Pressable, ActivityIndicator } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Text, Heading, Avatar, Spinner, Icon } from '@ahub/ui';
import { Note } from '@ahub/ui/src/icons';
import { useAuthContext } from '@/providers/AuthProvider';
import { useDashboardSummary, useFeed } from '@/features/dashboard/hooks/useDashboard';
import { useDashboardWebSocket } from '@/features/dashboard/hooks/useDashboardWebSocket';
import { usePointsSocket } from '@/features/points/hooks/usePointsSocket';
import { useNotificationWebSocket } from '@/features/notifications/hooks/useNotificationWebSocket';
import { CelebrationOverlay } from '@/features/points/components/CelebrationOverlay';
import { NotificationBadge } from '@/features/notifications/components/NotificationBadge';

import { PointsBalanceCard } from '@/features/dashboard/components/PointsBalanceCard';
import { QuickAccessCarousel } from '@/features/dashboard/components/QuickAccessCarousel';
import { StoriesRow } from '@/features/dashboard/components/StoriesRow';
import { NewPostsBanner } from '@/features/dashboard/components/NewPostsBanner';
import { FeedPostCard } from '@/features/dashboard/components/FeedPostCard';
import { FeedPollCard } from '@/features/dashboard/components/FeedPollCard';
import { FeedEventCard } from '@/features/dashboard/components/FeedEventCard';
import { OfflineBanner } from '@/features/dashboard/components/OfflineBanner';
import { OnboardingOverlay } from '@/features/dashboard/components/OnboardingOverlay';

import type { FeedPost } from '@ahub/shared/types';

export default function HomeScreen() {
  const { user } = useAuthContext();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const {
    data: feedData,
    isLoading: feedLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useFeed();

  usePointsSocket();
  useNotificationWebSocket();
  useDashboardWebSocket();

  const feedPosts = feedData?.pages.flatMap((page) => page.posts) ?? [];

  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handleCommentPress = useCallback(
    (postId: string) => {
      router.push(`/dashboard/comments?postId=${postId}` as any);
    },
    [router],
  );

  const renderFeedItem = useCallback(
    ({ item }: { item: FeedPost }) => {
      switch (item.type) {
        case 'poll':
          return <FeedPollCard post={item} />;
        case 'event':
          return <FeedEventCard post={item} />;
        case 'photo':
        default:
          return (
            <FeedPostCard post={item} onCommentPress={handleCommentPress} />
          );
      }
    },
    [handleCommentPress],
  );

  const ListHeader = useCallback(
    () => (
      <YStack padding="$4" gap="$4">
        {/* Header with user greeting */}
        <XStack alignItems="center" justifyContent="space-between">
          <YStack>
            <Text color="secondary" size="sm">
              Bem-vindo,
            </Text>
            <Heading level={4}>{user?.name || 'Membro'}</Heading>
          </YStack>
          <XStack alignItems="center" gap="$3">
            <NotificationBadge />
            <Avatar
              src={user?.avatarUrl}
              name={user?.name}
              size="lg"
              status="online"
              showStatus
            />
          </XStack>
        </XStack>

        {/* Points Card */}
        <PointsBalanceCard user={summary?.user} isLoading={summaryLoading} />

        {/* Quick Access Carousel */}
        <QuickAccessCarousel />

        {/* Stories Row */}
        <StoriesRow />

        {/* New Posts Banner */}
        <NewPostsBanner onPress={scrollToTop} />

        {/* Feed section header */}
        <XStack alignItems="center" justifyContent="space-between">
          <Text weight="semibold" size="lg">
            Feed
          </Text>
          <Pressable
            onPress={() => router.push('/dashboard/create-post' as any)}
          >
            <Text color="accent" size="sm" weight="semibold">
              + Novo post
            </Text>
          </Pressable>
        </XStack>
      </YStack>
    ),
    [user, summary, summaryLoading, scrollToTop, router],
  );

  const ListFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <YStack padding="$4" alignItems="center">
          <ActivityIndicator />
        </YStack>
      );
    }
    if (!hasNextPage && feedPosts.length > 0) {
      return (
        <YStack padding="$4" alignItems="center">
          <Text color="secondary" size="sm">
            Voce viu todos os posts
          </Text>
        </YStack>
      );
    }
    return null;
  }, [isFetchingNextPage, hasNextPage, feedPosts.length]);

  const ListEmpty = useCallback(() => {
    if (feedLoading) {
      return (
        <YStack padding="$8" alignItems="center" gap="$2">
          <Spinner size="lg" />
          <Text color="secondary" size="sm">
            Carregando feed...
          </Text>
        </YStack>
      );
    }
    return (
      <YStack padding="$8" alignItems="center" gap="$2">
        <Icon icon={Note} size="xl" color="muted" weight="duotone" />
        <Text color="secondary" weight="semibold">
          Nenhum post ainda
        </Text>
        <Text color="secondary" size="sm" style={{ textAlign: 'center' }}>
          Seja o primeiro a compartilhar algo com a comunidade!
        </Text>
        <Pressable
          onPress={() => router.push('/dashboard/create-post' as any)}
        >
          <Text color="accent" weight="semibold" size="sm">
            Criar post
          </Text>
        </Pressable>
      </YStack>
    );
  }, [feedLoading, router]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <OfflineBanner />
      <FlatList
        ref={flatListRef}
        data={feedPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={{ paddingBottom: 16 }}
        ItemSeparatorComponent={() => <YStack height={12} />}
        showsVerticalScrollIndicator={false}
      />

      <CelebrationOverlay />
      <OnboardingOverlay />
    </SafeAreaView>
  );
}
