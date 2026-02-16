import React from 'react';
import { StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { colors } from '@ahub/ui/themes';

interface PriceDisplayProps {
  originalPrice: number;
  finalPrice?: number;
  discountPercentage?: number;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'inline' | 'stacked';
}

const FONT_SIZES = {
  sm: { original: 'xs' as const, final: 'sm' as const },
  md: { original: 'sm' as const, final: 'base' as const },
  lg: { original: 'base' as const, final: 'lg' as const },
};

function formatCurrency(cents: number): string {
  if (cents === 0) return 'Gratuito';
  return `R$ ${(cents / 100).toFixed(2)}`;
}

export function PriceDisplay({
  originalPrice,
  finalPrice,
  discountPercentage,
  size = 'md',
  layout = 'inline',
}: PriceDisplayProps) {
  const fontSize = FONT_SIZES[size] ?? FONT_SIZES.md;
  const hasDiscount = finalPrice != null && finalPrice !== originalPrice;

  if (originalPrice === 0) {
    return (
      <Text size={fontSize.final} weight="semibold" color="accent">
        Gratuito
      </Text>
    );
  }

  if (!hasDiscount) {
    return (
      <Text size={fontSize.final} weight="semibold" color="accent">
        {formatCurrency(originalPrice)}
      </Text>
    );
  }

  const Container = layout === 'inline' ? XStack : YStack;

  return (
    <Container gap="$1" alignItems={layout === 'inline' ? 'center' : 'flex-end'}>
      <Text
        size={fontSize.original}
        color="secondary"
        style={styles.strikethrough}
      >
        {formatCurrency(originalPrice)}
      </Text>
      <Text size={fontSize.final} weight="bold" style={{ color: colors.primary }}>
        {formatCurrency(finalPrice!)}
      </Text>
      {discountPercentage != null && discountPercentage > 0 && (
        <XStack
          backgroundColor="rgba(34, 197, 94, 0.12)"
          paddingHorizontal="$1"
          paddingVertical={2}
          borderRadius="$full"
        >
          <Text size="xs" weight="semibold" style={{ color: colors.successDark }}>
            -{discountPercentage}%
          </Text>
        </XStack>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  strikethrough: {
    textDecorationLine: 'line-through',
  },
});
