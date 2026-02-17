import { useState, useCallback, useMemo } from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Spinner, ScreenHeader, Icon } from '@ahub/ui';
import MagnifyingGlass from 'phosphor-react-native/src/icons/MagnifyingGlass';
import { useBenefitsList, useCategories } from '@/features/card/hooks/useBenefits';
import { PartnerCard } from '@/features/card/components/PartnerCard';
import { PartnerFilters } from '@/features/card/components/PartnerFilters';
import type { PartnerListItem } from '@ahub/shared/types';

export default function BenefitsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      category: selectedCategory,
    }),
    [searchQuery, selectedCategory]
  );

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBenefitsList(filters);

  const { data: categoriesData } = useCategories();

  const partners = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data]
  );

  const handlePartnerPress = useCallback((partner: PartnerListItem) => {
    router.push(`/card/partner/${partner.id}`);
  }, []);

  const renderPartner = ({ item }: { item: PartnerListItem }) => (
    <PartnerCard partner={item} onPress={handlePartnerPress} />
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <ScreenHeader title="Benefícios" headingLevel={3} onBack={() => router.back()} />
      <YStack flex={1} padding="$4" gap="$4">
        {/* Filters */}
        <PartnerFilters
          categories={categoriesData?.data || []}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchQuery}
        />

        {/* Partners List */}
        <FlatList
          data={partners}
          renderItem={renderPartner}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            isLoading ? (
              <YStack alignItems="center" paddingVertical="$8">
                <Spinner size="lg" />
              </YStack>
            ) : (
              <YStack alignItems="center" paddingVertical="$8">
                <Icon icon={MagnifyingGlass} size="xl" color="muted" weight="duotone" />
                <Text color="secondary" align="center" marginTop="$2">
                  Nenhum parceiro encontrado.
                </Text>
              </YStack>
            )
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <YStack alignItems="center" paddingVertical="$4">
                <Spinner />
              </YStack>
            ) : null
          }
        />
      </YStack>
    </SafeAreaView>
  );
}
