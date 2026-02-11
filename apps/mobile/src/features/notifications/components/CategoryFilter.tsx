import { useCallback } from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { XStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import type { NotificationCategory } from '@ahub/shared/types';

type FilterValue = NotificationCategory | 'ALL';

const CATEGORIES: { value: FilterValue; label: string; icon: string }[] = [
  { value: 'ALL', label: 'Todas', icon: '📋' },
  { value: 'SOCIAL', label: 'Social', icon: '💬' },
  { value: 'EVENTS', label: 'Eventos', icon: '🎉' },
  { value: 'POINTS', label: 'Pontos', icon: '⭐' },
  { value: 'RESERVATIONS', label: 'Reservas', icon: '📅' },
  { value: 'SYSTEM', label: 'Sistema', icon: '🔔' },
];

interface CategoryFilterProps {
  selected: FilterValue;
  onSelect: (category: FilterValue) => void;
  unreadByCategory?: Record<string, number>;
}

export function CategoryFilter({
  selected,
  onSelect,
  unreadByCategory,
}: CategoryFilterProps) {
  const renderChip = useCallback(
    (item: (typeof CATEGORIES)[number]) => {
      const isActive = selected === item.value;
      const count =
        item.value === 'ALL'
          ? undefined
          : unreadByCategory?.[item.value];

      return (
        <Pressable
          key={item.value}
          onPress={() => onSelect(item.value)}
        >
          <XStack
            alignItems="center"
            gap="$1"
            paddingHorizontal="$2.5"
            paddingVertical="$1.5"
            borderRadius="$full"
            backgroundColor={isActive ? '$primary' : '$backgroundHover'}
          >
            <Text size="sm">{item.icon}</Text>
            <Text
              size="xs"
              weight="semibold"
              color={isActive ? 'white' : 'secondary'}
            >
              {item.label}
            </Text>
            {count !== undefined && count > 0 && (
              <View
                minWidth={16}
                height={16}
                borderRadius="$full"
                backgroundColor={isActive ? 'rgba(255,255,255,0.3)' : '$primary'}
                alignItems="center"
                justifyContent="center"
                paddingHorizontal="$0.5"
              >
                <Text
                  style={{ fontSize: 9, lineHeight: 11 }}
                  weight="bold"
                  color={isActive ? 'white' : 'white'}
                >
                  {count > 99 ? '99+' : count}
                </Text>
              </View>
            )}
          </XStack>
        </Pressable>
      );
    },
    [selected, onSelect, unreadByCategory]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map(renderChip)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
});
