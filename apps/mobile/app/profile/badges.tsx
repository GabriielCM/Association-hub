import { FlatList, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button, Spinner } from '@ahub/ui';
import { useAuthContext } from '@/providers/AuthProvider';
import { useUserBadges } from '@/features/profile/hooks/useProfile';
import { useUpdateBadgesDisplay } from '@/features/profile/hooks/useEditProfile';
import { BadgeCard } from '@/features/profile/components/BadgeCard';
import { RankingRow } from '@/features/profile/components/RankingRow';
import { useUserRankings } from '@/features/profile/hooks/useProfile';
import type { UserBadge } from '@ahub/shared/types';

export default function BadgesScreen() {
  const { user } = useAuthContext();
  const userId = user?.id || '';

  const { data: badgesData, isLoading: loadingBadges } = useUserBadges(userId);
  const { data: rankingsData, isLoading: loadingRankings } =
    useUserRankings(userId);

  if (loadingBadges || loadingRankings) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" />
        </YStack>
      </SafeAreaView>
    );
  }

  const badges = badgesData?.data || [];
  const rankings = rankingsData?.data || [];

  const renderBadge = ({ item }: { item: UserBadge }) => (
    <View style={styles.badgeWrapper}>
      <BadgeCard badge={item} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} padding="$4" gap="$4">
        {/* Header */}
        <XStack alignItems="center" gap="$2">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
          >
            ←
          </Button>
          <Heading level={3}>Badges & Rankings</Heading>
        </XStack>

        <FlatList
          data={[]}
          renderItem={() => null}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <YStack gap="$6">
              {/* Badges Section */}
              <YStack gap="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text weight="semibold" size="lg">
                    Meus Badges ({badges.length})
                  </Text>
                  <Text color="secondary" size="sm">
                    {badgesData?.featured || 0}/3 em destaque
                  </Text>
                </XStack>

                {badges.length > 0 ? (
                  <View style={styles.grid}>
                    {badges.map((badge) => (
                      <View key={badge.id} style={styles.badgeWrapper}>
                        <BadgeCard
                          badge={badge}
                          isSelected={badge.isFeatured}
                        />
                      </View>
                    ))}
                  </View>
                ) : (
                  <YStack alignItems="center" paddingVertical="$6">
                    <Text style={{ fontSize: 40 }}>🏆</Text>
                    <Text color="secondary" align="center" marginTop="$2">
                      Participe de eventos e atividades para conquistar badges!
                    </Text>
                  </YStack>
                )}
              </YStack>

              {/* Rankings Section */}
              <YStack gap="$3">
                <Text weight="semibold" size="lg">
                  Meus Rankings
                </Text>
                {rankings.length > 0 ? (
                  <YStack gap="$2">
                    {rankings.map((ranking) => (
                      <RankingRow key={ranking.type} ranking={ranking} />
                    ))}
                  </YStack>
                ) : (
                  <Text color="secondary" align="center">
                    Nenhum ranking disponível.
                  </Text>
                )}
              </YStack>
            </YStack>
          }
        />
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeWrapper: {
    width: '31%',
    minWidth: 100,
  },
});
