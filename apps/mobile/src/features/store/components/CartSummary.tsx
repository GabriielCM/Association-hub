import { StyleSheet } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Card } from '@ahub/ui';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';

interface CartSummaryProps {
  subtotalPoints: number;
  subtotalMoney: number;
  itemCount: number;
  discountPoints?: number | undefined;
  discountMoney?: number | undefined;
  totalPoints?: number | undefined;
  totalMoney?: number | undefined;
}

export function CartSummary({
  subtotalPoints,
  subtotalMoney,
  itemCount,
  discountPoints,
  discountMoney,
  totalPoints,
  totalMoney,
}: CartSummaryProps) {
  const showTotal = totalPoints != null || totalMoney != null;
  const hasDiscount =
    (discountPoints != null && discountPoints > 0) ||
    (discountMoney != null && discountMoney > 0);

  return (
    <Card variant="flat">
      <YStack gap="$2">
        {/* Item count */}
        <XStack justifyContent="space-between">
          <Text size="sm" color="secondary">
            Itens
          </Text>
          <Text size="sm">{itemCount}</Text>
        </XStack>

        {/* Subtotal */}
        <XStack justifyContent="space-between">
          <Text size="sm" color="secondary">
            Subtotal
          </Text>
          <YStack alignItems="flex-end">
            {subtotalPoints > 0 && (
              <Text size="sm">{formatPoints(subtotalPoints)} pts</Text>
            )}
            {subtotalMoney > 0 && (
              <Text size="xs" color="secondary">
                {formatCurrency(subtotalMoney)}
              </Text>
            )}
          </YStack>
        </XStack>

        {/* Discount */}
        {hasDiscount && (
          <XStack justifyContent="space-between">
            <Text size="sm" color="success">
              Desconto assinatura
            </Text>
            <YStack alignItems="flex-end">
              {discountPoints != null && discountPoints > 0 && (
                <Text size="sm" color="success">
                  -{formatPoints(discountPoints)} pts
                </Text>
              )}
              {discountMoney != null && discountMoney > 0 && (
                <Text size="xs" color="success">
                  -{formatCurrency(discountMoney)}
                </Text>
              )}
            </YStack>
          </XStack>
        )}

        {/* Total */}
        {showTotal && (
          <>
            <View style={styles.separator} />
            <XStack justifyContent="space-between">
              <Text size="sm" weight="bold">
                Total
              </Text>
              <YStack alignItems="flex-end">
                {totalPoints != null && totalPoints > 0 && (
                  <Text color="accent" weight="bold" size="sm">
                    {formatPoints(totalPoints)} pts
                  </Text>
                )}
                {totalMoney != null && totalMoney > 0 && (
                  <Text size="sm" weight="bold">
                    {formatCurrency(totalMoney)}
                  </Text>
                )}
              </YStack>
            </XStack>
          </>
        )}
      </YStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
});
