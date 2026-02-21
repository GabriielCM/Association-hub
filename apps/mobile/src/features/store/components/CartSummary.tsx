import { StyleSheet } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Card } from '@ahub/ui';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import { useStoreTheme } from '../hooks/useStoreTheme';

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
  const st = useStoreTheme();
  const showTotal = totalPoints != null || totalMoney != null;
  const hasDiscount =
    (discountPoints != null && discountPoints > 0) ||
    (discountMoney != null && discountMoney > 0);

  return (
    <Card
      variant="flat"
      {...(st.cardBg ? {
        backgroundColor: st.cardBg,
        borderWidth: 1,
        borderColor: st.cardBorder,
        shadowOpacity: 0,
      } : {})}
    >
      <YStack gap="$2">
        {/* Item count */}
        <XStack justifyContent="space-between">
          <Text size="sm" style={{ color: st.textSecondary }}>
            Itens
          </Text>
          <Text size="sm" style={{ color: st.textPrimary }}>{itemCount}</Text>
        </XStack>

        {/* Subtotal */}
        <XStack justifyContent="space-between">
          <Text size="sm" style={{ color: st.textSecondary }}>
            Subtotal
          </Text>
          <YStack alignItems="flex-end">
            {subtotalPoints > 0 && (
              <Text size="sm" style={{ color: st.textPrimary }}>
                {formatPoints(subtotalPoints)} pts
              </Text>
            )}
            {subtotalMoney > 0 && (
              <Text size="xs" style={{ color: st.textSecondary }}>
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
            <View style={[styles.separator, { backgroundColor: st.borderColor }]} />
            <XStack justifyContent="space-between">
              <Text size="sm" weight="bold" style={{ color: st.textPrimary }}>
                Total
              </Text>
              <YStack alignItems="flex-end">
                {totalPoints != null && totalPoints > 0 && (
                  <Text weight="bold" size="sm" style={{ color: st.accent }}>
                    {formatPoints(totalPoints)} pts
                  </Text>
                )}
                {totalMoney != null && totalMoney > 0 && (
                  <Text size="sm" weight="bold" style={{ color: st.textPrimary }}>
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
    marginVertical: 4,
  },
});
