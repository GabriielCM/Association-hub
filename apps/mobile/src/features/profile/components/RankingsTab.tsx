import { YStack } from 'tamagui';
import { Text, Spinner } from '@ahub/ui';
import { useUserRankings } from '@/features/profile/hooks/useProfile';
import { RankingRow } from './RankingRow';

interface RankingsTabProps {
  userId: string;
}

export function RankingsTab({ userId }: RankingsTabProps) {
  const { data: rankingsData, isLoading } = useUserRankings(userId);

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
        <Text style={{ fontSize: 48 }}>📊</Text>
        <Text weight="semibold" size="lg">
          Nenhum ranking disponível
        </Text>
        <Text color="secondary" size="sm" align="center" style={{ maxWidth: 260 }}>
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
