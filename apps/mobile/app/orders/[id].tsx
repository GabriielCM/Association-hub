import { ScrollView, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Button, Spinner, ScreenHeader, Icon } from '@ahub/ui';
import { MISC_ICONS } from '@ahub/ui/src/icons';
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
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3" padding="$4">
          <Icon icon={MISC_ICONS.warning} size="xl" color="muted" weight="duotone" />
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
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {/* Header */}
      <ScreenHeader
        title={`Pedido #${order.code}`}
        onBack={() => router.back()}
        rightContent={<OrderStatusBadge status={order.status} />}
      />

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
