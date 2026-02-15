import { useState, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Pressable } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, Heading, Spinner } from '@ahub/ui';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { OrderCard } from '@/features/orders/components/OrderCard';
import { OrderFilters } from '@/features/orders/components/OrderFilters';
import type { Order, OrdersFilter } from '@ahub/shared/types';

export default function OrdersListScreen() {
  const [filters, setFilters] = useState<OrdersFilter>({});
  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useOrders(filters);

  const orders = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const handleOrderPress = useCallback((order: Order) => {
    router.push({
      pathname: '/orders/[id]' as any,
      params: { id: order.id },
    });
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        justifyContent="space-between"
      >
        <XStack gap="$3" alignItems="center">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Text size="lg">←</Text>
          </Pressable>
          <Heading level={4}>Meus Pedidos</Heading>
        </XStack>
        <Pressable
          onPress={() => router.push('/orders/vouchers' as any)}
          hitSlop={8}
        >
          <Text size="lg">🎟️</Text>
        </Pressable>
      </XStack>

      {/* Filters */}
      <OrderFilters filters={filters} onChange={setFilters} />

      {/* Orders list */}
      {isLoading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      ) : orders.length === 0 ? (
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap="$3"
          padding="$4"
        >
          <Text size="2xl">📋</Text>
          <Text weight="semibold">Nenhum pedido encontrado</Text>
          <Text color="secondary" size="sm" align="center">
            {filters.source || filters.status
              ? 'Tente alterar os filtros'
              : 'Seus pedidos aparecerão aqui'}
          </Text>
        </YStack>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={handleOrderPress} />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          refreshing={isFetching && !isFetchingNextPage}
          onRefresh={() => refetch()}
          ListFooterComponent={
            isFetchingNextPage ? (
              <YStack padding="$3" alignItems="center">
                <Spinner />
              </YStack>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
});
