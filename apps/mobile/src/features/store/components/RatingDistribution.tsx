import { StyleSheet } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Star } from '@ahub/ui/src/icons';
import { useStoreTheme } from '../hooks/useStoreTheme';
import type { ProductReview } from '@ahub/shared/types';

interface RatingDistributionProps {
  reviews: ProductReview[];
  averageRating?: number;
}

export function RatingDistribution({
  reviews,
  averageRating,
}: RatingDistributionProps) {
  const st = useStoreTheme();
  const total = reviews.length;
  if (total === 0) return null;

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  for (const review of reviews) {
    const stars = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5;
    if (stars >= 1 && stars <= 5) {
      distribution[stars]++;
    }
  }

  const maxCount = Math.max(distribution[5], distribution[4], distribution[3], distribution[2], distribution[1], 1);

  return (
    <XStack gap="$4" alignItems="center">
      {/* Average */}
      <YStack alignItems="center" gap="$1">
        <Text size="xl" weight="bold" style={{ color: st.textPrimary }}>
          {(averageRating ?? 0).toFixed(1)}
        </Text>
        <XStack gap={2}>
          {Array.from({ length: 5 }, (_, i) => (
            <Icon
              key={i}
              icon={Star}
              size={12}
              color={i < Math.round(averageRating ?? 0) ? st.starFilled : st.starEmpty}
              weight={i < Math.round(averageRating ?? 0) ? 'fill' : 'regular'}
            />
          ))}
        </XStack>
        <Text size="xs" style={{ color: st.textSecondary }}>
          {total} {total === 1 ? 'avaliação' : 'avaliações'}
        </Text>
      </YStack>

      {/* Bars */}
      <YStack flex={1} gap={4}>
        {([5, 4, 3, 2, 1] as const).map((stars) => {
          const count = distribution[stars];
          const width = total > 0 ? (count / maxCount) * 100 : 0;

          return (
            <XStack key={stars} gap="$2" alignItems="center">
              <Text size="xs" style={[styles.starLabel, { color: st.textSecondary }]}>
                {stars}
              </Text>
              <Icon icon={Star} size={10} color={st.starFilled} weight="fill" />
              <View style={[styles.barContainer, { backgroundColor: st.barBg }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${width}%` as any, backgroundColor: st.barFill },
                  ]}
                />
              </View>
              <Text size="xs" style={[styles.countLabel, { color: st.textSecondary }]}>
                {count}
              </Text>
            </XStack>
          );
        })}
      </YStack>
    </XStack>
  );
}

const styles = StyleSheet.create({
  starLabel: {
    width: 10,
    textAlign: 'right',
  },
  barContainer: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  countLabel: {
    width: 20,
    textAlign: 'right',
  },
});
