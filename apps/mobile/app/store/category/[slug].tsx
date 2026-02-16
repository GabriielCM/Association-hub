import { useState, useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Spinner, ScreenHeader } from '@ahub/ui';
import { useProducts } from '@/features/store/hooks/useProducts';
import { useCategoryBySlug } from '@/features/store/hooks/useCategories';
import { ProductCard } from '@/features/store/components/ProductCard';
import type { StoreProductsFilter } from '@ahub/shared/types';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: category } = useCategoryBySlug(slug);

  const filters: StoreProductsFilter | undefined = category?.id
    ? { categoryId: category.id, page, limit: 20 }
    : undefined;

  const { data, isLoading, isFetching } = useProducts(filters);

  const handleLoadMore = useCallback(() => {
    if (data && page < data.meta.totalPages) {
      setPage((p) => p + 1);
    }
  }, [data, page]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <YStack flex={1}>
        {/* Header */}
        <ScreenHeader title={category?.name || 'Categoria'} onBack={() => router.back()} />

        {category?.description && (
          <YStack paddingHorizontal="$4" paddingBottom="$2">
            <Text size="sm" color="secondary">
              {category.description}
            </Text>
          </YStack>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Spinner />
          </YStack>
        ) : !data || data.data.length === 0 ? (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            gap="$3"
          >
            <Text size="2xl">🔍</Text>
            <Text color="secondary">Nenhum produto nesta categoria</Text>
          </YStack>
        ) : (
          <FlatList
            data={data.data}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => <ProductCard product={item} />}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetching && !isLoading ? (
                <YStack paddingVertical="$4" alignItems="center">
                  <Spinner />
                </YStack>
              ) : null
            }
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});
