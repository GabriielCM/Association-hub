import { Pressable, StyleSheet } from 'react-native';
import { XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { useStoreTheme } from '../hooks/useStoreTheme';

interface QuantityControlProps {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantityControl({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: QuantityControlProps) {
  const st = useStoreTheme();
  const canDecrease = value > min && !disabled;
  const canIncrease = value < max && !disabled;

  return (
    <XStack alignItems="center" gap="$2">
      <Pressable
        onPress={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        style={[
          styles.button,
          { borderColor: st.chipBorder, backgroundColor: st.chipBg },
          !canDecrease && styles.buttonDisabled,
        ]}
        hitSlop={4}
      >
        <Text
          size="sm"
          weight="bold"
          style={{ color: !canDecrease ? st.textTertiary : st.textPrimary }}
        >
          −
        </Text>
      </Pressable>

      <Text size="sm" weight="semibold" style={[styles.value, { color: st.textPrimary }]}>
        {value}
      </Text>

      <Pressable
        onPress={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        style={[
          styles.button,
          { borderColor: st.chipBorder, backgroundColor: st.chipBg },
          !canIncrease && styles.buttonDisabled,
        ]}
        hitSlop={4}
      >
        <Text
          size="sm"
          weight="bold"
          style={{ color: !canIncrease ? st.textTertiary : st.textPrimary }}
        >
          +
        </Text>
      </Pressable>
    </XStack>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  value: {
    minWidth: 24,
    textAlign: 'center',
  },
});
