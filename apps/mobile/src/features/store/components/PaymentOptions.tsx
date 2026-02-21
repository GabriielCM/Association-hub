import { Pressable, StyleSheet } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { PAYMENT_ICONS } from '@ahub/ui/src/icons';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import { useStoreTheme } from '../hooks/useStoreTheme';
import type { OrderPaymentMethod } from '@ahub/shared/types';

interface PaymentOptionsProps {
  availableMethods: string[];
  selectedMethod: OrderPaymentMethod | null;
  onSelect: (method: OrderPaymentMethod) => void;
  canPayWithPoints: boolean;
  userBalance: number;
  totalPoints: number;
  totalMoney: number;
  cashbackPercent?: number;
}

const METHOD_CONFIG: Record<
  string,
  { label: string; icon: PhosphorIcon; getDescription: (props: PaymentOptionsProps) => string }
> = {
  POINTS: {
    label: 'Pagar com Pontos',
    icon: PAYMENT_ICONS.POINTS,
    getDescription: (props) =>
      props.canPayWithPoints
        ? `Debitar ${formatPoints(props.totalPoints)} pontos do seu saldo`
        : `Saldo insuficiente (${formatPoints(props.userBalance)} pts)`,
  },
  MONEY: {
    label: 'Pagar com Cartão',
    icon: PAYMENT_ICONS.MONEY,
    getDescription: (props) => {
      const base = `Pagar ${formatCurrency(props.totalMoney)} no cartão`;
      if (props.cashbackPercent && props.cashbackPercent > 0) {
        const cashbackPts = Math.round(props.totalMoney * 100 * (props.cashbackPercent / 100));
        return `${base} — Ganhe ${formatPoints(cashbackPts)} pts de cashback (${props.cashbackPercent}%)`;
      }
      return base;
    },
  },
  MIXED: {
    label: 'Pagamento Misto',
    icon: PAYMENT_ICONS.MIXED,
    getDescription: () => 'Combinar pontos + cartão',
  },
};

export function PaymentOptions(props: PaymentOptionsProps) {
  const st = useStoreTheme();
  const { availableMethods, selectedMethod, onSelect, canPayWithPoints } = props;

  return (
    <YStack gap="$3">
      <Text weight="semibold" size="sm" style={{ color: st.textPrimary }}>
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
              {
                borderColor: st.optionBorder,
                backgroundColor: st.optionBg,
              },
              isSelected && {
                borderColor: st.optionSelectedBorder,
                backgroundColor: st.optionSelectedBg,
              },
              isDisabled && styles.optionDisabled,
            ]}
          >
            <XStack gap="$3" alignItems="center">
              <View style={[
                styles.radio,
                { borderColor: st.radioBorder },
                isSelected && { borderColor: st.radioSelectedBorder },
              ]}>
                {isSelected && (
                  <View style={[styles.radioDot, { backgroundColor: st.radioSelectedFill }]} />
                )}
              </View>

              <Icon icon={config.icon} size="lg" color={isSelected ? st.accent : st.iconColor} />

              <YStack flex={1}>
                <Text
                  weight={isSelected ? 'bold' : 'medium'}
                  size="sm"
                  style={{ color: isDisabled ? st.textTertiary : st.textPrimary }}
                >
                  {config.label}
                </Text>
                <Text
                  size="xs"
                  style={{ color: isDisabled ? '#EF4444' : st.textSecondary }}
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
  },
  optionDisabled: {
    opacity: 0.6,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
