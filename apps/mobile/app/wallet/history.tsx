import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Spinner } from '@ahub/ui';
import { ClipboardText, CaretLeft } from '@ahub/ui/src/icons';
import { usePointsHistory } from '@/features/points/hooks/usePointsHistory';
import { TransactionDetail } from '@/features/points/components/TransactionDetail';
import type { PointTransaction, TransactionType } from '@ahub/shared/types';
import { WalletGlassBackground } from '@/features/wallet/components/WalletGlassBackground';
import { GlassSearchBar } from '@/features/wallet/components/GlassSearchBar';
import { GlassFilterChip } from '@/features/wallet/components/GlassFilterChip';
import { GlassTransactionItem } from '@/features/wallet/components/GlassTransactionItem';
import { ShimmerGlassSkeleton } from '@/features/wallet/components/ShimmerGlassSkeleton';

const FILTERS = [
  { label: 'Todos', value: '' },
  { label: 'Ganhos', value: 'CREDIT' },
  { label: 'Gastos', value: 'DEBIT' },
  { label: 'Transfers', value: 'TRANSFER' },
] as const;

function groupByDate(transactions: PointTransaction[]): { date: string; data: PointTransaction[] }[] {
  const groups: Record<string, PointTransaction[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const tx of transactions) {
    const txDate = new Date(tx.createdAt);
    let dateKey: string;

    if (txDate.toDateString() === today.toDateString()) {
      dateKey = 'Hoje';
    } else if (txDate.toDateString() === yesterday.toDateString()) {
      dateKey = 'Ontem';
    } else {
      dateKey = txDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    }

    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(tx);
  }

  return Object.entries(groups).map(([date, data]) => ({ date, data }));
}

export default function WalletHistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<PointTransaction | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePointsHistory({ type: (typeFilter as TransactionType) || undefined });

  const transactions = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data],
  );

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter((tx) => {
      const desc = ((tx as any).description ?? (tx as any).label ?? '').toLowerCase();
      return desc.includes(query);
    });
  }, [transactions, searchQuery]);

  const sections = useMemo(() => groupByDate(filteredTransactions), [filteredTransactions]);

  return (
    <View style={styles.root}>
      <WalletGlassBackground />
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <CaretLeft size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Historico</Text>
          <View style={{ width: 34 }} />
        </View>

        <YStack flex={1} paddingHorizontal={20} gap={12}>
          {/* Search */}
          <GlassSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar transacao..."
          />

          {/* Filter Chips */}
          <XStack gap={8}>
            {FILTERS.map((f) => (
              <GlassFilterChip
                key={f.value}
                label={f.label}
                active={typeFilter === f.value}
                onPress={() => setTypeFilter(f.value)}
              />
            ))}
          </XStack>

          {/* Transaction List */}
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionHeader}>{section.date}</Text>
            )}
            renderItem={({ item }) => (
              <GlassTransactionItem
                transaction={item}
                onPress={() => setSelectedTransaction(item)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={
              isLoading ? (
                <YStack gap={12} paddingVertical={20}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ShimmerGlassSkeleton key={i} width="100%" height={56} borderRadius={12} />
                  ))}
                </YStack>
              ) : (
                <YStack alignItems="center" paddingVertical={60}>
                  <ClipboardText size={48} color="rgba(255,255,255,0.2)" weight="duotone" />
                  <Text style={styles.emptyText}>
                    Nenhuma transacao encontrada.
                  </Text>
                </YStack>
              )
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <YStack alignItems="center" paddingVertical={16}>
                  <Spinner />
                </YStack>
              ) : null
            }
            contentContainerStyle={styles.listContent}
          />
        </YStack>

        <TransactionDetail
          transaction={selectedTransaction}
          visible={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D0520',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionHeader: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingTop: 16,
    paddingBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
});
