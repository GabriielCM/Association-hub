import { View, StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Trophy, Calendar, PersonSimpleRun, ChartBar } from '@ahub/ui/src/icons';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import type { UserRankingEntry } from '@ahub/shared/types';
import { useProfileTheme } from '../hooks/useProfileTheme';

interface RankingRowProps {
  ranking: UserRankingEntry;
}

const typeIcons: Record<string, PhosphorIcon> = {
  points: Trophy,
  events: Calendar,
  strava: PersonSimpleRun,
};

export function RankingRow({ ranking }: RankingRowProps) {
  const pt = useProfileTheme();

  return (
    <XStack
      padding="$3"
      borderRadius={12}
      backgroundColor="$backgroundSecondary"
      alignItems="center"
      gap="$3"
    >
      <View style={[styles.iconContainer, { backgroundColor: pt.accentBg }]}>
        <Icon icon={typeIcons[ranking.type] || ChartBar} size="md" color="primary" />
      </View>

      <YStack flex={1}>
        <Text weight="medium" style={{ color: pt.textPrimary }}>{ranking.name}</Text>
        <Text color="secondary" size="sm" style={{ color: pt.textSecondary }}>
          {ranking.value} {ranking.unit}
        </Text>
      </YStack>

      {ranking.position !== null && (
        <YStack alignItems="center">
          <Text weight="bold" size="lg" style={{ color: pt.textPrimary }}>
            #{ranking.position}
          </Text>
          {ranking.totalParticipants !== null && (
            <Text color="secondary" size="xs" style={{ color: pt.textSecondary }}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
});
