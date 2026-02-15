import { YStack, XStack } from 'tamagui';
import { Text, Card } from '@ahub/ui';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import type { Order } from '@ahub/shared/types';

const PAYMENT_METHOD_LABELS: Record<string, { icon: string; label: string }> = {
  POINTS: { icon: '🪙', label: 'Pontos' },
  MONEY: { icon: '💳', label: 'Cartao' },
  MIXED: { icon: '🔀', label: 'Misto' },
};

interface OrderPaymentSummaryProps {
  order: Order;
}

export function OrderPaymentSummary({ order }: OrderPaymentSummaryProps) {
  const method = PAYMENT_METHOD_LABELS[order.paymentMethod] ?? {
    icon: '💰',
    label: order.paymentMethod,
  };

  return (
    <Card variant="flat">
      <YStack gap="$3">
        <Text weight="semibold" size="sm">
          Pagamento
        </Text>

        <XStack justifyContent="space-between" alignItems="center">
          <Text size="sm" color="secondary">
            Metodo
          </Text>
          <XStack gap="$1" alignItems="center">
            <Text size="sm">{method.icon}</Text>
            <Text size="sm" weight="medium">
              {method.label}
            </Text>
          </XStack>
        </XStack>

        {order.pointsUsed != null && order.pointsUsed > 0 && (
          <XStack justifyContent="space-between" alignItems="center">
            <Text size="sm" color="secondary">
              Pontos utilizados
            </Text>
            <Text size="sm" weight="semibold" color="accent">
              {formatPoints(order.pointsUsed)} pts
            </Text>
          </XStack>
        )}

        {order.moneyPaid != null && order.moneyPaid > 0 && (
          <XStack justifyContent="space-between" alignItems="center">
            <Text size="sm" color="secondary">
              Valor pago
            </Text>
            <Text size="sm" weight="semibold">
              {formatCurrency(order.moneyPaid)}
            </Text>
          </XStack>
        )}

        {order.cashbackEarned != null && order.cashbackEarned > 0 && (
          <XStack justifyContent="space-between" alignItems="center">
            <Text size="sm" color="secondary">
              Cashback recebido
            </Text>
            <Text size="sm" weight="bold" color="accent">
              +{formatPoints(order.cashbackEarned)} pts
            </Text>
          </XStack>
        )}
      </YStack>
    </Card>
  );
}
