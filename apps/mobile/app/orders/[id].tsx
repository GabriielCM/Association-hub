import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Heading, Button, Spinner } from '@ahub/ui';
import { useOrder } from '@/features/orders/hooks/useOrders';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { OrderTimeline } from '@/features/orders/components/OrderTimeline';
import { OrderItems } from '@/features/orders/components/OrderItems';
import { OrderPaymentSummary } from '@/features/orders/components/OrderPaymentSummary';
import { PickupInfo } from '@/features/orders/components/PickupInfo';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrder(id ?? '');

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3" padding="$4">
          <Text size="2xl">😔</Text>
          <Text weight="semibold">Pedido nao encontrado</Text>
          <Button onPress={() => router.back()} size="sm">
            Voltar
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const hasVouchers = order.items.some((item) => item.type === 'VOUCHER');

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
          <Heading level={4}>Pedido #{order.code}</Heading>
        </XStack>
        <OrderStatusBadge status={order.status} />
      </XStack>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Timeline */}
        <OrderTimeline
          timeline={order.timeline}
          currentStatus={order.status}
        />

        {/* Items */}
        <OrderItems items={order.items} />

        {/* Pickup QR */}
        <PickupInfo
          pickupCode={order.pickupCode}
          pickupLocation={order.pickupLocation}
          status={order.status}
        />

        {/* Payment */}
        <OrderPaymentSummary order={order} />

        {/* Actions */}
        <YStack gap="$2">
          <Button
            variant="outline"
            onPress={() =>
              router.push({
                pathname: '/orders/receipt' as any,
                params: { orderId: order.id },
              })
            }
          >
            Ver comprovante
          </Button>

          {hasVouchers && (
            <Button
              variant="outline"
              onPress={() =>
                router.push({
                  pathname: '/orders/vouchers' as any,
                  params: { orderId: order.id },
                })
              }
            >
              Ver vouchers
            </Button>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 32,
  },
});
