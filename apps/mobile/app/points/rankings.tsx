import { useState } from 'react';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, Heading, Badge, Spinner, Card } from '@ahub/ui';
import { RankingList } from '@/features/points/components/RankingList';
import { useRankings } from '@/features/points/hooks/useRankings';
import type { RankingType, RankingPeriod } from '@ahub/shared/types';

const TABS: { label: string; value: RankingType }[] = [
  { label: 'Pontos', value: 'points' },
  { label: 'Eventos', value: 'events' },
  { label: 'Strava', value: 'strava' },
];

const PERIODS: { label: string; value: RankingPeriod }[] = [
  { label: 'Geral', value: 'all_time' },
  { label: 'Mensal', value: 'monthly' },
  { label: 'Semanal', value: 'weekly' },
];

export default function RankingsScreen() {
  const [activeTab, setActiveTab] = useState<RankingType>('points');
  const [activePeriod, setActivePeriod] = useState<RankingPeriod>('all_time');

  const { data: ranking, isLoading } = useRankings(activeTab, activePeriod);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} padding="$4" gap="$3">
        <Heading level={3}>Rankings</Heading>

        {/* Type tabs */}
        <XStack gap="$2">
          {TABS.map((tab) => (
            <Badge
              key={tab.value}
              variant={activeTab === tab.value ? 'primary' : 'outline'}
              size="lg"
              onPress={() => setActiveTab(tab.value)}
              pressStyle={{ opacity: 0.7 }}
              flex={1}
            >
              {tab.label}
            </Badge>
          ))}
        </XStack>

        {/* Period selector */}
        <XStack gap="$1">
          {PERIODS.map((period) => (
            <Badge
              key={period.value}
              variant={activePeriod === period.value ? 'secondary' : 'ghost'}
              size="sm"
              onPress={() => setActivePeriod(period.value)}
              pressStyle={{ opacity: 0.7 }}
            >
              {period.label}
            </Badge>
          ))}
        </XStack>

        {/* Rankings */}
        {isLoading ? (
          <Spinner />
        ) : ranking && ranking.entries.length > 0 ? (
          <RankingList
            entries={ranking.entries}
            type={ranking.type}
            currentUser={ranking.currentUser}
          />
        ) : (
          <Card variant="flat">
            <YStack alignItems="center" paddingVertical="$4">
              <Text color="secondary">
                Nenhum dado disponivel para este periodo
              </Text>
            </YStack>
          </Card>
        )}
      </YStack>
    </SafeAreaView>
  );
}
