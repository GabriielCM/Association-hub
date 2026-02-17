import { useState } from 'react';
import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Heading, Card, Badge, Spinner, Button, Icon } from '@ahub/ui';
import { Lock } from '@ahub/ui/src/icons';
import { MISC_ICONS } from '@ahub/ui/src/icons';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import { useProduct } from '@/features/store/hooks/useProduct';
import { useProductReviews } from '@/features/store/hooks/useReviews';
import { ProductGallery } from '@/features/store/components/ProductGallery';
import { VariantPicker } from '@/features/store/components/VariantPicker';
import { ReviewStars, ReviewList } from '@/features/store/components/ReviewStars';
import { FavoriteButton } from '@/features/store/components/FavoriteButton';
import { ProductTypeBadge } from '@/features/store/components/ProductTypeBadge';
import type { ProductVariant } from '@ahub/shared/types';

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);
  const { data: reviews } = useProductReviews(product?.id || '');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
          <Icon icon={MISC_ICONS.warning} size="xl" color="muted" weight="duotone" />
          <Text color="secondary">Produto não encontrado</Text>
          <Button onPress={() => router.back()} size="sm">
            Voltar
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const hasPromotion = product.isPromotional;
  const displayPricePoints = hasPromotion
    ? product.promotionalPricePoints
    : product.pricePoints;
  const displayPriceMoney = hasPromotion
    ? product.promotionalPriceMoney
    : product.priceMoney;

  const isOutOfStock =
    product.stockType === 'limited' &&
    product.stockCount != null &&
    product.stockCount <= 0;

  const reachedLimit =
    product.limitPerUser != null &&
    product.userPurchaseCount != null &&
    product.userPurchaseCount >= product.limitPerUser;

  const canBuy =
    product.isAvailable !== false &&
    !isOutOfStock &&
    !reachedLimit &&
    product.userIsEligible !== false;

  const handleAddToCart = () => {
    router.push({
      pathname: '/store/cart' as any,
      params: {
        addProductId: product.id,
        addVariantId: selectedVariant?.id,
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {/* Back button overlay */}
      <View style={styles.backButton}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <View style={styles.backCircle}>
            <Text size="lg">←</Text>
          </View>
        </Pressable>
      </View>

      {/* Favorite button overlay */}
      <View style={styles.favButton}>
        <FavoriteButton
          productId={product.id}
          isFavorited={product.isFavorited ?? false}
        />
      </View>

      <ScrollView>
        {/* Image Gallery */}
        <ProductGallery images={product.images} />

        <YStack padding="$4" gap="$4">
          {/* Badges row */}
          <XStack gap="$2" alignItems="center">
            <ProductTypeBadge type={product.type} />
            {hasPromotion && <Badge variant="error">PROMO</Badge>}
            {product.isFeatured && <Badge variant="info">Destaque</Badge>}
          </XStack>

          {/* Name & Rating */}
          <YStack gap="$1">
            <Heading level={3}>{product.name}</Heading>
            {product.reviewCount > 0 && (
              <XStack gap="$2" alignItems="center">
                <ReviewStars rating={product.averageRating || 0} />
                <Text size="sm" color="secondary">
                  {product.averageRating?.toFixed(1)} ({product.reviewCount}{' '}
                  {product.reviewCount === 1 ? 'avaliação' : 'avaliações'})
                </Text>
              </XStack>
            )}
          </YStack>

          {/* Price */}
          <Card variant="flat">
            <YStack gap="$1">
              {displayPricePoints != null && (
                <XStack gap="$2" alignItems="center">
                  {hasPromotion && product.pricePoints != null && (
                    <Text
                      size="sm"
                      color="secondary"
                      style={styles.strikethrough}
                    >
                      {formatPoints(product.pricePoints)} pts
                    </Text>
                  )}
                  <Text color="accent" weight="bold" size="xl">
                    {formatPoints(displayPricePoints)} pts
                  </Text>
                </XStack>
              )}
              {displayPriceMoney != null && (
                <XStack gap="$2" alignItems="center">
                  {hasPromotion && product.priceMoney != null && (
                    <Text
                      size="sm"
                      color="secondary"
                      style={styles.strikethrough}
                    >
                      {formatCurrency(product.priceMoney)}
                    </Text>
                  )}
                  <Text size="base" color="secondary">
                    {formatCurrency(displayPriceMoney)}
                  </Text>
                </XStack>
              )}
              {product.cashbackPercent != null && product.cashbackPercent > 0 && (
                <Text size="sm" color="success">
                  {product.cashbackPercent}% cashback
                </Text>
              )}
            </YStack>
          </Card>

          {/* Description */}
          {product.shortDescription && (
            <Text size="sm" color="secondary">
              {product.shortDescription}
            </Text>
          )}
          {product.longDescription && (
            <YStack gap="$1">
              <Text weight="semibold" size="sm">
                Descrição
              </Text>
              <Text size="sm">{product.longDescription}</Text>
            </YStack>
          )}

          {/* Variant Picker */}
          {product.variants.length > 0 && (
            <VariantPicker
              variants={product.variants}
              selectedId={selectedVariant?.id ?? undefined}
              onSelect={setSelectedVariant}
            />
          )}

          {/* Specifications */}
          {product.specifications.length > 0 && (
            <YStack gap="$2">
              <Text weight="semibold" size="sm">
                Especificações
              </Text>
              {product.specifications.map((spec) => (
                <XStack key={spec.key} justifyContent="space-between">
                  <Text size="sm" color="secondary">
                    {spec.key}
                  </Text>
                  <Text size="sm">{spec.value}</Text>
                </XStack>
              ))}
            </YStack>
          )}

          {/* Stock / Limit info */}
          <YStack gap="$1">
            {product.stockType === 'limited' &&
              product.stockCount != null &&
              product.stockCount > 0 &&
              product.stockCount <= 10 && (
                <Text size="xs" color="warning">
                  Apenas {product.stockCount} em estoque
                </Text>
              )}
            {product.limitPerUser != null && (
              <Text size="xs" color="secondary">
                Limite: {product.limitPerUser} por pessoa
                {product.userPurchaseCount != null &&
                  ` (você já comprou ${product.userPurchaseCount})`}
              </Text>
            )}
            {product.pickupLocation && (
              <Text size="xs" color="secondary">
                Retirada: {product.pickupLocation}
              </Text>
            )}
          </YStack>

          {/* Eligibility warning */}
          {product.userIsEligible === false && (
            <Card variant="flat">
              <XStack gap="$2" alignItems="center">
                <Icon icon={Lock} size="md" color="warning" />
                <YStack flex={1}>
                  <Text size="sm" weight="semibold">
                    Produto exclusivo
                  </Text>
                  <Text size="xs" color="secondary">
                    Disponível apenas para planos:{' '}
                    {product.eligiblePlans.join(', ')}
                  </Text>
                </YStack>
              </XStack>
            </Card>
          )}

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <YStack gap="$2">
              <Text weight="semibold" size="sm">
                Avaliações ({reviews.length})
              </Text>
              <ReviewList reviews={reviews} />
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Button
          onPress={handleAddToCart}
          disabled={!canBuy}
          style={{ flex: 1 }}
        >
          {isOutOfStock
            ? 'Esgotado'
            : reachedLimit
              ? 'Limite atingido'
              : product.userIsEligible === false
                ? 'Indisponível para seu plano'
                : 'Adicionar ao carrinho'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
});
