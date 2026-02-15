import { Pressable, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Card } from '@ahub/ui';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order } from '@ahub/shared/types';

interface OrderCardProps {
  order: Order;
  onPress: (order: Order) => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  const itemsPreview =
    order.itemsPreview && order.itemsPreview.length > 0
      ? order.itemsPreview
          .slice(0, 2)
          .map((i) => i.name)
          .join(', ')
      : `${order.itemsCount} item(ns)`;

  const remaining = order.itemsCount - 2;

  return (
    <Pressable onPress={() => onPress(order)}>
      <Card variant="flat">
        <YStack gap="$2">
          {/* Top row: code + status */}
          <XStack justifyContent="space-between" alignItems="center">
            <XStack gap="$2" alignItems="center">
              <Text weight="bold" size="sm" style={styles.code}>
                #{order.code}
              </Text>
              <Text size="xs" color="secondary">
                {dateStr}
              </Text>
            </XStack>
            <OrderStatusBadge status={order.status} />
          </XStack>

          {/* Items preview */}
          <Text size="sm" color="secondary" numberOfLines={1}>
            {itemsPreview}
            {remaining > 0 ? ` +${remaining}` : ''}
          </Text>

          {/* Bottom row: source + total */}
          <XStack justifyContent="space-between" alignItems="center">
            <Text size="xs" color="secondary">
              {order.source === 'STORE' ? 'Loja' : 'PDV'} · {order.sourceName}
            </Text>
            <XStack gap="$1" alignItems="center">
              {order.pointsUsed != null && order.pointsUsed > 0 && (
                <Text size="xs" weight="semibold" color="accent">
                  {formatPoints(order.pointsUsed)} pts
                </Text>
              )}
              {order.moneyPaid != null && order.moneyPaid > 0 && (
                <Text size="xs" weight="semibold">
                  {formatCurrency(order.moneyPaid)}
                </Text>
              )}
            </XStack>
          </XStack>
        </YStack>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  code: {
    fontFamily: 'monospace',
  },
});
