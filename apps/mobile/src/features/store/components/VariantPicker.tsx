import { Pressable, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text } from '@ahub/ui';
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
  // Group variants by attribute keys
  const activeVariants = variants.filter((v) => v.isActive && v.stockCount > 0);

  if (activeVariants.length === 0) {
    return null;
  }

  // Extract unique attribute types from all variants
  const attributeKeys = new Set<string>();
  activeVariants.forEach((v) => {
    Object.keys(v.attributes).forEach((key) => attributeKeys.add(key));
  });

  return (
    <YStack gap="$3">
      <Text weight="semibold" size="sm">
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
                isSelected && styles.chipSelected,
                isOutOfStock && styles.chipDisabled,
              ]}
            >
              <Text
                size="sm"
                weight={isSelected ? 'bold' : 'medium'}
                style={isOutOfStock ? styles.textDisabled : undefined}
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
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  chipSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  chipDisabled: {
    opacity: 0.4,
  },
  textDisabled: {
    textDecorationLine: 'line-through',
  },
});
