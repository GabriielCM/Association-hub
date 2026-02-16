import React, { useEffect } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text, NativeViewFallback } from '@ahub/ui';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, glass } from '@ahub/ui/themes';

type BookingStep = 'date' | 'period' | 'review' | 'confirmed';

interface BookingProgressBarProps {
  currentStep: BookingStep;
}

const STEPS: { key: BookingStep; label: string; progress: number }[] = [
  { key: 'date', label: 'Data', progress: 0.25 },
  { key: 'period', label: 'Período', progress: 0.5 },
  { key: 'review', label: 'Revisão', progress: 0.75 },
  { key: 'confirmed', label: 'Confirmado', progress: 1.0 },
];

function getProgress(step: BookingStep): number {
  const found = STEPS.find((s) => s.key === step);
  return found?.progress ?? 0.25;
}

export function BookingProgressBar({ currentStep }: BookingProgressBarProps) {
  const fillWidth = useSharedValue(getProgress(currentStep));
  const prevStep = useSharedValue(currentStep);

  useEffect(() => {
    const target = getProgress(currentStep);
    const wasAdvancing = getProgress(currentStep) > fillWidth.value;

    fillWidth.value = withTiming(target, {
      duration: 400,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

    if (wasAdvancing && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    prevStep.value = currentStep;
  }, [currentStep]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${fillWidth.value * 100}%` as any,
  }));

  return (
    <YStack gap="$1.5" paddingHorizontal="$4">
      {/* Track */}
      <YStack
        height={4}
        borderRadius="$full"
        backgroundColor={glass.bgLightSubtle}
        overflow="hidden"
      >
        <Animated.View style={[styles.fill, animatedFillStyle]}>
          <NativeViewFallback
            fallback={<View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]} />}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </NativeViewFallback>
        </Animated.View>
      </YStack>

      {/* Labels */}
      <XStack justifyContent="space-between">
        {STEPS.map((step) => {
          const isActive = getProgress(currentStep) >= step.progress;
          return (
            <Text
              key={step.key}
              size="xs"
              weight={isActive ? 'semibold' : 'regular'}
              style={{ color: isActive ? colors.primary : colors.textTertiary }}
            >
              {step.label}
            </Text>
          );
        })}
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  fill: {
    height: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
  },
});
