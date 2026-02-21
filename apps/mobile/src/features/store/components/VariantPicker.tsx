import { Pressable, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { useStoreTheme } from '../hooks/useStoreTheme';
import type { ProductVariant } from '@ahub/shared/types';

interface VariantPickerProps {
  variants: ProductVariant[];
  selectedId?: string | undefined;
  onSelect: (variant: ProductVariant) => void;
}

export function VariantPicker({
  variants,
  selectedId,
  onSelect,
}: VariantPickerProps) {
  const st = useStoreTheme();
  const activeVariants = variants.filter((v) => v.isActive && v.stockCount > 0);

  if (activeVariants.length === 0) {
    return null;
  }

  const attributeKeys = new Set<string>();
  activeVariants.forEach((v) => {
    Object.keys(v.attributes).forEach((key) => attributeKeys.add(key));
  });

  return (
    <YStack gap="$3">
      <Text weight="semibold" size="sm" style={{ color: st.textPrimary }}>
        Variações
      </Text>

      <XStack flexWrap="wrap" gap="$2">
        {activeVariants.map((variant) => {
          const isSelected = variant.id === selectedId;
          const isOutOfStock = variant.stockCount <= 0;

          return (
            <Pressable
              key={variant.id}
              onPress={() => onSelect(variant)}
              disabled={isOutOfStock}
              style={[
                styles.chip,
                {
                  borderColor: st.chipBorder,
                  backgroundColor: st.chipBg,
                },
                isSelected && {
                  borderColor: st.chipSelectedBorder,
                  backgroundColor: st.chipSelectedBg,
                },
                isOutOfStock && styles.chipDisabled,
              ]}
            >
              <Text
                size="sm"
                weight={isSelected ? 'bold' : 'medium'}
                style={[
                  { color: st.textPrimary },
                  isOutOfStock && styles.textDisabled,
                ]}
              >
                {variant.name}
              </Text>
            </Pressable>
          );
        })}
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  textDisabled: {
    textDecorationLine: 'line-through',
  },
});
