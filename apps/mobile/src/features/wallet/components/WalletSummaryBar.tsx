import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import * as Haptics from 'expo-haptics';
import { useWalletSummary } from '../hooks/useWallet';
import type { WalletSummaryPeriod } from '@ahub/shared/types';
import { GlassPanel } from './GlassPanel';
import { AnimatedCounterText } from './AnimatedCounterText';
import { ShimmerGlassSkeleton } from './ShimmerGlassSkeleton';
import { useWalletTheme } from '../hooks/useWalletTheme';

const PERIODS: { label: string; value: WalletSummaryPeriod }[] = [
  { label: 'Hoje', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Ano', value: 'year' },
];

export function WalletSummaryBar() {
  const [period, setPeriod] = useState<WalletSummaryPeriod>('month');
  const { data: summary, isLoading } = useWalletSummary(period);
  const t = useWalletTheme();

  const handlePeriodChange = (value: WalletSummaryPeriod) => {
    Haptics.selectionAsync();
    setPeriod(value);
  };

  return (
    <YStack gap={12}>
      {/* Period Tabs */}
      <XStack gap={8} justifyContent="center">
        {PERIODS.map((p) => (
          <Pressable
            key={p.value}
            onPress={() => handlePeriodChange(p.value)}
            style={[
              styles.periodTab,
              period === p.value && {
                backgroundColor: t.accentBg,
                borderColor: t.accentBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.periodText,
                { color: t.textTertiary },
                period === p.value && { color: t.accent, fontWeight: '600' },
              ]}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </XStack>

      {/* Summary Cards */}
      {isLoading ? (
        <XStack gap={12}>
          <ShimmerGlassSkeleton width="31%" height={80} borderRadius={16} />
          <ShimmerGlassSkeleton width="31%" height={80} borderRadius={16} />
          <ShimmerGlassSkeleton width="31%" height={80} borderRadius={16} />
        </XStack>
      ) : summary ? (
        <XStack gap={10}>
          <View style={{ flex: 1 }}>
            <GlassPanel
              padding={12}
              borderRadius={16}
              borderColor={t.earnedBorder}
              blurTint={t.glassBlurTint}
              intensity={t.glassBlurIntensity}
            >
              <YStack alignItems="center" gap={4}>
                <Text style={[styles.cardLabel, { color: t.textSecondary }]}>Ganhos</Text>
                <AnimatedCounterText
                  value={summary.earned}
                  prefix="+"
                  style={{ color: t.earned, fontSize: 18, fontWeight: '700', textAlign: 'center' }}
                />
              </YStack>
            </GlassPanel>
          </View>
          <View style={{ flex: 1 }}>
            <GlassPanel
              padding={12}
              borderRadius={16}
              borderColor={t.spentBorder}
              blurTint={t.glassBlurTint}
              intensity={t.glassBlurIntensity}
            >
              <YStack alignItems="center" gap={4}>
                <Text style={[styles.cardLabel, { color: t.textSecondary }]}>Gastos</Text>
                <AnimatedCounterText
                  value={summary.spent}
                  prefix="-"
                  style={{ color: t.spent, fontSize: 18, fontWeight: '700', textAlign: 'center' }}
                />
              </YStack>
            </GlassPanel>
          </View>
          <View style={{ flex: 1 }}>
            <GlassPanel
              padding={12}
              borderRadius={16}
              borderColor={t.netBorder}
              blurTint={t.glassBlurTint}
              intensity={t.glassBlurIntensity}
            >
              <YStack alignItems="center" gap={4}>
                <Text style={[styles.cardLabel, { color: t.textSecondary }]}>Liquido</Text>
                <AnimatedCounterText
                  value={summary.net}
                  prefix={summary.net >= 0 ? '+' : ''}
                  style={{ color: t.net, fontSize: 18, fontWeight: '700', textAlign: 'center' }}
                />
              </YStack>
            </GlassPanel>
          </View>
        </XStack>
      ) : null}
    </YStack>
  );
}

const styles = StyleSheet.create({
  periodTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
