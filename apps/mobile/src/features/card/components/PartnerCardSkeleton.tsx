import { View, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Skeleton } from '@ahub/ui';
import { useCardTheme } from '../hooks/useCardTheme';

export function PartnerCardSkeleton() {
  const ct = useCardTheme();

  return (
    <View style={[styles.container, { backgroundColor: ct.surfaceBg, ...ct.cardShadow }]}>
      {/* Banner skeleton */}
      <Skeleton width="100%" height={0} style={styles.banner} />

      {/* Info skeleton */}
      <YStack padding={14} gap={8}>
        <Skeleton variant="text" width="60%" height={18} />
        <Skeleton variant="text" width="90%" height={14} />
        <XStack gap={8}>
          <Skeleton variant="text" width={60} height={12} />
          <Skeleton variant="text" width={40} height={12} />
        </XStack>
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  banner: {
    aspectRatio: 16 / 9,
  },
});
