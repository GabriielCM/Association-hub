import { View, StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import type { UserRankingEntry } from '@ahub/shared/types';

interface RankingRowProps {
  ranking: UserRankingEntry;
}

const typeIcons: Record<string, string> = {
  points: '🏆',
  events: '📅',
  strava: '🏃',
};

export function RankingRow({ ranking }: RankingRowProps) {
  return (
    <XStack
      padding="$3"
      borderRadius="$3"
      backgroundColor="$backgroundSecondary"
      alignItems="center"
      gap="$3"
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{typeIcons[ranking.type] || '📊'}</Text>
      </View>

      <YStack flex={1}>
        <Text weight="medium">{ranking.name}</Text>
        <Text color="secondary" size="sm">
          {ranking.value} {ranking.unit}
        </Text>
      </YStack>

      {ranking.position !== null && (
        <YStack alignItems="center">
          <Text weight="bold" size="lg" color="primary">
            #{ranking.position}
          </Text>
          {ranking.totalParticipants !== null && (
            <Text color="secondary" size="xs">
              de {ranking.totalParticipants}
            </Text>
          )}
        </YStack>
      )}
    </XStack>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
});
