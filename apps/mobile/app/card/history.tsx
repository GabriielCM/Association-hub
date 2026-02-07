import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button, Spinner } from '@ahub/ui';
import { useCardHistory } from '@/features/card/hooks/useCard';
import { CardHistoryItem } from '@/features/card/components/CardHistoryItem';
import type { CardUsageLog } from '@ahub/shared/types';
import { useMemo } from 'react';

export default function CardHistoryScreen() {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCardHistory();

  const logs = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data]
  );

  const renderItem = ({ item }: { item: CardUsageLog }) => (
    <CardHistoryItem log={item} />
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} padding="$4" gap="$4">
        {/* Header */}
        <XStack alignItems="center" gap="$2">
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            ←
          </Button>
          <Heading level={3}>Histórico do Cartão</Heading>
        </XStack>

        {/* History List */}
        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
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
                <Spinner size="large" />
              </YStack>
            ) : (
              <YStack alignItems="center" paddingVertical="$8">
                <Text style={{ fontSize: 40 }}>📋</Text>
                <Text color="secondary" align="center" marginTop="$2">
                  Nenhum uso registrado ainda.
                </Text>
                <Text color="secondary" size="sm" align="center">
                  Apresente sua carteirinha em eventos para registrar seu histórico.
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
