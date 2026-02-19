import { useState, useCallback, useRef } from 'react';
import {
  RefreshControl,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import Animated from 'react-native-reanimated';
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import * as Haptics from 'expo-haptics';

import { Text, Heading, Button, Spinner, Icon } from '@ahub/ui';
import { MISC_ICONS } from '@ahub/ui/src/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useProfileAnimations, COVER_HEIGHT } from '@/features/profile/hooks/useProfileAnimations';

import { ProfileCover } from '@/features/profile/components/ProfileCover';
import { CollapsedHeader } from '@/features/profile/components/CollapsedHeader';
import { TieredAvatar } from '@/features/profile/components/TieredAvatar';
import { VerifiedSealBadge } from '@/features/profile/components/VerifiedSealBadge';
import { SocialLinksRow } from '@/features/profile/components/SocialLinksRow';
import { ProfileStatsRow } from '@/features/profile/components/ProfileStatsRow';
import { ProfileActions } from '@/features/profile/components/ProfileActions';
import { StickyGlassTabBar } from '@/features/profile/components/StickyGlassTabBar';
import { PostsTab } from '@/features/profile/components/PostsTab';
import { BadgesTab } from '@/features/profile/components/BadgesTab';
import { RankingsTab } from '@/features/profile/components/RankingsTab';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { data: profile, isLoading, error, refetch } = useProfile(userId || '');
  const { height: screenHeight } = useWindowDimensions();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const {
    scrollHandler,
    coverAnimatedStyle,
    profileInfoAnimatedStyle,
    collapsedHeaderAnimatedStyle,
    stickyTabBarAnimatedStyle,
    tabBarY,
    activeTabIndex,
    setActiveTab: setAnimatedTab,
    insets,
  } = useProfileAnimations();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleTabPress = useCallback(
    (index: number) => {
      pagerRef.current?.setPage(index);
      setActiveTab(index);
      setAnimatedTab(index);
    },
    [setAnimatedTab],
  );

  const handlePageSelected = useCallback(
    (e: PagerViewOnPageSelectedEvent) => {
      const position = e.nativeEvent.position;
      setActiveTab(position);
      setAnimatedTab(position);
      Haptics.selectionAsync();
    },
    [setAnimatedTab],
  );

  const handleTabBarLayout = useCallback(
    (event: LayoutChangeEvent) => {
      tabBarY.value = event.nativeEvent.layout.y;
    },
    [tabBarY],
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

  if (error || !profile) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
          <Icon icon={MISC_ICONS.warning} size="xl" color="muted" weight="duotone" />
          <Text color="secondary" align="center">
            {error?.message || 'Perfil não encontrado'}
          </Text>
          <Button variant="outline" onPress={() => router.back()}>
            Voltar
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const tabContentHeight = screenHeight * 0.6;

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            progressViewOffset={COVER_HEIGHT}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <ProfileCover
          coverImageUrl={profile.coverImageUrl}
          isMe={profile.isMe}
          animatedStyle={coverAnimatedStyle}
        />

        <View style={{ height: COVER_HEIGHT }} />

        <Animated.View style={[styles.profileInfo, profileInfoAnimatedStyle]}>
          <TieredAvatar
            avatarUrl={profile.avatarUrl}
            name={profile.name}
            subscriptionColor={profile.subscriptionColor}
            isOnline={profile.isOnline}
          />

          <YStack alignItems="center" gap="$1" marginTop="$2">
            <XStack alignItems="center" gap="$1.5">
              <Heading level={4}>{profile.name}</Heading>
              <VerifiedSealBadge isVerified={profile.isVerified} />
            </XStack>

            {profile.username && (
              <Text color="secondary" size="sm">
                @{profile.username}
              </Text>
            )}

            {profile.bio && (
              <Text
                color="secondary"
                size="sm"
                align="center"
                style={{ maxWidth: 280 }}
                numberOfLines={3}
              >
                {profile.bio}
              </Text>
            )}
          </YStack>

          {profile.socialLinks && (
            <SocialLinksRow socialLinks={profile.socialLinks} />
          )}

          <ProfileStatsRow profile={profile} />

          <ProfileActions
            isMe={profile.isMe}
            userId={profile.id}
          />
        </Animated.View>

        <StickyGlassTabBar
          activeTab={activeTab}
          onTabPress={handleTabPress}
          activeTabIndex={activeTabIndex}
          onLayout={handleTabBarLayout}
        />

        <PagerView
          ref={pagerRef}
          style={{ minHeight: tabContentHeight }}
          initialPage={0}
          onPageSelected={handlePageSelected}
          overdrag
        >
          <View key="posts" style={styles.tabPage}>
            <PostsTab userId={profile.id} />
          </View>
          <View key="badges" style={styles.tabPage}>
            <BadgesTab userId={profile.id} isMe={profile.isMe} />
          </View>
          <View key="rankings" style={styles.tabPage}>
            <RankingsTab userId={profile.id} />
          </View>
        </PagerView>
      </Animated.ScrollView>

      <CollapsedHeader
        name={profile.name}
        avatarUrl={profile.avatarUrl}
        animatedStyle={collapsedHeaderAnimatedStyle}
        isMe={profile.isMe}
      />

      <StickyGlassTabBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
        activeTabIndex={activeTabIndex}
        fixed
        fixedStyle={stickyTabBarAnimatedStyle}
        safeAreaTop={insets.top + 48}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileInfo: {
    marginTop: -60,
    gap: 12,
    paddingBottom: 16,
  },
  tabPage: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
});
