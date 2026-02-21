import { useState } from 'react';
import { ScrollView, StyleSheet, Pressable, Share } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Heading, Card, Badge, Spinner, Button, Icon } from '@ahub/ui';
import { Lock, ShareNetwork } from '@ahub/ui/src/icons';
import { MISC_ICONS } from '@ahub/ui/src/icons';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import { useProduct } from '@/features/store/hooks/useProduct';
import { useProductReviews } from '@/features/store/hooks/useReviews';
import { useStoreTheme } from '@/features/store/hooks/useStoreTheme';
import { ProductGallery } from '@/features/store/components/ProductGallery';
import { VariantPicker } from '@/features/store/components/VariantPicker';
import { ReviewStars, ReviewList } from '@/features/store/components/ReviewStars';
import { RatingDistribution } from '@/features/store/components/RatingDistribution';
import { ReviewForm } from '@/features/store/components/ReviewForm';
import { FavoriteButton } from '@/features/store/components/FavoriteButton';
import { ProductTypeBadge } from '@/features/store/components/ProductTypeBadge';
import type { ProductVariant } from '@ahub/shared/types';

export default function ProductDetailScreen() {
  const st = useStoreTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);
  const { data: reviews } = useProductReviews(product?.id || '');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: st.screenBg }} edges={['top', 'bottom']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: st.screenBg }} edges={['top', 'bottom']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
          <Icon icon={MISC_ICONS.warning} size="xl" color="muted" weight="duotone" />
          <Text style={{ color: st.textSecondary }}>Produto não encontrado</Text>
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

  const needsVariant = product.variants.length > 0 && !selectedVariant;

  const handleAddToCart = () => {
    router.push({
      pathname: '/store/cart' as any,
      params: {
        addProductId: product.id,
        addVariantId: selectedVariant?.id,
      },
    });
  };

  const handleBuyNow = () => {
    router.push({
      pathname: '/store/cart' as any,
      params: {
        addProductId: product.id,
        addVariantId: selectedVariant?.id,
        buyNow: 'true',
      },
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Confira ${product.name} na loja A-hub!`,
        title: product.name,
      });
    } catch {
      // User cancelled or error
    }
  };

  const descriptionIsLong =
    product.longDescription != null && product.longDescription.length > 200;

  const buttonLabel = isOutOfStock
    ? 'Esgotado'
    : reachedLimit
      ? 'Limite atingido'
      : product.userIsEligible === false
        ? 'Indisponível para seu plano'
        : needsVariant
          ? 'Selecione uma variante'
          : 'Adicionar ao carrinho';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: st.screenBg }} edges={['top', 'bottom']}>
      {/* Back button overlay */}
      <View style={styles.backButton}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <View style={[styles.backCircle, { backgroundColor: st.floatingBtnBg }]}>
            <Text size="lg" style={{ color: st.textPrimary }}>←</Text>
          </View>
        </Pressable>
      </View>

      {/* Share button overlay */}
      <View style={styles.shareButton}>
        <Pressable onPress={handleShare} hitSlop={8}>
          <View style={[styles.backCircle, { backgroundColor: st.floatingBtnBg }]}>
            <Icon icon={ShareNetwork} size={18} color={st.textPrimary} />
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
            <Heading level={3} style={{ color: st.textPrimary }}>{product.name}</Heading>
            {product.reviewCount > 0 && (
              <XStack gap="$2" alignItems="center">
                <ReviewStars rating={product.averageRating || 0} />
                <Text size="sm" style={{ color: st.textSecondary }}>
                  {product.averageRating?.toFixed(1)} ({product.reviewCount}{' '}
                  {product.reviewCount === 1 ? 'avaliação' : 'avaliações'})
                </Text>
              </XStack>
            )}
          </YStack>

          {/* Price */}
          <Card
            variant="flat"
            {...(st.cardBg ? {
              backgroundColor: st.cardBg,
              borderWidth: 1,
              borderColor: st.cardBorder,
              shadowOpacity: 0,
            } : {})}
          >
            <YStack gap="$1">
              {displayPricePoints != null && (
                <XStack gap="$2" alignItems="center">
                  {hasPromotion && product.pricePoints != null && (
                    <Text
                      size="sm"
                      style={[styles.strikethrough, { color: st.textSecondary }]}
                    >
                      {formatPoints(product.pricePoints)} pts
                    </Text>
                  )}
                  <Text weight="bold" size="xl" style={{ color: st.accent }}>
                    {formatPoints(displayPricePoints)} pts
                  </Text>
                </XStack>
              )}
              {displayPriceMoney != null && (
                <XStack gap="$2" alignItems="center">
                  {hasPromotion && product.priceMoney != null && (
                    <Text
                      size="sm"
                      style={[styles.strikethrough, { color: st.textSecondary }]}
                    >
                      {formatCurrency(product.priceMoney)}
                    </Text>
                  )}
                  <Text size="base" style={{ color: st.textSecondary }}>
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
            <Text size="sm" style={{ color: st.textSecondary }}>
              {product.shortDescription}
            </Text>
          )}
          {product.longDescription && (
            <YStack gap="$1">
              <Text weight="semibold" size="sm" style={{ color: st.textPrimary }}>
                Descrição
              </Text>
              <Text size="sm" numberOfLines={showFullDescription ? undefined : 4} style={{ color: st.textPrimary }}>
                {product.longDescription}
              </Text>
              {descriptionIsLong && (
                <Pressable onPress={() => setShowFullDescription(!showFullDescription)}>
                  <Text size="sm" weight="semibold" style={{ color: st.accent }}>
                    {showFullDescription ? 'Ver menos' : 'Ver mais'}
                  </Text>
                </Pressable>
              )}
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
              <Text weight="semibold" size="sm" style={{ color: st.textPrimary }}>
                Especificações
              </Text>
              {product.specifications.map((spec) => (
                <XStack key={spec.key} justifyContent="space-between">
                  <Text size="sm" style={{ color: st.textSecondary }}>
                    {spec.key}
                  </Text>
                  <Text size="sm" style={{ color: st.textPrimary }}>{spec.value}</Text>
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
              <Text size="xs" style={{ color: st.textSecondary }}>
                Limite: {product.limitPerUser} por pessoa
                {product.userPurchaseCount != null &&
                  ` (você já comprou ${product.userPurchaseCount})`}
              </Text>
            )}
            {product.pickupLocation && (
              <Text size="xs" style={{ color: st.textSecondary }}>
                Retirada: {product.pickupLocation}
              </Text>
            )}
          </YStack>

          {/* Eligibility warning */}
          {product.userIsEligible === false && (
            <Card
              variant="flat"
              {...(st.cardBg ? {
                backgroundColor: st.cardBg,
                borderWidth: 1,
                borderColor: st.cardBorder,
                shadowOpacity: 0,
              } : {})}
            >
              <XStack gap="$2" alignItems="center">
                <Icon icon={Lock} size="md" color="warning" />
                <YStack flex={1}>
                  <Text size="sm" weight="semibold" style={{ color: st.textPrimary }}>
                    Produto exclusivo
                  </Text>
                  <Text size="xs" style={{ color: st.textSecondary }}>
                    Disponível apenas para planos:{' '}
                    {product.eligiblePlans.join(', ')}
                  </Text>
                </YStack>
              </XStack>
            </Card>
          )}

          {/* Reviews section */}
          {(reviews && reviews.length > 0) && (
            <YStack gap="$3">
              <Text weight="semibold" size="sm" style={{ color: st.textPrimary }}>
                Avaliações ({reviews.length})
              </Text>

              <RatingDistribution
                reviews={reviews}
                {...(product.averageRating != null ? { averageRating: product.averageRating } : {})}
              />

              <ReviewList reviews={reviews} />
            </YStack>
          )}

          {/* Review form */}
          {!showReviewForm ? (
            <Button
              variant="outline"
              size="sm"
              onPress={() => setShowReviewForm(true)}
            >
              Avaliar produto
            </Button>
          ) : (
            <ReviewForm
              productId={product.id}
              onSuccess={() => setShowReviewForm(false)}
            />
          )}
        </YStack>
      </ScrollView>

      {/* Bottom CTA - Two buttons */}
      <View style={[styles.bottomBar, {
        backgroundColor: st.bottomBarBg,
        borderTopColor: st.bottomBarBorder,
      }]}>
        <XStack gap="$3">
          <Button
            onPress={handleAddToCart}
            disabled={!canBuy || needsVariant}
            style={{ flex: 1 }}
          >
            {buttonLabel}
          </Button>
          {canBuy && !needsVariant && (
            <Button
              onPress={handleBuyNow}
              variant="outline"
              style={{ flex: 1 }}
            >
              Comprar agora
            </Button>
          )}
        </XStack>
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
  shareButton: {
    position: 'absolute',
    top: 50,
    right: 56,
    zIndex: 10,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  },
});
