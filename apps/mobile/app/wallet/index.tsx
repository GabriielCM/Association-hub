import { ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button, Spinner } from '@ahub/ui';
import { useWalletDashboard } from '@/features/wallet/hooks/useWallet';
import { WalletCard } from '@/features/wallet/components/WalletCard';
import { QuickActions } from '@/features/wallet/components/QuickActions';
import { StravaCard } from '@/features/wallet/components/StravaCard';
import { useCachedBalance } from '@/stores/wallet.store';
import { formatPoints } from '@ahub/shared/utils';

export default function WalletHomeScreen() {
  const { data: dashboard, isLoading, refetch, isRefetching } = useWalletDashboard();
  const cachedBalance = useCachedBalance();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <YStack padding="$4" gap="$4">
          {/* Header */}
          <XStack alignItems="center" gap="$2">
            <Button variant="ghost" size="sm" onPress={() => router.back()}>
              ←
            </Button>
            <Heading level={3}>Minha Carteira</Heading>
          </XStack>

          {/* Loading state */}
          {isLoading && !dashboard ? (
            <YStack alignItems="center" paddingVertical="$8" gap="$2">
              {cachedBalance !== null && (
                <Text color="secondary" size="sm">
                  Último saldo: {formatPoints(cachedBalance)} pts
                </Text>
              )}
              <Spinner size="lg" />
            </YStack>
          ) : dashboard ? (
            <>
              {/* Wallet Card */}
              <WalletCard
                dashboard={dashboard}
                onQrPress={() => router.push('/(tabs)/carteirinha')}
              />

              {/* Quick Actions */}
              <QuickActions
                onTransfer={() => router.push('/wallet/transfer')}
                onScanner={() => router.push('/wallet/scanner')}
                onHistory={() => router.push('/wallet/history')}
              />

              {/* Strava */}
              <StravaCard
                strava={dashboard.strava}
                onConnect={() => router.push('/wallet/strava')}
                onDetails={() => router.push('/wallet/strava')}
              />

              {/* Recent Recipients */}
              {dashboard.recentRecipients.length > 0 && (
                <YStack gap="$2">
                  <Text weight="semibold" size="lg">
                    Transferir novamente
                  </Text>
                  <XStack gap="$3" flexWrap="wrap">
                    {dashboard.recentRecipients.slice(0, 4).map((r) => (
                      <YStack key={r.id} alignItems="center" gap={4}>
                        <Text style={{ fontSize: 28 }}>👤</Text>
                        <Text size="xs" numberOfLines={1} style={{ maxWidth: 60 }}>
                          {r.name.split(' ')[0]}
                        </Text>
                      </YStack>
                    ))}
                  </XStack>
                </YStack>
              )}
            </>
          ) : (
            <YStack alignItems="center" paddingVertical="$8">
              <Text style={{ fontSize: 40 }}>💳</Text>
              <Text color="secondary" align="center" marginTop="$2">
                Não foi possível carregar a carteira.
              </Text>
              <Button variant="outline" marginTop="$4" onPress={() => refetch()}>
                Tentar novamente
              </Button>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
