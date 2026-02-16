import { useState, useCallback, useMemo } from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button, Spinner } from '@ahub/ui';
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
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} padding="$4" gap="$4">
        {/* Header */}
        <XStack alignItems="center" gap="$2">
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            ←
          </Button>
          <Heading level={3}>Benefícios</Heading>
        </XStack>

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
                <Text style={{ fontSize: 40 }}>🔍</Text>
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
