import { Pressable, StyleSheet, Image } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { router } from 'expo-router';
import { Card, Text, Icon } from '@ahub/ui';
import { Storefront, Star, Crown } from '@ahub/ui/src/icons';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import { ProductTypeBadge } from './ProductTypeBadge';
import { FavoriteButton } from './FavoriteButton';
import { useStoreTheme } from '../hooks/useStoreTheme';
import type { StoreProductListItem } from '@ahub/shared/types';

interface ProductCardProps {
  product: StoreProductListItem;
  width?: string | number;
}

export function ProductCard({ product, width = '47%' }: ProductCardProps) {
  const st = useStoreTheme();

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

  const discountPercent =
    hasPromotion && product.pricePoints != null && product.promotionalPricePoints != null
      ? Math.round(
          ((product.pricePoints - product.promotionalPricePoints) / product.pricePoints) * 100,
        )
      : hasPromotion && product.priceMoney != null && product.promotionalPriceMoney != null
        ? Math.round(
            ((product.priceMoney - product.promotionalPriceMoney) / product.priceMoney) * 100,
          )
        : 0;

  const promoEndLabel =
    hasPromotion && product.promotionalEndsAt
      ? `até ${new Date(product.promotionalEndsAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
      : '';

  const hasExclusivePlans =
    product.eligiblePlans != null && product.eligiblePlans.length > 0;

  return (
    <Pressable onPress={handlePress} style={{ width: width as any }}>
      <Card
        variant="elevated"
        style={styles.card}
        {...(st.cardBg ? {
          backgroundColor: st.cardBg,
          borderWidth: 1,
          borderColor: st.cardBorder,
          shadowOpacity: 0,
        } : {})}
      >
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
              <View style={[styles.imagePlaceholder, { backgroundColor: st.placeholderBg }]}>
                <Icon icon={Storefront} size="xl" color="muted" />
              </View>
            )}

            {/* Sold out overlay */}
            {!product.isAvailable && (
              <View style={[styles.soldOutOverlay, { backgroundColor: st.soldOutOverlay }]}>
                <Text weight="bold" size="sm" style={{ color: '#fff' }}>
                  ESGOTADO
                </Text>
              </View>
            )}

            {/* Badges overlay */}
            <View style={styles.badgeContainer}>
              <ProductTypeBadge type={product.type} />
            </View>

            {/* Exclusive plan badge */}
            {hasExclusivePlans && (
              <View style={styles.exclusiveBadge}>
                <XStack gap={3} alignItems="center" style={[styles.exclusivePill, { backgroundColor: st.exclusiveBg }]}>
                  <Icon icon={Crown} size={10} weight="fill" color="#fff" />
                  <Text size="xs" style={styles.exclusiveText}>
                    EXCLUSIVO
                  </Text>
                </XStack>
              </View>
            )}

            {/* Favorite button */}
            <View style={styles.favoriteContainer}>
              <FavoriteButton
                productId={product.id}
                isFavorited={product.isFavorited ?? false}
              />
            </View>

            {/* Promotion ribbon */}
            {hasPromotion && (
              <View style={[styles.promoRibbon, { backgroundColor: st.promoBg }]}>
                <Text size="xs" style={{ color: '#fff', fontWeight: '700' }}>
                  {discountPercent > 0 ? `-${discountPercent}%` : 'PROMO'}
                  {promoEndLabel ? ` ${promoEndLabel}` : ''}
                </Text>
              </View>
            )}
          </View>

          {/* Product Info */}
          <YStack gap="$1" paddingHorizontal="$1">
            <Text weight="semibold" size="sm" numberOfLines={2} style={{ color: st.textPrimary }}>
              {product.name}
            </Text>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <XStack gap="$1" alignItems="center">
                <Icon icon={Star} size="sm" weight="fill" color={st.starFilled} />
                <Text size="xs" style={{ color: st.textSecondary }}>
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
                      style={[styles.strikethrough, { color: st.textSecondary }]}
                    >
                      {formatPoints(product.pricePoints)}
                    </Text>
                  )}
                  <Text weight="bold" size="sm" style={{ color: st.accent }}>
                    {formatPoints(displayPricePoints)} pts
                  </Text>
                </XStack>
              )}
              {displayPriceMoney != null && (
                <Text size="xs" style={{ color: st.textSecondary }}>
                  {hasPromotion && product.priceMoney != null
                    ? `${formatCurrency(product.priceMoney)} → `
                    : ''}
                  {formatCurrency(displayPriceMoney)}
                </Text>
              )}
            </YStack>
          </YStack>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  exclusiveBadge: {
    position: 'absolute',
    bottom: 28,
    left: 6,
  },
  exclusivePill: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  exclusiveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 9,
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
    paddingVertical: 2,
    alignItems: 'center',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
});
