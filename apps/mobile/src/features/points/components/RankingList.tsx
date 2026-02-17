import { FlatList } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Text, Avatar, Card, Icon } from '@ahub/ui';
import { Trophy, Medal } from '@ahub/ui/src/icons';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { formatPoints } from '@ahub/shared/utils';
import type { RankingEntry, RankingType } from '@ahub/shared/types';

const POSITION_STYLES: Record<number, { icon: PhosphorIcon; color: string }> = {
  1: { icon: Trophy, color: '#FFD700' },
  2: { icon: Medal, color: '#C0C0C0' },
  3: { icon: Medal, color: '#CD7F32' },
};

function formatValue(value: number, type: RankingType): string {
  if (type === 'strava') return `${value.toFixed(1)} km`;
  if (type === 'events') return `${value} check-ins`;
  return `${formatPoints(value)} pts`;
}

interface RankingListProps {
  entries: RankingEntry[];
  type: RankingType;
  currentUser?: { position: number; value: number } | undefined;
}

export function RankingList({ entries, type, currentUser }: RankingListProps) {
  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.userId}
      renderItem={({ item }) => (
        <RankingRow entry={item} type={type} />
      )}
      ListFooterComponent={
        currentUser && currentUser.position > entries.length ? (
          <YStack paddingVertical="$2">
            <Text color="secondary" size="xs" align="center">
              ...
            </Text>
            <Card
              variant="flat"
              backgroundColor="$primary"
              opacity={0.1}
              padding="$2"
            >
              <XStack alignItems="center" gap="$2">
                <Text weight="bold" size="sm">
                  #{currentUser.position}
                </Text>
                <Text size="sm" weight="medium" flex={1}>
                  Voce
                </Text>
                <Text size="sm" weight="semibold">
                  {formatValue(currentUser.value, type)}
                </Text>
              </XStack>
            </Card>
          </YStack>
        ) : null
      }
    />
  );
}

function RankingRow({ entry, type }: { entry: RankingEntry; type: RankingType }) {
  const posStyle = POSITION_STYLES[entry.position];

  return (
    <XStack
      alignItems="center"
      gap="$2"
      paddingVertical="$2"
      paddingHorizontal="$1"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      backgroundColor={entry.isCurrentUser ? '$backgroundHover' : 'transparent'}
      borderRadius={entry.isCurrentUser ? '$md' : 0}
    >
      <XStack width={36} justifyContent="center">
        {posStyle ? (
          <Icon icon={posStyle.icon} size="lg" color={posStyle.color} weight="fill" />
        ) : (
          <Text color="secondary" size="sm" weight="semibold" align="center">
            {entry.position}
          </Text>
        )}
      </XStack>

      <Avatar src={entry.userAvatar} name={entry.userName} size="sm" />

      <Text size="sm" weight="medium" flex={1} numberOfLines={1}>
        {entry.userName}
        {entry.isCurrentUser ? ' (voce)' : ''}
      </Text>

      <Text
        size="sm"
        weight="bold"
        color={posStyle ? 'accent' : 'primary'}
      >
        {formatValue(entry.value, type)}
      </Text>
    </XStack>
  );
}
