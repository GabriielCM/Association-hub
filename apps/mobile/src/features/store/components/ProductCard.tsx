import { Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { YStack, XStack, View } from 'tamagui';
import { router } from 'expo-router';
import { Card, Text, Icon, Badge } from '@ahub/ui';
import { Storefront, Star, Crown } from '@ahub/ui/src/icons';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import { FavoriteButton } from './FavoriteButton';
import { useStoreTheme } from '../hooks/useStoreTheme';
import type { StoreProductListItem, ProductType } from '@ahub/shared/types';

const typeConfig: Record<ProductType, { label: string; dotVariant: 'primary' | 'warning' | 'info' }> = {
  PHYSICAL: { label: 'Produto', dotVariant: 'primary' },
  VOUCHER: { label: 'Voucher', dotVariant: 'warning' },
  SERVICE: { label: 'Serviço', dotVariant: 'info' },
};

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

  const typeInfo = typeConfig[product.type] || typeConfig.PHYSICAL;

  return (
    <Pressable onPress={handlePress} style={{ width: width as any }}>
      <Card
        variant="elevated"
        style={[
          styles.card,
          hasExclusivePlans && { borderLeftWidth: 2, borderLeftColor: st.exclusiveBg },
        ]}
        {...(st.cardBg ? {
          backgroundColor: st.cardBg,
          borderWidth: 1,
          borderColor: st.cardBorder,
          shadowOpacity: 0,
        } : {})}
      >
        <YStack gap="$2">
          {/* ===== IMAGE ZONE ===== */}
          <View style={styles.imageContainer}>
            {product.thumbnailUrl ? (
              <Image
                source={product.thumbnailUrl}
                style={styles.image}
                contentFit="cover"
                transition={200}
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

            {/* Discount badge - top left */}
            {hasPromotion && discountPercent > 0 && (
              <View style={styles.discountBadge}>
                <Badge variant="error" size="sm">-{discountPercent}%</Badge>
              </View>
            )}

            {/* Favorite button - top right */}
            <View style={styles.favoriteContainer}>
              <FavoriteButton
                productId={product.id}
                isFavorited={product.isFavorited ?? false}
              />
            </View>
          </View>

          {/* ===== INFO ZONE ===== */}
          <YStack gap="$1" paddingHorizontal="$1">
            {/* Product type - dot + label */}
            <XStack gap={4} alignItems="center">
              <Badge.Dot variant={typeInfo.dotVariant as any} size="sm" />
              <Text size="xs" style={{ color: st.textSecondary, fontSize: 10 }}>
                {typeInfo.label}
              </Text>
            </XStack>

            {/* Product name */}
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
                  <Text
                    weight="bold"
                    size="sm"
                    style={{ color: hasPromotion ? st.promoBg : st.accent }}
                  >
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

            {/* Promo end date */}
            {hasPromotion && promoEndLabel !== '' && (
              <Text style={{ fontSize: 9, color: st.promoBg, fontWeight: '600' }}>
                PROMO {promoEndLabel}
              </Text>
            )}

            {/* Exclusive plan indicator */}
            {hasExclusivePlans && (
              <XStack gap={3} alignItems="center">
                <Icon icon={Crown} size={10} weight="fill" color={st.exclusiveBg} />
                <Text style={{ fontSize: 9, color: st.exclusiveBg, fontWeight: '600' }}>
                  Exclusivo
                </Text>
              </XStack>
            )}
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
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  favoriteContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
});
