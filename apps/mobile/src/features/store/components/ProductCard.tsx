import { Pressable, StyleSheet, Image } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { router } from 'expo-router';
import { Card, Text } from '@ahub/ui';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import { ProductTypeBadge } from './ProductTypeBadge';
import { FavoriteButton } from './FavoriteButton';
import type { StoreProductListItem } from '@ahub/shared/types';

interface ProductCardProps {
  product: StoreProductListItem;
  width?: string | number;
}

export function ProductCard({ product, width = '47%' }: ProductCardProps) {
  const handlePress = () => {
    router.push(`/store/product/${product.slug}` as any);
  };

  const hasPromotion = product.isPromotional;
  const displayPricePoints = hasPromotion
    ? product.promotionalPricePoints
    : product.pricePoints;
  const displayPriceMoney = hasPromotion
    ? product.promotionalPriceMoney
    : product.priceMoney;

  return (
    <Pressable onPress={handlePress} style={{ width: width as any }}>
      <Card variant="elevated" style={styles.card}>
        <YStack gap="$2">
          {/* Product Image */}
          <View style={styles.imageContainer}>
            {product.thumbnailUrl ? (
              <Image
                source={{ uri: product.thumbnailUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text size="2xl">🛍️</Text>
              </View>
            )}

            {/* Badges overlay */}
            <View style={styles.badgeContainer}>
              <ProductTypeBadge type={product.type} />
            </View>

            {/* Favorite button */}
            <View style={styles.favoriteContainer}>
              <FavoriteButton
                productId={product.id}
                isFavorited={product.isFavorited ?? false}
              />
            </View>

            {/* Promotion ribbon */}
            {hasPromotion && (
              <View style={styles.promoRibbon}>
                <Text size="xs" style={{ color: '#fff', fontWeight: '700' }}>
                  PROMO
                </Text>
              </View>
            )}
          </View>

          {/* Product Info */}
          <YStack gap="$1" paddingHorizontal="$1">
            <Text weight="semibold" size="sm" numberOfLines={2}>
              {product.name}
            </Text>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <XStack gap="$1" alignItems="center">
                <Text size="xs">⭐</Text>
                <Text size="xs" color="secondary">
                  {product.averageRating?.toFixed(1)} ({product.reviewCount})
                </Text>
              </XStack>
            )}

            {/* Price */}
            <YStack gap={2}>
              {displayPricePoints != null && (
                <XStack gap="$1" alignItems="center">
                  {hasPromotion && product.pricePoints != null && (
                    <Text
                      size="xs"
                      color="secondary"
                      style={styles.strikethrough}
                    >
                      {formatPoints(product.pricePoints)}
                    </Text>
                  )}
                  <Text color="accent" weight="bold" size="sm">
                    {formatPoints(displayPricePoints)} pts
                  </Text>
                </XStack>
              )}
              {displayPriceMoney != null && (
                <Text size="xs" color="secondary">
                  {hasPromotion && product.priceMoney != null
                    ? `${formatCurrency(product.priceMoney)} → `
                    : ''}
                  {formatCurrency(displayPriceMoney)}
                </Text>
              )}
            </YStack>
          </YStack>

          {/* Availability */}
          {!product.isAvailable && (
            <View style={styles.unavailable}>
              <Text size="xs" color="error">
                Indisponível
              </Text>
            </View>
          )}
        </YStack>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  favoriteContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  promoRibbon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EF4444',
    paddingVertical: 2,
    alignItems: 'center',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  unavailable: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
});
