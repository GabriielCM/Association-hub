import { useState, useCallback } from 'react';
import { XStack, YStack } from 'tamagui';
import { TextInput, StyleSheet } from 'react-native';
import { Badge } from '@ahub/ui';
import type { EventFilter, EventCategory } from '@ahub/shared/types';

interface EventFiltersProps {
  filter: EventFilter;
  category?: EventCategory | undefined;
  search: string;
  onFilterChange: (filter: EventFilter) => void;
  onCategoryChange: (category: EventCategory | undefined) => void;
  onSearchChange: (search: string) => void;
}

const filterOptions: { value: EventFilter; label: string }[] = [
  { value: 'upcoming', label: 'Proximos' },
  { value: 'ongoing', label: 'Ao Vivo' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'past', label: 'Passados' },
  { value: 'all', label: 'Todos' },
];

export function EventFilters({
  filter,
  search,
  onFilterChange,
  onSearchChange,
}: EventFiltersProps) {
  const [searchText, setSearchText] = useState(search);

  const handleSearchSubmit = useCallback(() => {
    onSearchChange(searchText);
  }, [searchText, onSearchChange]);

  return (
    <YStack gap="$3">
      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar eventos..."
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearchSubmit}
        returnKeyType="search"
      />

      {/* Filter tabs */}
      <XStack gap="$2" flexWrap="wrap">
        {filterOptions.map((opt) => (
          <Badge
            key={opt.value}
            variant={filter === opt.value ? 'primary' : 'ghost'}
            onPress={() => onFilterChange(opt.value)}
          >
            {opt.label}
          </Badge>
        ))}
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
});
