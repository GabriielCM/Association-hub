import { useState, useCallback } from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, Heading, Card, Spinner } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import { useCachedBalance } from '@/stores/wallet.store';
import { useCategories } from '@/features/store/hooks/useCategories';
import {
  useFeaturedProducts,
  usePromotionalProducts,
} from '@/features/store/hooks/useProducts';
import { CategoryCarousel } from '@/features/store/components/CategoryCarousel';
import { ProductCard } from '@/features/store/components/ProductCard';
import type { StoreProductListItem } from '@ahub/shared/types';

export default function LojaScreen() {
  const balance = useCachedBalance();
  const { data: categories, refetch: refetchCategories } = useCategories();
  const {
    data: featured,
    isLoading: loadingFeatured,
    refetch: refetchFeatured,
  } = useFeaturedProducts();
  const {
    data: promotional,
    refetch: refetchPromo,
  } = usePromotionalProducts();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCategories(), refetchFeatured(), refetchPromo()]);
    setRefreshing(false);
  }, [refetchCategories, refetchFeatured, refetchPromo]);

  const handleCategorySelect = (slug: string) => {
    router.push(`/store/category/${slug}` as any);
  };

  // Build sections for the FlatList
  const sections: Array<{ type: string; data?: StoreProductListItem[] }> = [];
  sections.push({ type: 'header' });
  sections.push({ type: 'categories' });

  if (promotional && promotional.length > 0) {
    sections.push({ type: 'promo-title' });
    sections.push({ type: 'promo-grid', data: promotional });
  }

  sections.push({ type: 'featured-title' });
  if (loadingFeatured) {
    sections.push({ type: 'loading' });
  } else if (featured && featured.length > 0) {
    sections.push({ type: 'featured-grid', data: featured });
  } else {
    sections.push({ type: 'empty' });
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <FlatList
        data={sections}
        keyExtractor={(_, index) => `section-${index}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item: section }) => {
          switch (section.type) {
            case 'header':
              return (
                <XStack
                  paddingHorizontal="$4"
                  paddingTop="$4"
                  paddingBottom="$2"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Heading level={3}>Loja</Heading>
                  <Card variant="flat" size="sm">
                    <XStack gap="$1" alignItems="center">
                      <Text color="secondary" size="sm">
                        Saldo:
                      </Text>
                      <Text weight="bold" color="accent">
                        {formatPoints(balance ?? 0)} pts
                      </Text>
                    </XStack>
                  </Card>
                </XStack>
              );

            case 'categories':
              return (
                <YStack paddingVertical="$2">
                  {categories && categories.length > 0 ? (
                    <CategoryCarousel
                      categories={categories}
                      onSelect={handleCategorySelect}
                    />
                  ) : null}
                </YStack>
              );

            case 'promo-title':
              return (
                <YStack paddingHorizontal="$4" paddingTop="$3">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Heading level={5}>Promoções</Heading>
                    <Text size="sm" color="accent">
                      🔥
                    </Text>
                  </XStack>
                </YStack>
              );

            case 'promo-grid':
              return (
                <XStack
                  flexWrap="wrap"
                  gap="$3"
                  paddingHorizontal="$4"
                  paddingTop="$2"
                >
                  {section.data?.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </XStack>
              );

            case 'featured-title':
              return (
                <YStack paddingHorizontal="$4" paddingTop="$3">
                  <Heading level={5}>Destaques</Heading>
                </YStack>
              );

            case 'featured-grid':
              return (
                <XStack
                  flexWrap="wrap"
                  gap="$3"
                  paddingHorizontal="$4"
                  paddingTop="$2"
                  paddingBottom="$4"
                >
                  {section.data?.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </XStack>
              );

            case 'loading':
              return (
                <YStack
                  paddingVertical="$6"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Spinner />
                </YStack>
              );

            case 'empty':
              return (
                <Card variant="flat" style={styles.emptyCard}>
                  <YStack
                    gap="$3"
                    alignItems="center"
                    justifyContent="center"
                    paddingVertical="$6"
                  >
                    <Text size="2xl">🛍️</Text>
                    <Text weight="semibold">Nenhum produto em destaque</Text>
                    <Text color="secondary" size="sm" align="center">
                      Explore as categorias para encontrar produtos
                    </Text>
                  </YStack>
                </Card>
              );

            default:
              return null;
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 8,
  },
});
