import { XStack, YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import type { UserProfile } from '@ahub/shared/types';

interface ProfileStatsProps {
  profile: UserProfile;
}

function formatPoints(value: number): string {
  if (value >= 10000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toLocaleString('pt-BR');
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
  });
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  return (
    <XStack justifyContent="space-around" paddingVertical="$3">
      <StatItem
        label="Pontos"
        value={formatPoints(profile.stats.points)}
      />
      <StatItem
        label="Total ganho"
        value={formatPoints(profile.stats.lifetimePoints)}
      />
      <StatItem
        label="Membro desde"
        value={formatDate(profile.memberSince)}
      />
    </XStack>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <YStack alignItems="center" gap="$1">
      <Text weight="bold" size="lg">
        {value}
      </Text>
      <Text color="secondary" size="xs">
        {label}
      </Text>
    </YStack>
  );
}
