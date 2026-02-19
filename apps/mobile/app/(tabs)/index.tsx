import React, { useCallback, useRef } from 'react';
import { FlatList, Pressable, ActivityIndicator, RefreshControl, View } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CopilotProvider, CopilotStep } from 'react-native-copilot';

import { Text, Heading, Avatar, Icon } from '@ahub/ui';
import { Note } from '@ahub/ui/src/icons';
import Plus from 'phosphor-react-native/src/icons/Plus';
import { useAuthContext } from '@/providers/AuthProvider';
import { useDashboardSummary, useFeed } from '@/features/dashboard/hooks/useDashboard';
import { useDashboardWebSocket } from '@/features/dashboard/hooks/useDashboardWebSocket';
import { usePointsSocket } from '@/features/points/hooks/usePointsSocket';
import { useNotificationWebSocket } from '@/features/notifications/hooks/useNotificationWebSocket';
import { CelebrationOverlay } from '@/features/points/components/CelebrationOverlay';
import { NotificationBadge } from '@/features/notifications/components/NotificationBadge';
import { useDashboardTheme } from '@/features/dashboard/hooks/useDashboardTheme';
import { OnboardingTooltip } from '@/features/dashboard/components/OnboardingTooltip';
import { useOnboardingTour } from '@/features/dashboard/hooks/useOnboardingTour';

import { PointsBalanceCard } from '@/features/dashboard/components/PointsBalanceCard';
import { QuickAccessCarousel } from '@/features/dashboard/components/QuickAccessCarousel';
import { StoriesRow } from '@/features/dashboard/components/StoriesRow';
import { NewPostsBanner } from '@/features/dashboard/components/NewPostsBanner';
import { FeedPostCard } from '@/features/dashboard/components/FeedPostCard';
import { FeedPollCard } from '@/features/dashboard/components/FeedPollCard';
import { FeedEventCard } from '@/features/dashboard/components/FeedEventCard';
import { OfflineBanner } from '@/features/dashboard/components/OfflineBanner';
import {
  SkeletonPointsCard,
  SkeletonQuickAccess,
  SkeletonStories,
  SkeletonFeedPost,
} from '@/features/dashboard/components/HomeSkeletons';

import type { FeedPost } from '@ahub/shared/types';

function CopilotView({ copilot, children }: { copilot?: any; children: React.ReactNode }) {
  const setRef = React.useCallback(
    (node: View | null) => {
      if (copilot?.ref) {
        copilot.ref.current = node;
      }
    },
    [copilot?.ref],
  );

  return (
    <View ref={setRef} onLayout={copilot?.onLayout}>
      {children}
    </View>
  );
}

export default function HomeScreen() {
  const dt = useDashboardTheme();

  return (
    <CopilotProvider
      overlay="svg"
      animated
      animationDuration={400}
      backdropColor={dt.isDark ? 'rgba(13,5,32,0.85)' : 'rgba(0,0,0,0.7)'}
      tooltipComponent={OnboardingTooltip}
      arrowColor={dt.isDark ? 'rgba(13,5,32,0.95)' : 'rgba(0,0,0,0.88)'}
      arrowSize={8}
      margin={8}
      stopOnOutsideClick={false}
      verticalOffset={0}
      tooltipStyle={{
        backgroundColor: 'transparent',
        paddingTop: 0,
        paddingHorizontal: 0,
        borderRadius: 0,
      }}
    >
      <HomeScreenContent />
    </CopilotProvider>
  );
}

function HomeScreenContent() {
  const { user } = useAuthContext();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const dt = useDashboardTheme();

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

  const { isTourActive } = useOnboardingTour(!summaryLoading);

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
        {/* Step 1: Points Card */}
        <CopilotStep
          text="Aqui você vê seu saldo de pontos, variação diária e gráfico dos últimos 7 dias."
          order={1}
          name="points-card"
        >
          <CopilotView>
            {summaryLoading ? <SkeletonPointsCard /> : (
              <PointsBalanceCard user={summary?.user} isLoading={summaryLoading} />
            )}
          </CopilotView>
        </CopilotStep>

        {/* Step 2: Quick Access Carousel */}
        <CopilotStep
          text="Deslize para acessar todos os módulos: Eventos, Loja, Reservas, Rankings e mais!"
          order={2}
          name="quick-access"
        >
          <CopilotView>
            {summaryLoading ? <SkeletonQuickAccess /> : <QuickAccessCarousel />}
          </CopilotView>
        </CopilotStep>

        {/* Step 3: Stories Row */}
        <CopilotStep
          text="Veja os stories da comunidade e compartilhe os seus. Toque no + para criar!"
          order={3}
          name="stories-row"
        >
          <CopilotView>
            {summaryLoading ? <SkeletonStories /> : <StoriesRow />}
          </CopilotView>
        </CopilotStep>

        {/* Step 4: Feed area */}
        <CopilotStep
          text="Acompanhe posts, enquetes e eventos da comunidade. Role para ver mais!"
          order={4}
          name="feed-area"
        >
          <CopilotView>
            <YStack paddingVertical="$2">
              <Text weight="semibold" size="lg" style={{ color: dt.textPrimary }}>
                Feed da Comunidade
              </Text>
              <Text size="sm" style={{ color: dt.textSecondary }}>
                Posts, enquetes e eventos
              </Text>
            </YStack>
          </CopilotView>
        </CopilotStep>

        {/* New Posts Banner */}
        <NewPostsBanner onPress={scrollToTop} />
      </YStack>
    ),
    [summary, summaryLoading, scrollToTop, dt.textPrimary, dt.textSecondary],
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
        <YStack padding="$4" gap={12}>
          <SkeletonFeedPost />
          <SkeletonFeedPost />
          <SkeletonFeedPost />
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
    <SafeAreaView style={{ flex: 1, backgroundColor: dt.screenBg }} edges={['top']}>
      <OfflineBanner />

      {/* Sticky Header */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$4"
        paddingVertical="$2"
        backgroundColor={dt.headerBg}
      >
        <YStack>
          <Text size="sm" style={{ color: dt.greetingText }}>
            Bem-vindo,
          </Text>
          <Heading level={4} style={{ color: dt.textPrimary }}>{user?.name || 'Membro'}</Heading>
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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={dt.refreshTint}
            colors={[dt.refreshTint]}
            progressBackgroundColor={dt.refreshBg}
          />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
        ItemSeparatorComponent={() => <YStack height={12} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isTourActive}
      />

      {/* FAB - New Post */}
      <Pressable
        onPress={() => router.push('/dashboard/create-post' as any)}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: dt.fabBg,
          alignItems: 'center',
          justifyContent: 'center',
          ...dt.fabShadow,
        }}
      >
        <Icon icon={Plus} size="lg" color={dt.fabIcon} weight="bold" />
      </Pressable>

      <CelebrationOverlay />
    </SafeAreaView>
  );
}
