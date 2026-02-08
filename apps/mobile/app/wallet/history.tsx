import { useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button, Spinner } from '@ahub/ui';
import { usePointsHistory } from '@/features/points/hooks/usePointsHistory';
import { TransactionItem } from '@/features/points/components/TransactionItem';
import { TransactionDetail } from '@/features/points/components/TransactionDetail';
import { FilterBar } from '@/features/points/components/FilterBar';
import type { PointTransaction, TransactionType } from '@ahub/shared/types';

export default function WalletHistoryScreen() {
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>();
  const [selectedTransaction, setSelectedTransaction] = useState<PointTransaction | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePointsHistory({ type: typeFilter });

  const transactions = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data]
  );

  const renderItem = ({ item }: { item: PointTransaction }) => (
    <TransactionItem transaction={item} onPress={setSelectedTransaction} />
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} padding="$4" gap="$4">
        {/* Header */}
        <XStack alignItems="center" gap="$2">
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            ←
          </Button>
          <Heading level={3}>Histórico</Heading>
        </XStack>

        {/* Filters */}
        <FilterBar
          selectedType={typeFilter}
          onTypeChange={setTypeFilter}
        />

        {/* Transactions List */}
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            isLoading ? (
              <YStack alignItems="center" paddingVertical="$8">
                <Spinner size="large" />
              </YStack>
            ) : (
              <YStack alignItems="center" paddingVertical="$8">
                <Text style={{ fontSize: 40 }}>📋</Text>
                <Text color="secondary" align="center" marginTop="$2">
                  Nenhuma transação encontrada.
                </Text>
              </YStack>
            )
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <YStack alignItems="center" paddingVertical="$4">
                <Spinner />
              </YStack>
            ) : null
          }
        />

        <TransactionDetail
          transaction={selectedTransaction}
          visible={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      </YStack>
    </SafeAreaView>
  );
}
