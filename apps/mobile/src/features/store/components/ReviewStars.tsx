import { YStack, XStack } from 'tamagui';
import { Text, Card } from '@ahub/ui';
import type { ProductReview } from '@ahub/shared/types';

interface ReviewStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 12, md: 16, lg: 20 };

export function ReviewStars({ rating, size = 'md' }: ReviewStarsProps) {
  const fontSize = sizeMap[size];
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push('★');
    } else if (i - 0.5 <= rating) {
      stars.push('★');
    } else {
      stars.push('☆');
    }
  }

  return (
    <XStack gap={2}>
      {stars.map((star, index) => (
        <Text
          key={index}
          style={{
            fontSize,
            color: star === '★' ? '#F59E0B' : '#D1D5DB',
          }}
        >
          {star}
        </Text>
      ))}
    </XStack>
  );
}

// Review list component
interface ReviewListProps {
  reviews: ProductReview[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <YStack alignItems="center" paddingVertical="$4">
        <Text color="secondary" size="sm">
          Nenhuma avaliação ainda
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      {reviews.map((review) => (
        <Card key={review.id} variant="flat">
          <YStack gap="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <XStack gap="$2" alignItems="center">
                <Text weight="semibold" size="sm">
                  {review.user.name}
                </Text>
                <ReviewStars rating={review.rating} size="sm" />
              </XStack>
              <Text size="xs" color="secondary">
                {new Date(review.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </XStack>
            {review.comment && (
              <Text size="sm" color="secondary">
                {review.comment}
              </Text>
            )}
          </YStack>
        </Card>
      ))}
    </YStack>
  );
}
