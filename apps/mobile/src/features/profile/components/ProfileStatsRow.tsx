import { XStack, YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import type { UserProfile } from '@ahub/shared/types';

interface ProfileStatsRowProps {
  profile: UserProfile;
}

function formatPoints(value: number): string {
  if (value >= 10000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toLocaleString('pt-BR');
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const year = d.getFullYear();
  return `${month}/${year}`;
}

export function ProfileStatsRow({ profile }: ProfileStatsRowProps) {
  return (
    <YStack alignItems="center" gap="$2" paddingHorizontal="$4">
      <XStack justifyContent="space-evenly" width="100%">
        <YStack alignItems="center">
          <Text weight="bold" size="xl">
            {formatPoints(profile.stats.points)}
          </Text>
          <Text color="secondary" size="xs">
            Pontos
          </Text>
        </YStack>
        <YStack alignItems="center">
          <Text weight="bold" size="xl">
            {formatPoints(profile.stats.lifetimePoints)}
          </Text>
          <Text color="secondary" size="xs">
            Total ganho
          </Text>
        </YStack>
      </XStack>
      <Text color="tertiary" size="xs">
        Membro desde {formatDate(profile.memberSince)}
      </Text>
    </YStack>
  );
}
