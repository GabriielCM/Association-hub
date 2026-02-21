import { useState, useCallback } from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, Heading, Card, Spinner, Icon, Badge } from '@ahub/ui';
import { Fire, Storefront, Heart, ShoppingCart } from '@ahub/ui/src/icons';
import { formatPoints } from '@ahub/shared/utils';
import { useCachedBalance } from '@/stores/wallet.store';
import { useWalletDashboard } from '@/features/wallet/hooks/useWallet';
import { useCategories } from '@/features/store/hooks/useCategories';
import {
  useFeaturedProducts,
  usePromotionalProducts,
  useProducts,
} from '@/features/store/hooks/useProducts';
import { useFavorites } from '@/features/store/hooks/useFavorites';
import { useCart } from '@/features/store/hooks/useCart';
import { useStoreTheme } from '@/features/store/hooks/useStoreTheme';
import { CategoryCarousel } from '@/features/store/components/CategoryCarousel';
import { ProductCard } from '@/features/store/components/ProductCard';
import { SortDropdown } from '@/features/store/components/SortDropdown';
import { SearchBar } from '@/features/store/components/SearchBar';
import type { SortOption } from '@/features/store/components/SortDropdown';
import type { StoreProductListItem } from '@ahub/shared/types';

export default function LojaScreen() {
  const st = useStoreTheme();
  const balance = useCachedBalance();
  const { refetch: refetchWallet } = useWalletDashboard();
  const { data: categories, refetch: refetchCategories } = useCategories();
  const {
    data: featured,
    refetch: refetchFeatured,
  } = useFeaturedProducts();
  const {
    data: promotional,
    refetch: refetchPromo,
  } = usePromotionalProducts();
  const { data: favorites } = useFavorites();
  const { data: cart } = useCart();

  const [sort, setSort] = useState<SortOption>('recent');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const productFilters = search
    ? { sort, search, page, limit: 20 }
    : { sort, page, limit: 20 };
  const {
    data: allProducts,
    isLoading: loadingAll,
    refetch: refetchAll,
  } = useProducts(productFilters);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchWallet(),
      refetchCategories(),
      refetchFeatured(),
      refetchPromo(),
      refetchAll(),
    ]);
    setRefreshing(false);
  }, [refetchWallet, refetchCategories, refetchFeatured, refetchPromo, refetchAll]);

  const handleCategorySelect = (slug: string) => {
    router.push(`/store/category/${slug}` as any);
  };

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (allProducts && page < allProducts.meta.totalPages) {
      setPage((p) => p + 1);
    }
  }, [allProducts, page]);

  const favoritesCount = favorites?.length ?? 0;
  const cartCount = cart?.itemCount ?? 0;

  // Build sections for the FlatList
  const sections: Array<{ type: string; data?: StoreProductListItem[] }> = [];
  sections.push({ type: 'header' });
  sections.push({ type: 'search' });
  sections.push({ type: 'categories' });

  if (!search && promotional && promotional.length > 0) {
    sections.push({ type: 'promo-title' });
    sections.push({ type: 'promo-grid', data: promotional });
  }

  if (!search && featured && featured.length > 0) {
    sections.push({ type: 'featured-title' });
    sections.push({ type: 'featured-grid', data: featured });
  }

  sections.push({ type: 'all-title' });
  if (loadingAll && !allProducts) {
    sections.push({ type: 'loading' });
  } else if (allProducts && allProducts.data.length > 0) {
    sections.push({ type: 'all-grid', data: allProducts.data });
  } else if (!loadingAll) {
    sections.push({ type: 'empty' });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: st.screenBg }} edges={['top']}>
      <FlatList
        data={sections}
        keyExtractor={(_, index) => `section-${index}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={st.refreshTint}
            colors={[st.refreshTint]}
            progressBackgroundColor={st.sheetBg}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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
                  <Heading level={3} style={{ color: st.textPrimary }}>Loja</Heading>
                  <XStack gap="$3" alignItems="center">
                    {/* Favorites badge */}
                    <XStack
                      onPress={() => router.push('/store/favorites' as any)}
                      style={styles.headerIcon}
                    >
                      <Icon icon={Heart} size={20} color={st.iconColor} />
                      {favoritesCount > 0 && (
                        <Badge variant="error" size="sm" style={styles.badge}>
                          {favoritesCount}
                        </Badge>
                      )}
                    </XStack>

                    {/* Cart badge */}
                    <XStack
                      onPress={() => router.push('/store/cart' as any)}
                      style={styles.headerIcon}
                    >
                      <Icon icon={ShoppingCart} size={20} color={st.iconColor} />
                      {cartCount > 0 && (
                        <Badge variant="error" size="sm" style={styles.badge}>
                          {cartCount}
                        </Badge>
                      )}
                    </XStack>

                    <Card
                      variant="flat"
                      size="sm"
                      {...(st.cardBg ? {
                        backgroundColor: st.cardBg,
                        borderWidth: 1,
                        borderColor: st.cardBorder,
                        shadowOpacity: 0,
                      } : {})}
                    >
                      <XStack gap="$1" alignItems="center">
                        <Text size="sm" style={{ color: st.textSecondary }}>
                          Saldo:
                        </Text>
                        <Text weight="bold" style={{ color: st.accent }}>
                          {balance != null ? `${formatPoints(balance)} pts` : '...'}
                        </Text>
                      </XStack>
                    </Card>
                  </XStack>
                </XStack>
              );

            case 'search':
              return (
                <YStack paddingHorizontal="$4" paddingBottom="$2">
                  <SearchBar onSearch={handleSearch} />
                </YStack>
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
                    <Heading level={5} style={{ color: st.textPrimary }}>Promoções</Heading>
                    <Icon icon={Fire} size="sm" color="error" />
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
                  <Heading level={5} style={{ color: st.textPrimary }}>Destaques</Heading>
                </YStack>
              );

            case 'featured-grid':
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

            case 'all-title':
              return (
                <YStack paddingHorizontal="$4" paddingTop="$4" gap="$2">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Heading level={5} style={{ color: st.textPrimary }}>
                      {search ? `Resultados para "${search}"` : 'Todos os Produtos'}
                    </Heading>
                    <SortDropdown value={sort} onChange={handleSortChange} />
                  </XStack>
                </YStack>
              );

            case 'all-grid':
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
                <Card
                  variant="flat"
                  style={styles.emptyCard}
                  {...(st.cardBg ? {
                    backgroundColor: st.cardBg,
                    borderWidth: 1,
                    borderColor: st.cardBorder,
                    shadowOpacity: 0,
                  } : {})}
                >
                  <YStack
                    gap="$3"
                    alignItems="center"
                    justifyContent="center"
                    paddingVertical="$6"
                  >
                    <Icon icon={Storefront} size="xl" color="muted" weight="duotone" />
                    <Text weight="semibold" style={{ color: st.textPrimary }}>
                      {search
                        ? 'Nenhum produto encontrado'
                        : 'Nenhum produto disponível'}
                    </Text>
                    <Text size="sm" align="center" style={{ color: st.textSecondary }}>
                      {search
                        ? 'Tente buscar por outro termo'
                        : 'Explore as categorias para encontrar produtos'}
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
  headerIcon: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
  },
});
