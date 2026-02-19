import { YStack } from 'tamagui';
import { Text, Spinner, Icon } from '@ahub/ui';
import { ChartBar } from '@ahub/ui/src/icons';
import { useProfileTheme } from '../hooks/useProfileTheme';
import { useUserRankings } from '@/features/profile/hooks/useProfile';
import { RankingRow } from './RankingRow';

interface RankingsTabProps {
  userId: string;
}

export function RankingsTab({ userId }: RankingsTabProps) {
  const { data: rankingsData, isLoading } = useUserRankings(userId);
  const pt = useProfileTheme();

  const rankings = rankingsData?.data || [];

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$6">
        <Spinner size="lg" />
      </YStack>
    );
  }

  if (rankings.length === 0) {
    return (
      <YStack alignItems="center" paddingVertical="$8" gap="$3">
        <Icon icon={ChartBar} size={48} color="muted" weight="duotone" />
        <Text weight="semibold" size="lg" style={{ color: pt.textPrimary }}>
          Nenhum ranking disponível
        </Text>
        <Text color="secondary" size="sm" align="center" style={{ color: pt.textSecondary, maxWidth: 260 }}>
          Seus rankings aparecerão aqui conforme você participa.
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$2" paddingVertical="$3">
      {rankings.map((ranking) => (
        <RankingRow key={ranking.type} ranking={ranking} />
      ))}
    </YStack>
  );
}
