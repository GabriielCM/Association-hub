import { useState, useCallback } from 'react';
import { FlatList, StyleSheet, Pressable } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Heading, Spinner, Icon } from '@ahub/ui';
import { Ticket } from '@ahub/ui/src/icons';
import { useMyVouchers, useOrderVouchers } from '@/features/orders/hooks/useOrders';
import { VoucherCard } from '@/features/orders/components/VoucherCard';
import type { Voucher } from '@ahub/shared/types';

type VoucherTab = 'available' | 'used';

export default function VouchersScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const [tab, setTab] = useState<VoucherTab>('available');

  // If orderId is provided, show vouchers for that order; otherwise show all user vouchers
  const myVouchersQuery = useMyVouchers();
  const orderVouchersQuery = useOrderVouchers(orderId ?? '');
  const query = orderId ? orderVouchersQuery : myVouchersQuery;

  const allVouchers = query.data ?? [];
  const filteredVouchers = allVouchers.filter((v) =>
    tab === 'available'
      ? v.status === 'available'
      : v.status === 'used' || v.status === 'expired',
  );

  const handleVoucherPress = useCallback((voucher: Voucher) => {
    router.push({
      pathname: '/orders/voucher/[id]' as any,
      params: { id: voucher.id, code: voucher.code, qrCode: voucher.qrCode },
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {/* Header */}
      <XStack paddingHorizontal="$4" paddingVertical="$3" alignItems="center" gap="$3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text size="lg">←</Text>
        </Pressable>
        <Heading level={4}>
          {orderId ? 'Vouchers do Pedido' : 'Meus Vouchers'}
        </Heading>
      </XStack>

      {/* Tabs */}
      <XStack paddingHorizontal="$4" gap="$2" marginBottom="$2">
        <Pressable
          onPress={() => setTab('available')}
          style={[styles.tab, tab === 'available' && styles.tabActive]}
        >
          <Text
            size="sm"
            weight={tab === 'available' ? 'bold' : 'medium'}
            style={tab === 'available' ? styles.tabTextActive : styles.tabText}
          >
            Disponiveis
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('used')}
          style={[styles.tab, tab === 'used' && styles.tabActive]}
        >
          <Text
            size="sm"
            weight={tab === 'used' ? 'bold' : 'medium'}
            style={tab === 'used' ? styles.tabTextActive : styles.tabText}
          >
            Usados
          </Text>
        </Pressable>
      </XStack>

      {/* Content */}
      {query.isLoading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      ) : filteredVouchers.length === 0 ? (
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap="$3"
          padding="$4"
        >
          <Icon icon={Ticket} size="xl" color="muted" />
          <Text weight="semibold">
            {tab === 'available' ? 'Nenhum voucher disponivel' : 'Nenhum voucher usado'}
          </Text>
          <Text color="secondary" size="sm" align="center">
            {tab === 'available'
              ? 'Vouchers de compras aparecerão aqui'
              : 'Vouchers utilizados aparecerão aqui'}
          </Text>
        </YStack>
      ) : (
        <FlatList
          data={filteredVouchers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VoucherCard voucher={item} onPress={handleVoucherPress} />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabActive: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
});
