import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@ahub/ui';
import { CreditCard, CaretLeft } from '@ahub/ui/src/icons';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useWalletDashboard } from '@/features/wallet/hooks/useWallet';
import { useCachedBalance } from '@/stores/wallet.store';
import { WalletGlassBackground } from '@/features/wallet/components/WalletGlassBackground';
import { WalletCard } from '@/features/wallet/components/WalletCard';
import { QuickActions } from '@/features/wallet/components/QuickActions';
import { WalletSummaryBar } from '@/features/wallet/components/WalletSummaryBar';
import { StravaCard } from '@/features/wallet/components/StravaCard';
import { RecentTransactionsSection } from '@/features/wallet/components/RecentTransactionsSection';
import { OfflineBanner } from '@/features/wallet/components/OfflineBanner';
import { WalletHomeSkeleton } from '@/features/wallet/components/ShimmerGlassSkeleton';
import { GlassPanel } from '@/features/wallet/components/GlassPanel';
import { useWalletTheme } from '@/features/wallet/hooks/useWalletTheme';

export default function WalletHomeScreen() {
  const { data: dashboard, isLoading, isError, refetch } = useWalletDashboard();
  const cachedBalance = useCachedBalance();
  const t = useWalletTheme();

  // Parallax scroll
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const cardParallaxStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * -0.25 }],
  }));

  // Simple offline detection via error state + cached data
  const isOffline = isError && cachedBalance !== null;

  return (
    <View style={[styles.root, { backgroundColor: t.screenBg }]}>
      <WalletGlassBackground colors={t.gradientColors} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={[styles.backButton, { backgroundColor: t.headerButtonBg }]}
          >
            <CaretLeft size={22} color={t.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>Minha Carteira</Text>
          <View style={{ width: 34 }} />
        </View>

        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Offline Banner */}
          <OfflineBanner visible={isOffline} />

          {/* Loading State */}
          {isLoading && !dashboard ? (
            <WalletHomeSkeleton />
          ) : dashboard ? (
            <YStack gap={20}>
              {/* 1. Wallet Card with parallax */}
              <Animated.View style={cardParallaxStyle}>
                <WalletCard
                  dashboard={dashboard}
                  onQrPress={() => router.push('/(tabs)/carteirinha')}
                />
              </Animated.View>

              {/* 2. Quick Actions */}
              <QuickActions
                onTransfer={() => router.push('/wallet/transfer')}
                onScanner={() => router.push('/wallet/scanner')}
                onHistory={() => router.push('/wallet/history')}
              />

              {/* 3. Summary Cards */}
              <WalletSummaryBar />

              {/* 4. Strava */}
              <StravaCard
                strava={dashboard.strava}
                onConnect={() => router.push('/wallet/strava')}
                onDetails={() => router.push('/wallet/strava')}
              />

              {/* 5. Recent Transactions */}
              <RecentTransactionsSection
                transactions={(dashboard as any).recentTransactions ?? []}
                onViewAll={() => router.push('/wallet/history')}
              />
            </YStack>
          ) : (
            /* Error state */
            <YStack alignItems="center" paddingVertical={60} gap={16}>
              <GlassPanel
                padding={24}
                borderRadius={20}
                blurTint={t.glassBlurTint}
                intensity={t.glassBlurIntensity}
                borderColor={t.glassBorder}
              >
                <YStack alignItems="center" gap={12}>
                  <CreditCard size={48} color={t.textTertiary} weight="duotone" />
                  <Text style={[styles.errorText, { color: t.textSecondary }]}>
                    Nao foi possivel carregar a carteira.
                  </Text>
                  <Pressable
                    onPress={() => refetch()}
                    style={[
                      styles.retryButton,
                      { backgroundColor: t.accentBg, borderColor: t.accentBorder },
                    ]}
                  >
                    <Text style={[styles.retryText, { color: t.accent }]}>
                      Tentar novamente
                    </Text>
                  </Pressable>
                </YStack>
              </GlassPanel>
            </YStack>
          )}
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
