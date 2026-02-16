import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Pressable, Platform, View } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, Heading, Spinner } from '@ahub/ui';
import * as Haptics from 'expo-haptics';
import { useSpaces } from '@/features/spaces/hooks/useSpaces';
import { SpaceCard } from '@/features/spaces/components/SpaceCard';
import { EmptyStateIllustration } from '@/features/shared/components/EmptyStateIllustration';
import type { SpaceListItem } from '@ahub/shared/types';

const ItemSeparator = () => <View style={{ height: 12 }} />;

export default function SpacesListScreen() {
  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useSpaces({ status: 'ACTIVE' });

  const spaces = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const handleSpacePress = useCallback((space: SpaceListItem) => {
    router.push({
      pathname: '/spaces/[spaceId]' as any,
      params: { spaceId: space.id },
    });
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        gap="$3"
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text size="lg">←</Text>
        </Pressable>
        <Heading level={4}>Espaços</Heading>
      </XStack>

      {/* Spaces list */}
      {isLoading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner />
        </YStack>
      ) : spaces.length === 0 ? (
        <EmptyStateIllustration
          animation="no-spaces"
          title="Nenhum espaço disponível"
          description="Os espaços aparecerão aqui quando cadastrados pela administração."
        />
      ) : (
        <FlatList
          data={spaces}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SpaceCard space={item} onPress={handleSpacePress} />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={ItemSeparator}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          refreshing={isFetching && !isFetchingNextPage}
          onRefresh={handleRefresh}
          ListFooterComponent={
            isFetchingNextPage ? (
              <YStack padding="$3" alignItems="center" justifyContent="center">
                <Spinner />
              </YStack>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
