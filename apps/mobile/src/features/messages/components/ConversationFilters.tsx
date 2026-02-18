import { memo } from 'react';
import { ScrollView, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { View } from 'tamagui';
import { Text } from '@ahub/ui';
import { colors, messageGlass } from '@ahub/ui/themes';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {FILTERS.map((filter) => {
        const isActive = active === filter.key;
        return (
          <Pressable
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
          >
            <View
              paddingHorizontal="$2.5"
              paddingVertical="$1"
              borderRadius="$full"
              backgroundColor={
                isActive
                  ? (isDark ? 'rgba(139, 92, 246, 0.15)' : colors.primary)
                  : (isDark ? 'transparent' : messageGlass.chipLight)
              }
              borderWidth={isDark ? 1 : 0}
              borderColor={
                isActive
                  ? (isDark ? 'rgba(139, 92, 246, 0.35)' : 'transparent')
                  : (isDark ? 'rgba(255,255,255,0.10)' : 'transparent')
              }
            >
              <Text
                size="xs"
                weight={isActive ? 'semibold' : 'medium'}
                style={{
                  color: isActive
                    ? (isDark ? '#A78BFA' : '#FFFFFF')
                    : (isDark ? 'rgba(255,255,255,0.45)' : '#6B7280'),
                }}
              >
                {filter.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
});
