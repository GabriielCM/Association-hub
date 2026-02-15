import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Pressable } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, Heading, Spinner } from '@ahub/ui';
import { useSpaces } from '@/features/spaces/hooks/useSpaces';
import { SpaceCard } from '@/features/spaces/components/SpaceCard';
import type { SpaceListItem } from '@ahub/shared/types';

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

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
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
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap="$3"
          padding="$4"
        >
          <Text size="2xl">🏠</Text>
          <Text weight="semibold">Nenhum espaço disponível</Text>
          <Text color="secondary" size="sm" align="center">
            Os espaços aparecerão aqui quando cadastrados
          </Text>
        </YStack>
      ) : (
        <FlatList
          data={spaces}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SpaceCard space={item} onPress={handleSpacePress} />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          refreshing={isFetching && !isFetchingNextPage}
          onRefresh={() => refetch()}
          ListFooterComponent={
            isFetchingNextPage ? (
              <YStack padding="$3" alignItems="center">
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
    padding: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
});
