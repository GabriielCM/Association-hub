import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { YStack, XStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import { useStoreTheme } from '../hooks/useStoreTheme';

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
  const st = useStoreTheme();

  const maxPointsByBalance = Math.min(totalPoints, userBalance);
  const maxPointsByMinMoney = Math.floor(
    (totalMoney - MIN_STRIPE_AMOUNT) / (pointsRate * 100),
  );
  const maxPoints = Math.max(0, Math.min(maxPointsByBalance, maxPointsByMinMoney));

  const [pointsToUse, setPointsToUse] = useState(Math.floor(maxPoints / 2));

  const moneyRemaining = totalMoney - pointsToUse * pointsRate * 100;
  const pointsPercent = maxPoints > 0 ? pointsToUse / maxPoints : 0;

  const handleChange = (value: number) => {
    const rounded = Math.round(value);
    setPointsToUse(rounded);
    onPointsChange(rounded);
  };

  if (maxPoints <= 0) {
    return (
      <YStack gap="$2">
        <Text size="sm" style={{ color: st.textSecondary }}>
          Pagamento misto não disponível para este valor.
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      <Text weight="semibold" size="sm" style={{ color: st.textPrimary }}>
        Dividir pagamento
      </Text>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={maxPoints}
        step={1}
        value={pointsToUse}
        onValueChange={handleChange}
        minimumTrackTintColor={st.sliderMinTrack}
        maximumTrackTintColor={st.sliderMaxTrack}
        thumbTintColor={st.sliderThumb}
      />

      {/* Visual split bar */}
      <XStack height={8} borderRadius={4} overflow="hidden">
        <View
          style={{ flex: pointsPercent }}
          backgroundColor={st.pointsColor}
        />
        <View
          style={{ flex: 1 - pointsPercent }}
          backgroundColor={st.moneyColor}
        />
      </XStack>

      {/* Labels */}
      <XStack justifyContent="space-between">
        <YStack alignItems="flex-start">
          <Text size="xs" style={{ color: st.textSecondary }}>
            Pontos
          </Text>
          <Text size="sm" weight="semibold" style={{ color: st.pointsColor }}>
            {formatPoints(pointsToUse)} pts
          </Text>
        </YStack>

        <YStack alignItems="flex-end">
          <Text size="xs" style={{ color: st.textSecondary }}>
            Cartão
          </Text>
          <Text size="sm" weight="semibold" style={{ color: st.moneyColor }}>
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
