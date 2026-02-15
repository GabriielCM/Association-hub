import { Pressable, StyleSheet } from 'react-native';
import { XStack } from 'tamagui';
import { Text } from '@ahub/ui';

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
  const canDecrease = value > min && !disabled;
  const canIncrease = value < max && !disabled;

  return (
    <XStack alignItems="center" gap="$2">
      <Pressable
        onPress={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        style={[styles.button, !canDecrease && styles.buttonDisabled]}
        hitSlop={4}
      >
        <Text
          size="sm"
          weight="bold"
          style={!canDecrease ? styles.textDisabled : undefined}
        >
          −
        </Text>
      </Pressable>

      <Text size="sm" weight="semibold" style={styles.value}>
        {value}
      </Text>

      <Pressable
        onPress={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        style={[styles.button, !canIncrease && styles.buttonDisabled]}
        hitSlop={4}
      >
        <Text
          size="sm"
          weight="bold"
          style={!canIncrease ? styles.textDisabled : undefined}
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
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  textDisabled: {
    color: '#9CA3AF',
  },
  value: {
    minWidth: 24,
    textAlign: 'center',
  },
});
