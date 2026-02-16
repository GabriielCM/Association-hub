import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, GlassCard } from '@ahub/ui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { PriceDisplay } from './PriceDisplay';
import { CancellationPolicyAccordion } from './CancellationPolicyAccordion';
import { AnimatedConfirmButton } from './AnimatedConfirmButton';
import type { SpaceDetail } from '@ahub/shared/types';

interface InlineConfirmationCardProps {
  visible: boolean;
  space: SpaceDetail;
  date: string;
  shift?: string;
  startTime?: string;
  endTime?: string;
  price: number | null;
  originalPrice?: number | null;
  discountPercentage?: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: string | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getPeriodLabel(space: SpaceDetail, shift?: string, startTime?: string, endTime?: string): string {
  if (space.periodType === 'DAY') return 'Dia inteiro';
  if (space.periodType === 'SHIFT' && shift) return `Turno: ${shift}`;
  if (startTime && endTime) return `${startTime} - ${endTime}`;
  return '';
}

export function InlineConfirmationCard({
  visible,
  space,
  date,
  shift,
  startTime,
  endTime,
  price,
  originalPrice,
  discountPercentage,
  onConfirm,
  onCancel,
  isLoading = false,
  isSuccess = false,
  error,
}: InlineConfirmationCardProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const [accordionDelta, setAccordionDelta] = useState(0);
  const animHeight = useSharedValue(0);
  const animOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible && contentHeight > 0) {
      animHeight.value = withSpring(contentHeight + 32 + accordionDelta, {
        damping: 18,
        stiffness: 120,
        mass: 0.8,
      });
      animOpacity.value = withTiming(1, { duration: 300 });
    } else if (!visible) {
      animHeight.value = withTiming(0, { duration: 250 });
      animOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, contentHeight, accordionDelta]);

  const containerStyle = useAnimatedStyle(() => ({
    height: animHeight.value,
    opacity: animOpacity.value,
    overflow: 'hidden' as const,
  }));

  const periodLabel = getPeriodLabel(space, shift, startTime, endTime);
  const hasPrice = price != null && price > 0;

  return (
    <>
      {/* Hidden measurer */}
      <YStack
        style={styles.measurer}
        onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
      >
        <CardContent
          space={space}
          date={date}
          periodLabel={periodLabel}
          price={price}
          {...(originalPrice != null ? { originalPrice } : {})}
          {...(discountPercentage != null ? { discountPercentage } : {})}
          hasPrice={hasPrice}
          {...(error != null ? { error } : {})}
          onConfirm={onConfirm}
          onCancel={onCancel}
          isLoading={isLoading}
          isSuccess={isSuccess}
        />
      </YStack>

      {/* Animated container */}
      <Animated.View style={containerStyle}>
        <GlassCard intensity="medium" borderRadius={16} padding={16}>
          <CardContent
            space={space}
            date={date}
            periodLabel={periodLabel}
            price={price}
            {...(originalPrice != null ? { originalPrice } : {})}
            {...(discountPercentage != null ? { discountPercentage } : {})}
            hasPrice={hasPrice}
            {...(error != null ? { error } : {})}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isLoading={isLoading}
            isSuccess={isSuccess}
            onAccordionHeightChange={setAccordionDelta}
          />
        </GlassCard>
      </Animated.View>
    </>
  );
}

interface CardContentProps {
  space: SpaceDetail;
  date: string;
  periodLabel: string;
  price: number | null;
  originalPrice?: number | null;
  discountPercentage?: number;
  hasPrice: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  onAccordionHeightChange?: (delta: number) => void;
}

function CardContent({
  space,
  date,
  periodLabel,
  price,
  originalPrice,
  discountPercentage,
  hasPrice,
  error,
  onConfirm,
  onCancel,
  isLoading,
  isSuccess,
  onAccordionHeightChange,
}: CardContentProps) {
  return (
    <YStack gap="$3">
      {/* Title */}
      <YStack gap="$1" alignItems="center">
        <Text weight="bold" size="lg">
          Confirmar Reserva
        </Text>
        <Text size="xs" color="secondary">
          Sua reserva ficara pendente ate aprovacao
        </Text>
      </YStack>

      {/* Summary rows */}
      <YStack
        gap="$2.5"
        padding="$3"
        borderRadius="$md"
        style={{ backgroundColor: 'rgba(139, 92, 246, 0.06)' }}
      >
        <SummaryRow label="Espaco" value={space.name} />
        <SummaryRow label="Data" value={formatDate(date)} />
        <SummaryRow label="Periodo" value={periodLabel} />
        <XStack justifyContent="space-between" alignItems="center">
          <Text size="sm" color="secondary">Taxa</Text>
          {hasPrice && originalPrice != null && originalPrice !== price ? (
            <PriceDisplay
              originalPrice={originalPrice}
              finalPrice={price!}
              {...(discountPercentage != null ? { discountPercentage } : {})}
              size="sm"
            />
          ) : (
            <Text size="sm" weight="semibold" color="accent">
              {price != null && price > 0
                ? `R$ ${(price / 100).toFixed(2)}`
                : 'Gratuito'}
            </Text>
          )}
        </XStack>
      </YStack>

      {/* Cancellation policy */}
      <CancellationPolicyAccordion
        {...(onAccordionHeightChange != null ? { onHeightChange: onAccordionHeightChange } : {})}
      />

      {/* Error */}
      {error && (
        <Text size="sm" color="error" style={{ textAlign: 'center' }}>
          {error}
        </Text>
      )}

      {/* Confirm button */}
      <AnimatedConfirmButton
        price={price}
        {...(originalPrice != null ? { originalPrice } : {})}
        onPress={onConfirm}
        loading={isLoading}
        success={isSuccess}
        disabled={false}
      />

      {/* Cancel link */}
      {!isLoading && !isSuccess && (
        <Text
          size="sm"
          color="secondary"
          onPress={onCancel}
          style={{ textAlign: 'center', paddingVertical: 4 }}
        >
          Voltar
        </Text>
      )}
    </YStack>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack justifyContent="space-between">
      <Text size="sm" color="secondary">{label}</Text>
      <Text size="sm" weight="medium" style={{ maxWidth: '60%', textAlign: 'right' }}>
        {value}
      </Text>
    </XStack>
  );
}

const styles = StyleSheet.create({
  measurer: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
    left: 0,
    right: 0,
  },
});
