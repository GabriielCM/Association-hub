import { useState } from 'react';
import { Pressable, StyleSheet, Modal, FlatList } from 'react-native';
import { XStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { CaretDown, Check } from '@ahub/ui/src/icons';
import { useStoreTheme } from '../hooks/useStoreTheme';

export type SortOption = 'recent' | 'price_asc' | 'price_desc' | 'best_selling' | 'name_asc';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Mais Recentes' },
  { value: 'price_asc', label: 'Preço: Menor' },
  { value: 'price_desc', label: 'Preço: Maior' },
  { value: 'best_selling', label: 'Mais Vendidos' },
  { value: 'name_asc', label: 'A-Z' },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const st = useStoreTheme();
  const [open, setOpen] = useState(false);
  const selected = SORT_OPTIONS.find((o) => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.trigger, {
          borderColor: st.chipBorder,
          backgroundColor: st.chipBg,
        }]}
        hitSlop={4}
      >
        <XStack gap="$1" alignItems="center">
          <Text size="sm" style={{ color: st.textSecondary }}>
            {selected?.label ?? 'Ordenar'}
          </Text>
          <Icon icon={CaretDown} size={14} color={st.iconColor} />
        </XStack>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: st.backdropBg }]}
          onPress={() => setOpen(false)}
        >
          <View style={[styles.menu, { backgroundColor: st.menuBg }, st.menuShadow]}>
            <FlatList
              data={SORT_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={styles.menuItem}
                >
                  <XStack
                    justifyContent="space-between"
                    alignItems="center"
                    flex={1}
                  >
                    <Text
                      size="sm"
                      weight={item.value === value ? 'bold' : 'regular'}
                      style={{ color: item.value === value ? st.accent : st.textPrimary }}
                    >
                      {item.label}
                    </Text>
                    {item.value === value && (
                      <Icon icon={Check} size={16} color={st.accent} />
                    )}
                  </XStack>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    borderRadius: 12,
    paddingVertical: 8,
    width: 220,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
