import { Pressable, StyleSheet } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import type { OrderPaymentMethod } from '@ahub/shared/types';

interface PaymentOptionsProps {
  availableMethods: string[];
  selectedMethod: OrderPaymentMethod | null;
  onSelect: (method: OrderPaymentMethod) => void;
  canPayWithPoints: boolean;
  userBalance: number;
  totalPoints: number;
  totalMoney: number;
}

const METHOD_CONFIG: Record<
  string,
  { label: string; icon: string; getDescription: (props: PaymentOptionsProps) => string }
> = {
  POINTS: {
    label: 'Pagar com Pontos',
    icon: '🪙',
    getDescription: (props) =>
      props.canPayWithPoints
        ? `Debitar ${formatPoints(props.totalPoints)} pontos do seu saldo`
        : `Saldo insuficiente (${formatPoints(props.userBalance)} pts)`,
  },
  MONEY: {
    label: 'Pagar com Cartão',
    icon: '💳',
    getDescription: (props) =>
      `Pagar ${formatCurrency(props.totalMoney)} no cartão`,
  },
  MIXED: {
    label: 'Pagamento Misto',
    icon: '🔀',
    getDescription: () => 'Combinar pontos + cartão',
  },
};

export function PaymentOptions(props: PaymentOptionsProps) {
  const { availableMethods, selectedMethod, onSelect, canPayWithPoints } = props;

  return (
    <YStack gap="$3">
      <Text weight="semibold" size="sm">
        Forma de pagamento
      </Text>

      {availableMethods.map((method) => {
        const config = METHOD_CONFIG[method];
        if (!config) return null;

        const isSelected = selectedMethod === method;
        const isDisabled = method === 'POINTS' && !canPayWithPoints;

        return (
          <Pressable
            key={method}
            onPress={() => !isDisabled && onSelect(method as OrderPaymentMethod)}
            disabled={isDisabled}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
              isDisabled && styles.optionDisabled,
            ]}
          >
            <XStack gap="$3" alignItems="center">
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>

              <Text size="lg">{config.icon}</Text>

              <YStack flex={1}>
                <Text
                  weight={isSelected ? 'bold' : 'medium'}
                  size="sm"
                  style={isDisabled ? styles.textDisabled : undefined}
                >
                  {config.label}
                </Text>
                <Text
                  size="xs"
                  color={isDisabled ? 'error' : 'secondary'}
                >
                  {config.getDescription(props)}
                </Text>
              </YStack>
            </XStack>
          </Pressable>
        );
      })}
    </YStack>
  );
}

const styles = StyleSheet.create({
  option: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  optionDisabled: {
    opacity: 0.6,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#7C3AED',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C3AED',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
});
