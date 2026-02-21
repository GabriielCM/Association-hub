import { View, Pressable, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';

import { Text } from '@ahub/ui';
import { useDashboardTheme } from '../hooks/useDashboardTheme';

interface OnboardingTooltipProps {
  title: string;
  text: string;
  stepIndex: number;
  totalSteps: number;
  isLastStep: boolean;
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingTooltip({
  title,
  text,
  stepIndex,
  totalSteps,
  isLastStep,
  onNext,
  onSkip,
}: OnboardingTooltipProps) {
  const dt = useDashboardTheme();

  return (
    <YStack
      gap="$2"
      padding="$4"
      style={[
        styles.container,
        {
          backgroundColor: dt.isDark
            ? 'rgba(13, 5, 32, 0.95)'
            : 'rgba(0, 0, 0, 0.88)',
        },
      ]}
    >
      <Text weight="bold" size="lg" style={styles.title}>
        {title}
      </Text>
      <Text size="sm" style={styles.description}>
        {text}
      </Text>

      <XStack
        justifyContent="space-between"
        alignItems="center"
        marginTop={8}
      >
        <Pressable onPress={onSkip} hitSlop={8}>
          <Text size="sm" style={styles.skipText}>
            Pular tutorial
          </Text>
        </Pressable>

        <Pressable
          onPress={isLastStep ? onSkip : onNext}
          style={[styles.nextBtn, { backgroundColor: dt.accent }]}
        >
          <Text weight="semibold" size="sm" style={styles.nextBtnText}>
            {isLastStep ? 'Entendi!' : 'Próximo'}
          </Text>
        </Pressable>
      </XStack>

      {/* Step dots */}
      <XStack justifyContent="center" gap={6} marginTop={8}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === stepIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
  },
  title: {
    color: '#FFFFFF',
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
  },
  skipText: {
    color: 'rgba(255,255,255,0.6)',
  },
  nextBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  nextBtnText: {
    color: '#FFFFFF',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
