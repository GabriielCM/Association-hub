import { FlatList, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, Spinner, ScreenHeader, Icon } from '@ahub/ui';
import { Heart } from '@ahub/ui/src/icons';
import { useFavorites } from '@/features/store/hooks/useFavorites';
import { useStoreTheme } from '@/features/store/hooks/useStoreTheme';
import { ProductCard } from '@/features/store/components/ProductCard';
import type { FavoriteItem, StoreProductListItem } from '@ahub/shared/types';

function favoriteToProductCard(fav: FavoriteItem): StoreProductListItem {
  const item: StoreProductListItem = {
    id: fav.product.id,
    name: fav.product.name,
    slug: fav.product.slug,
    type: fav.product.type as StoreProductListItem['type'],
    paymentOptions: 'both' as StoreProductListItem['paymentOptions'],
    isFeatured: false,
    isPromotional: false,
    reviewCount: 0,
    isAvailable: fav.product.isAvailable,
    isFavorited: true,
  };
  if (fav.product.shortDescription) item.shortDescription = fav.product.shortDescription;
  if (fav.product.pricePoints != null) item.pricePoints = fav.product.pricePoints;
  if (fav.product.priceMoney != null) item.priceMoney = fav.product.priceMoney;
  if (fav.product.imageUrl) item.thumbnailUrl = fav.product.imageUrl;
  return item;
}

export default function FavoritesScreen() {
  const st = useStoreTheme();
  const { data: favorites, isLoading } = useFavorites();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: st.screenBg }} edges={['top', 'bottom']}>
        <ScreenHeader title="Meus Favoritos" onBack={() => router.back()} />
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      </SafeAreaView>
    );
  }

  const items = favorites ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: st.screenBg }} edges={['top', 'bottom']}>
      <ScreenHeader title="Meus Favoritos" onBack={() => router.back()} />

      {items.length === 0 ? (
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap="$3"
          padding="$4"
        >
          <Icon icon={Heart} size="xl" color="muted" weight="duotone" />
          <Text weight="semibold" style={{ color: st.textPrimary }}>Nenhum favorito</Text>
          <Text size="sm" align="center" style={{ color: st.textSecondary }}>
            Toque no coração dos produtos para salvá-los aqui
          </Text>
        </YStack>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <ProductCard
              product={favoriteToProductCard(item)}
              width="47%"
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12,
  },
  row: {
    gap: 12,
    justifyContent: 'space-between',
  },
});
