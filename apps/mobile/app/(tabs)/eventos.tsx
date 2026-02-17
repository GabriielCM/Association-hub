import { useState, useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Card, Spinner, Icon } from '@ahub/ui';
import { Calendar } from '@ahub/ui/src/icons';
import { useEvents } from '@/features/events/hooks/useEvents';
import { EventCard } from '@/features/events/components/EventCard';
import { EventFilters } from '@/features/events/components/EventFilters';
import type { EventFilter, EventCategory, EventListItem } from '@ahub/shared/types';

export default function EventosScreen() {
  const [filter, setFilter] = useState<EventFilter>('upcoming');
  const [category, setCategory] = useState<EventCategory | undefined>();
  const [search, setSearch] = useState('');

  const { data, isLoading, isRefetching, refetch } = useEvents({
    filter,
    category,
    search: search || undefined,
  });

  const events = data?.data ?? [];

  const renderItem = useCallback(
    ({ item }: { item: EventListItem }) => <EventCard event={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: EventListItem) => item.id,
    []
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListHeaderComponent={
          <YStack gap="$3" marginBottom="$2">
            <Heading level={3}>Eventos</Heading>
            <EventFilters
              filter={filter}
              category={category}
              search={search}
              onFilterChange={setFilter}
              onCategoryChange={setCategory}
              onSearchChange={setSearch}
            />
          </YStack>
        }
        ListEmptyComponent={
          isLoading ? (
            <YStack alignItems="center" paddingVertical="$6">
              <Spinner size="lg" />
            </YStack>
          ) : (
            <Card variant="flat">
              <YStack
                gap="$3"
                alignItems="center"
                justifyContent="center"
                paddingVertical="$6"
              >
                <Icon icon={Calendar} size="xl" color="muted" weight="duotone" />
                <Text weight="semibold">Nenhum evento encontrado</Text>
                <Text color="secondary" size="sm" align="center">
                  {filter === 'upcoming'
                    ? 'Novos eventos serao exibidos aqui quando disponiveis'
                    : 'Tente ajustar os filtros para encontrar eventos'}
                </Text>
              </YStack>
            </Card>
          )
        }
      />
    </SafeAreaView>
  );
}
