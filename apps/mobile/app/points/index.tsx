import { useState } from 'react';
import { FlatList } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Text, Heading, Button, Card, Spinner } from '@ahub/ui';
import { PointsCard } from '@/features/points/components/PointsCard';
import { TransactionItem } from '@/features/points/components/TransactionItem';
import { TransactionDetail } from '@/features/points/components/TransactionDetail';
import { FilterBar } from '@/features/points/components/FilterBar';
import { usePointsHistory } from '@/features/points/hooks/usePointsHistory';
import { usePointsSocket } from '@/features/points/hooks/usePointsSocket';
import type { PointTransaction, TransactionType } from '@ahub/shared/types';

export default function PointsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | ''>('');
  const [selectedTransaction, setSelectedTransaction] =
    useState<PointTransaction | null>(null);

  usePointsSocket();

  const filters = {
    ...(selectedType ? { type: selectedType as TransactionType } : {}),
    ...(selectedPeriod
      ? {
          startDate: getStartDate(selectedPeriod),
          endDate: new Date().toISOString().split('T')[0],
        }
      : {}),
  };

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePointsHistory(filters);

  const transactions = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} padding="$4" gap="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <Heading level={3}>Meus Pontos</Heading>
        </XStack>

        <PointsCard />

        {/* Quick Actions */}
        <XStack gap="$2">
          <Button
            flex={1}
            variant="outline"
            size="sm"
            onPress={() => router.push('/points/transfer')}
          >
            Transferir
          </Button>
          <Button
            flex={1}
            variant="outline"
            size="sm"
            onPress={() => router.push('/points/rankings')}
          >
            Rankings
          </Button>
        </XStack>

        {/* History */}
        <YStack gap="$2" flex={1}>
          <Text weight="semibold" size="lg">
            Historico
          </Text>

          <FilterBar
            selectedPeriod={selectedPeriod}
            selectedType={selectedType}
            onPeriodChange={setSelectedPeriod}
            onTypeChange={setSelectedType}
          />

          {isLoading ? (
            <Spinner />
          ) : transactions.length === 0 ? (
            <Card variant="flat">
              <YStack alignItems="center" paddingVertical="$4">
                <Text color="secondary">Nenhuma transacao encontrada</Text>
              </YStack>
            </Card>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TransactionItem
                  transaction={item}
                  onPress={setSelectedTransaction}
                />
              )}
              onEndReached={() => {
                if (hasNextPage) fetchNextPage();
              }}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                isFetchingNextPage ? <Spinner size="sm" /> : null
              }
            />
          )}
        </YStack>

        <TransactionDetail
          transaction={selectedTransaction}
          visible={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      </YStack>
    </SafeAreaView>
  );
}

function getStartDate(period: string): string {
  const now = new Date();
  switch (period) {
    case 'today':
      return now.toISOString().split('T')[0];
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo.toISOString().split('T')[0];
    }
    case 'month': {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return monthAgo.toISOString().split('T')[0];
    }
    default:
      return '';
  }
}
