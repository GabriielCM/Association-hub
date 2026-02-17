import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { YStack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { Loading } from '@ahub/ui';
import { cardGradients } from '@ahub/ui/src/themes/tokens';

/**
 * Shimmer skeleton that mimics the card layout while data loads.
 * Uses the same gradient background for visual consistency.
 */
export function CardSkeleton() {
  const { width } = useWindowDimensions();
  const cardWidth = width - 48;

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <LinearGradient
        colors={[cardGradients.light.front.start, cardGradients.light.front.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <YStack alignItems="center" gap={8}>
          {/* Association logo skeleton */}
          <Loading.Skeleton variant="circular" width={48} height={48} />
          <Loading.Skeleton variant="text" width={120} height={14} />
        </YStack>

        <YStack alignItems="center" gap={8}>
          {/* Avatar skeleton */}
          <Loading.Skeleton variant="circular" width={80} height={80} />
          {/* Name */}
          <Loading.Skeleton variant="text" width={180} height={18} />
          {/* Card number */}
          <Loading.Skeleton variant="text" width={130} height={13} />
        </YStack>

        {/* QR code skeleton */}
        <Loading.Skeleton variant="rectangular" width={152} height={152} />

        {/* Flip hint */}
        <Loading.Skeleton variant="text" width={140} height={11} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    height: 480,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
