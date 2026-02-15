import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { YStack, XStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';

interface MixedPaymentSliderProps {
  totalPoints: number;
  totalMoney: number;
  userBalance: number;
  pointsRate?: number;
  onPointsChange: (pointsToUse: number) => void;
}

const POINTS_TO_MONEY_RATE = 0.01; // 1 point = R$0.01
const MIN_STRIPE_AMOUNT = 100; // R$1.00 in centavos

export function MixedPaymentSlider({
  totalPoints,
  totalMoney,
  userBalance,
  pointsRate = POINTS_TO_MONEY_RATE,
  onPointsChange,
}: MixedPaymentSliderProps) {
  // Max points: limited by user balance and total needed
  // Also ensure remaining money >= R$1.00 for Stripe
  const maxPointsByBalance = Math.min(totalPoints, userBalance);
  const maxPointsByMinMoney = Math.floor(
    (totalMoney - MIN_STRIPE_AMOUNT) / (pointsRate * 100),
  );
  const maxPoints = Math.max(0, Math.min(maxPointsByBalance, maxPointsByMinMoney));

  const [pointsToUse, setPointsToUse] = useState(Math.floor(maxPoints / 2));

  const moneyRemaining = totalMoney - pointsToUse * pointsRate * 100; // in centavos
  const pointsPercent = maxPoints > 0 ? pointsToUse / maxPoints : 0;

  const handleChange = (value: number) => {
    const rounded = Math.round(value);
    setPointsToUse(rounded);
    onPointsChange(rounded);
  };

  if (maxPoints <= 0) {
    return (
      <YStack gap="$2">
        <Text size="sm" color="secondary">
          Pagamento misto não disponível para este valor.
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      <Text weight="semibold" size="sm">
        Dividir pagamento
      </Text>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={maxPoints}
        step={1}
        value={pointsToUse}
        onValueChange={handleChange}
        minimumTrackTintColor="#7C3AED"
        maximumTrackTintColor="#E5E7EB"
        thumbTintColor="#7C3AED"
      />

      {/* Visual split bar */}
      <XStack height={8} borderRadius={4} overflow="hidden">
        <View
          style={{ flex: pointsPercent }}
          backgroundColor="#7C3AED"
        />
        <View
          style={{ flex: 1 - pointsPercent }}
          backgroundColor="#3B82F6"
        />
      </XStack>

      {/* Labels */}
      <XStack justifyContent="space-between">
        <YStack alignItems="flex-start">
          <Text size="xs" color="secondary">
            Pontos
          </Text>
          <Text size="sm" weight="semibold" style={{ color: '#7C3AED' }}>
            {formatPoints(pointsToUse)} pts
          </Text>
        </YStack>

        <YStack alignItems="flex-end">
          <Text size="xs" color="secondary">
            Cartão
          </Text>
          <Text size="sm" weight="semibold" style={{ color: '#3B82F6' }}>
            {formatCurrency(moneyRemaining)}
          </Text>
        </YStack>
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  slider: {
    width: '100%',
    height: 40,
  },
});
