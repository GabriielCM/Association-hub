import { YStack, XStack } from 'tamagui';
import { Text, Card, Icon } from '@ahub/ui';
import { Star } from '@ahub/ui/src/icons';
import { useStoreTheme } from '../hooks/useStoreTheme';
import type { ProductReview } from '@ahub/shared/types';

interface ReviewStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 12, md: 16, lg: 20 };

export function ReviewStars({ rating, size = 'md' }: ReviewStarsProps) {
  const st = useStoreTheme();
  const fontSize = sizeMap[size];

  return (
    <XStack gap={2}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon
          key={i}
          icon={Star}
          size={fontSize}
          color={i < Math.round(rating) ? st.starFilled : st.starEmpty}
          weight={i < Math.round(rating) ? 'fill' : 'regular'}
        />
      ))}
    </XStack>
  );
}

// Review list component
interface ReviewListProps {
  reviews: ProductReview[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  const st = useStoreTheme();

  if (reviews.length === 0) {
    return (
      <YStack alignItems="center" paddingVertical="$4">
        <Text size="sm" style={{ color: st.textSecondary }}>
          Nenhuma avaliação ainda
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      {reviews.map((review) => (
        <Card
          key={review.id}
          variant="flat"
          {...(st.cardBg ? {
            backgroundColor: st.cardBg,
            borderWidth: 1,
            borderColor: st.cardBorder,
            shadowOpacity: 0,
          } : {})}
        >
          <YStack gap="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <XStack gap="$2" alignItems="center">
                <Text weight="semibold" size="sm" style={{ color: st.textPrimary }}>
                  {review.user.name}
                </Text>
                <ReviewStars rating={review.rating} size="sm" />
              </XStack>
              <Text size="xs" style={{ color: st.textSecondary }}>
                {new Date(review.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </XStack>
            {review.comment && (
              <Text size="sm" style={{ color: st.textSecondary }}>
                {review.comment}
              </Text>
            )}
          </YStack>
        </Card>
      ))}
    </YStack>
  );
}
