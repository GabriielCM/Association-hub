import { FlatList } from 'react-native';
import { router } from 'expo-router';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Spinner, ScreenHeader, Icon } from '@ahub/ui';
import { ClipboardText } from '@ahub/ui/src/icons';
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
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <ScreenHeader title="Histórico do Cartão" headingLevel={3} onBack={() => router.back()} />
      <YStack flex={1} padding="$4" gap="$4">
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
                <Spinner size="lg" />
              </YStack>
            ) : (
              <YStack alignItems="center" paddingVertical="$8">
                <Icon icon={ClipboardText} size="xl" color="muted" />
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
