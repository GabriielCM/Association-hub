import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import type { PointTransaction } from '@ahub/shared/types';
import { GlassPanel } from './GlassPanel';
import { GlassTransactionItem } from './GlassTransactionItem';
import { useWalletTheme } from '../hooks/useWalletTheme';

interface RecentTransactionsSectionProps {
  transactions: PointTransaction[];
  onViewAll: () => void;
  onTransactionPress?: (transaction: PointTransaction) => void;
}

const MAX_ITEMS = 5;
const STAGGER_DELAY = 60;

export function RecentTransactionsSection({
  transactions,
  onViewAll,
  onTransactionPress,
}: RecentTransactionsSectionProps) {
  const items = transactions.slice(0, MAX_ITEMS);
  const t = useWalletTheme();

  if (items.length === 0) return null;

  return (
    <GlassPanel
      borderRadius={20}
      blurTint={t.glassBlurTint}
      intensity={t.glassBlurIntensity}
      borderColor={t.glassBorder}
    >
      <XStack justifyContent="space-between" alignItems="center" marginBottom={8}>
        <Text style={[styles.title, { color: t.textPrimary }]}>Transacoes Recentes</Text>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text style={[styles.viewAll, { color: t.accent }]}>Ver tudo</Text>
        </Pressable>
      </XStack>

      <YStack>
        {items.map((tx, index) => (
          <StaggeredItem key={tx.id ?? index} index={index}>
            <GlassTransactionItem
              transaction={tx}
              onPress={() => onTransactionPress?.(tx)}
            />
            {index < items.length - 1 && (
              <View style={[styles.separator, { backgroundColor: t.separatorColor }]} />
            )}
          </StaggeredItem>
        ))}
      </YStack>
    </GlassPanel>
  );
}

function StaggeredItem({ children, index }: { children: React.ReactNode; index: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(index * STAGGER_DELAY, withSpring(1, { damping: 20 }));
    translateY.value = withDelay(index * STAGGER_DELAY, withSpring(0, { damping: 15 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  separator: {
    height: 1,
  },
});
