import React, { useState, useCallback } from 'react';
import { StyleSheet, Pressable, Platform } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, glass } from '@ahub/ui/themes';

interface CancellationPolicyAccordionProps {
  cancellationDeadlineHours?: number;
  onHeightChange?: (delta: number) => void;
}

export function CancellationPolicyAccordion({
  cancellationDeadlineHours = 24,
  onHeightChange,
}: CancellationPolicyAccordionProps) {
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  const animHeight = useSharedValue(0);
  const animOpacity = useSharedValue(0);
  const chevronRotation = useSharedValue(0);

  const toggle = useCallback(() => {
    const next = !expanded;
    setExpanded(next);

    animHeight.value = withTiming(next ? contentHeight : 0, { duration: 250 });
    animOpacity.value = withTiming(next ? 1 : 0, { duration: 200 });
    chevronRotation.value = withTiming(next ? 180 : 0, { duration: 250 });

    onHeightChange?.(next ? contentHeight : 0);

    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  }, [expanded, contentHeight, onHeightChange]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: animHeight.value,
    opacity: animOpacity.value,
    overflow: 'hidden' as const,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  return (
    <YStack
      borderRadius="$md"
      style={expanded ? { backgroundColor: glass.primaryTint } : undefined}
    >
      <Pressable onPress={toggle}>
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingVertical="$2"
          paddingHorizontal="$2"
        >
          <Text size="sm" weight="medium" style={{ color: colors.textSecondary }}>
            Politica de Cancelamento
          </Text>
          <Animated.View style={chevronStyle}>
            <Text size="sm" style={{ color: colors.textTertiary }}>
              ▼
            </Text>
          </Animated.View>
        </XStack>
      </Pressable>

      {/* Hidden measurer */}
      <YStack
        style={styles.measurer}
        onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
      >
        <PolicyContent deadlineHours={cancellationDeadlineHours} />
      </YStack>

      {/* Animated body */}
      <Animated.View style={bodyStyle}>
        <YStack paddingHorizontal="$2" paddingBottom="$2">
          <PolicyContent deadlineHours={cancellationDeadlineHours} />
        </YStack>
      </Animated.View>
    </YStack>
  );
}

function PolicyContent({ deadlineHours }: { deadlineHours: number }) {
  return (
    <YStack gap="$1">
      <Text size="xs" color="secondary">
        Cancelamento gratuito ate {deadlineHours}h antes da data da reserva.
      </Text>
      <Text size="xs" color="secondary">
        Apos este prazo, a reserva so podera ser cancelada por um administrador.
      </Text>
      <Text size="xs" color="secondary">
        Reservas pendentes de aprovacao podem ser canceladas a qualquer momento.
      </Text>
    </YStack>
  );
}

const styles = StyleSheet.create({
  measurer: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
    paddingHorizontal: 8,
  },
});
