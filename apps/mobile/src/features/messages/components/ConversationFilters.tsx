import { memo } from 'react';
import { ScrollView, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { XStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import { colors } from '@ahub/ui/themes';
import { GlassView } from './GlassView';

export type ConversationFilter = 'all' | 'unread' | 'groups' | 'direct';

const FILTERS: { key: ConversationFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'unread', label: 'Nao lidas' },
  { key: 'groups', label: 'Grupos' },
  { key: 'direct', label: 'Diretas' },
];

interface ConversationFiltersProps {
  active: ConversationFilter;
  onFilterChange: (filter: ConversationFilter) => void;
}

export const ConversationFilters = memo(function ConversationFilters({
  active,
  onFilterChange,
}: ConversationFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((filter) => {
        const isActive = active === filter.key;
        return (
          <Pressable
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
          >
            {isActive ? (
              <View
                paddingHorizontal="$2.5"
                paddingVertical="$1"
                borderRadius="$full"
                backgroundColor={colors.primary}
              >
                <Text size="xs" weight="semibold" style={{ color: '#FFFFFF' }}>
                  {filter.label}
                </Text>
              </View>
            ) : (
              <GlassView variant="chip" borderRadius={9999}>
                <View paddingHorizontal="$2.5" paddingVertical="$1">
                  <Text size="xs" weight="medium" color="secondary">
                    {filter.label}
                  </Text>
                </View>
              </GlassView>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 8,
  },
});
