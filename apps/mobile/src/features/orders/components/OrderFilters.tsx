import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { XStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import type { OrdersFilter, OrderSource, OrderStatus } from '@ahub/shared/types';

interface OrderFiltersProps {
  filters: OrdersFilter;
  onChange: (filters: OrdersFilter) => void;
}

const SOURCE_OPTIONS: Array<{ label: string; value: OrderSource | undefined }> = [
  { label: 'Todos', value: undefined },
  { label: 'Loja', value: 'STORE' },
  { label: 'PDV', value: 'PDV' },
];

const STATUS_OPTIONS: Array<{ label: string; value: OrderStatus | undefined }> = [
  { label: 'Todos', value: undefined },
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Confirmado', value: 'CONFIRMED' },
  { label: 'Pronto', value: 'READY' },
  { label: 'Concluido', value: 'COMPLETED' },
];

export function OrderFilters({ filters, onChange }: OrderFiltersProps) {
  return (
    <View gap="$2">
      {/* Source chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2" paddingHorizontal={16}>
          {SOURCE_OPTIONS.map((opt) => {
            const isActive = filters.source === opt.value;
            return (
              <Pressable
                key={opt.label}
                onPress={() => onChange({ ...filters, source: opt.value, page: 1 })}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text
                  size="xs"
                  weight={isActive ? 'bold' : 'medium'}
                  style={isActive ? styles.chipTextActive : styles.chipText}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}

          <View style={styles.divider} />

          {STATUS_OPTIONS.map((opt) => {
            const isActive = filters.status === opt.value;
            return (
              <Pressable
                key={opt.label}
                onPress={() => onChange({ ...filters, status: opt.value, page: 1 })}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text
                  size="xs"
                  weight={isActive ? 'bold' : 'medium'}
                  style={isActive ? styles.chipTextActive : styles.chipText}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </XStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: '#7C3AED',
  },
  chipText: {
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 2,
  },
});
