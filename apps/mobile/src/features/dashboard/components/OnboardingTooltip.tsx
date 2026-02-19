import { View, Pressable, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { useCopilot } from 'react-native-copilot';

import { Text } from '@ahub/ui';
import { useDashboardTheme } from '../hooks/useDashboardTheme';

const STEP_TITLES: Record<string, string> = {
  'points-card': 'Seus Pontos',
  'quick-access': 'Acesso Rápido',
  'stories-row': 'Stories',
  'feed-area': 'Feed',
};

const TOTAL_STEPS = 4;

export function OnboardingTooltip() {
  const { isLastStep, goToNext, stop, currentStep } = useCopilot();
  const handleNext = () => { void goToNext(); };
  const handleStop = () => { void stop(); };
  const dt = useDashboardTheme();

  const stepName = currentStep?.name ?? '';
  const title = STEP_TITLES[stepName] ?? '';
  const currentOrder = currentStep?.order ?? 1;

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
        {currentStep?.text}
      </Text>

      <XStack
        justifyContent="space-between"
        alignItems="center"
        marginTop={8}
      >
        <Pressable onPress={handleStop} hitSlop={8}>
          <Text size="sm" style={styles.skipText}>
            Pular tutorial
          </Text>
        </Pressable>

        <Pressable
          onPress={isLastStep ? handleStop : handleNext}
          style={[styles.nextBtn, { backgroundColor: dt.accent }]}
        >
          <Text weight="semibold" size="sm" style={styles.nextBtnText}>
            {isLastStep ? 'Entendi!' : 'Próximo'}
          </Text>
        </Pressable>
      </XStack>

      {/* Step dots */}
      <XStack justifyContent="center" gap={6} marginTop={8}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i + 1 === currentOrder ? styles.dotActive : styles.dotInactive,
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
