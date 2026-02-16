import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text, Input } from '@ahub/ui';
import type { PartnerCategory } from '@ahub/shared/types';

interface PartnerFiltersProps {
  categories: PartnerCategory[];
  selectedCategory?: string | undefined;
  searchQuery: string;
  onCategoryChange: (category?: string) => void;
  onSearchChange: (query: string) => void;
}

export function PartnerFilters({
  categories,
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
}: PartnerFiltersProps) {
  return (
    <YStack gap="$3">
      {/* Search */}
      <Input
        placeholder="Buscar parceiros..."
        value={searchQuery}
        onChangeText={onSearchChange}
        autoCapitalize="none"
      />

      {/* Category Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2" paddingRight="$2">
          <CategoryChip
            label="Todos"
            isSelected={!selectedCategory}
            onPress={() => onCategoryChange(undefined)}
          />
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={`${cat.icon || ''} ${cat.name}`}
              isSelected={selectedCategory === cat.id}
              count={cat.partnersCount}
              onPress={() => onCategoryChange(cat.id)}
            />
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  );
}

function CategoryChip({
  label,
  isSelected,
  count,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  count?: number | undefined;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, isSelected && styles.chipSelected]}
    >
      <Text
        style={[styles.chipText, isSelected && styles.chipTextSelected]}
      >
        {label}
        {count !== undefined ? ` (${count})` : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  chipTextSelected: {
    color: '#fff',
  },
});
