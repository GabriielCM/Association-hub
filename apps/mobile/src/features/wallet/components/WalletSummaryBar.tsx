import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text, Spinner } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import { useWalletSummary } from '../hooks/useWallet';
import type { WalletSummaryPeriod } from '@ahub/shared/types';

const PERIODS: { label: string; value: WalletSummaryPeriod }[] = [
  { label: 'Hoje', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mês', value: 'month' },
  { label: 'Ano', value: 'year' },
];

export function WalletSummaryBar() {
  const [period, setPeriod] = useState<WalletSummaryPeriod>('month');
  const { data: summary, isLoading } = useWalletSummary(period);

  return (
    <YStack gap="$3">
      {/* Period Tabs */}
      <XStack gap="$2" justifyContent="center">
        {PERIODS.map((p) => (
          <Pressable
            key={p.value}
            onPress={() => setPeriod(p.value)}
            style={[
              styles.periodTab,
              period === p.value && styles.periodTabActive,
            ]}
          >
            <Text
              size="xs"
              weight={period === p.value ? 'semibold' : 'regular'}
              color={period === p.value ? 'primary' : 'secondary'}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </XStack>

      {/* Summary */}
      {isLoading ? (
        <XStack justifyContent="center" paddingVertical="$2">
          <Spinner />
        </XStack>
      ) : summary ? (
        <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$2">
          <YStack alignItems="center" flex={1}>
            <Text color="success" weight="semibold">
              +{formatPoints(summary.earned)}
            </Text>
            <Text color="secondary" size="xs">Ganhos</Text>
          </YStack>
          <YStack alignItems="center" flex={1}>
            <Text color="error" weight="semibold">
              -{formatPoints(summary.spent)}
            </Text>
            <Text color="secondary" size="xs">Gastos</Text>
          </YStack>
          <YStack alignItems="center" flex={1}>
            <Text weight="semibold">
              {summary.net >= 0 ? '+' : ''}{formatPoints(summary.net)}
            </Text>
            <Text color="secondary" size="xs">Líquido</Text>
          </YStack>
        </XStack>
      ) : null}
    </YStack>
  );
}

const styles = StyleSheet.create({
  periodTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  periodTabActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
});
