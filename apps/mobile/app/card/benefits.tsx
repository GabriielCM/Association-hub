import { useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spinner } from '@ahub/ui';
import { useBenefitsList, useCategories } from '@/features/card/hooks/useBenefits';
import { useUserLocation, calculateDistance, formatDistance } from '@/features/card/hooks/useLocation';
import { useBookmarksStore } from '@/stores/bookmarks.store';
import { useCardTheme } from '@/features/card/hooks/useCardTheme';
import { PartnerBigCard } from '@/features/card/components/PartnerBigCard';
import { FeaturedCarousel } from '@/features/card/components/FeaturedCarousel';
import { PartnerCardSkeleton } from '@/features/card/components/PartnerCardSkeleton';
import { BenefitsEmptyState } from '@/features/card/components/BenefitsEmptyState';
import { PartnerFilters, type SortMode } from '@/features/card/components/PartnerFilters';
import { BenefitsMapView } from '@/features/card/components/BenefitsMapView';
import type { PartnerListItem } from '@ahub/shared/types';

export default function BenefitsScreen() {
  const ct = useCardTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<SortMode>('featured');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { location } = useUserLocation();

  const toggleBookmark = useBookmarksStore((s) => s.toggleBookmark);
  const bookmarkedIds = useBookmarksStore((s) => s.bookmarkedIds);

  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      category: selectedCategory,
      sortBy: sortBy === 'distance' ? ('name' as const) : sortBy === 'featured' ? ('recent' as const) : sortBy,
    }),
    [searchQuery, selectedCategory, sortBy],
  );

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBenefitsList(filters);

  const { data: categoriesData } = useCategories();

  // Enrich partners with distance and apply client-side sorting
  const partners = useMemo(() => {
    const items = data?.pages.flatMap((page) => page.data) || [];

    const withDistance = items.map((partner) => {
      const partnerLat = (partner as unknown as { lat?: number }).lat;
      const partnerLng = (partner as unknown as { lng?: number }).lng;
      const dist =
        location && partnerLat != null && partnerLng != null
          ? calculateDistance(location.lat, location.lng, partnerLat, partnerLng)
          : undefined;
      return { ...partner, _distance: dist };
    });

    if (sortBy === 'distance') {
      withDistance.sort((a, b) => {
        if (a._distance == null && b._distance == null) return 0;
        if (a._distance == null) return 1;
        if (b._distance == null) return -1;
        return a._distance - b._distance;
      });
    } else if (sortBy === 'featured') {
      withDistance.sort((a, b) => {
        // Featured first, then by popularity
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.popularity ?? 0) - (a.popularity ?? 0);
      });
    }

    return withDistance;
  }, [data, location, sortBy]);

  // Featured partners for carousel
  const featuredPartners = useMemo(() => {
    const items = data?.pages.flatMap((page) => page.data) || [];
    const featured = items.filter((p) => p.isFeatured);
    if (featured.length > 0) return featured.slice(0, 8);
    // Fallback: top 5 by popularity
    return [...items]
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .slice(0, 5);
  }, [data]);

  const hasActiveFilters = !!(searchQuery || selectedCategory);

  const handlePartnerPress = useCallback((partner: PartnerListItem) => {
    router.push(`/card/partner/${partner.id}`);
  }, []);

  const handleBookmark = useCallback(
    (id: string) => toggleBookmark(id),
    [toggleBookmark],
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(undefined);
  }, []);

  const handleMapToggle = useCallback(() => {
    setViewMode((prev) => (prev === 'list' ? 'map' : 'list'));
  }, []);

  const renderPartner = ({ item }: { item: (typeof partners)[number] }) => (
    <View style={styles.cardWrapper}>
      <PartnerBigCard
        partner={item}
        onPress={handlePartnerPress}
        onBookmark={handleBookmark}
        isBookmarked={bookmarkedIds.includes(item.id)}
        distance={item._distance != null ? formatDistance(item._distance) : undefined}
      />
    </View>
  );

  const renderHeader = () => {
    if (isLoading) return null;
    if (featuredPartners.length === 0) return null;
    if (searchQuery) return null; // Hide carousel when searching
    return (
      <View style={styles.carouselWrapper}>
        <FeaturedCarousel
          partners={featuredPartners}
          onPress={handlePartnerPress}
        />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <YStack gap={16} paddingTop={8}>
          <PartnerCardSkeleton />
          <PartnerCardSkeleton />
          <PartnerCardSkeleton />
        </YStack>
      );
    }
    return (
      <BenefitsEmptyState
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: ct.screenBgSolid }}
      edges={['top']}
    >
      <YStack flex={1} paddingHorizontal={16}>
        {/* Filters — sticky */}
        <View style={styles.filtersWrap}>
          <PartnerFilters
            categories={categoriesData?.data || []}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            sortBy={sortBy}
            onCategoryChange={setSelectedCategory}
            onSearchChange={setSearchQuery}
            onSortChange={setSortBy}
            onMapToggle={handleMapToggle}
            isMapMode={viewMode === 'map'}
          />
        </View>

        {/* Content: List or Map */}
        {viewMode === 'map' ? (
          <BenefitsMapView
            partners={partners}
            userLocation={location}
            onPartnerPress={handlePartnerPress}
          />
        ) : (
          <FlatList
            data={partners}
            renderItem={renderPartner}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={ct.refreshTint}
                colors={[ct.refreshTint]}
              />
            }
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isFetchingNextPage ? (
                <YStack alignItems="center" paddingVertical={16}>
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
  filtersWrap: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  listContent: {
    paddingBottom: 24,
    gap: 16,
  },
  cardWrapper: {
    paddingHorizontal: 0,
  },
  carouselWrapper: {
    marginBottom: 4,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
});
