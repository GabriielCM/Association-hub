import { useState, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Dimensions, View } from 'react-native';
import { YStack } from 'tamagui';

import { Text } from '@ahub/ui';
import { colors } from '@ahub/ui/themes';
import { getBoolean, setBoolean, STORAGE_KEYS } from '@/services/storage/mmkv';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Step {
  title: string;
  description: string;
  spotlightY: number;
  spotlightHeight: number;
}

const STEPS: Step[] = [
  {
    title: 'Seus Pontos',
    description:
      'Aqui voce ve seu saldo de pontos, variacao diaria e grafico dos ultimos 7 dias.',
    spotlightY: 120,
    spotlightHeight: 120,
  },
  {
    title: 'Acesso Rapido',
    description:
      'Deslize para acessar todos os modulos: Eventos, Loja, Reservas, Rankings e mais!',
    spotlightY: 260,
    spotlightHeight: 100,
  },
  {
    title: 'Stories',
    description:
      'Veja os stories da comunidade e compartilhe os seus. Toque no "+" para criar!',
    spotlightY: 380,
    spotlightHeight: 80,
  },
  {
    title: 'Feed',
    description:
      'Acompanhe posts, enquetes e eventos da comunidade. Role para ver mais!',
    spotlightY: 480,
    spotlightHeight: 100,
  },
];

export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const completed = getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED);
    if (!completed) {
      // Small delay to let the screen render first
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSkip();
    }
  };

  const handleSkip = () => {
    setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    setVisible(false);
  };

  if (!visible) return null;

  const currentStep = STEPS[step];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Semi-transparent background with spotlight cutout */}
        <View
          style={[
            styles.spotlightTop,
            { height: currentStep.spotlightY },
          ]}
        />
        <View
          style={[
            styles.spotlight,
            { height: currentStep.spotlightHeight },
          ]}
        />
        <View style={styles.spotlightBottom} />

        {/* Tooltip */}
        <YStack
          style={[
            styles.tooltip,
            {
              top: currentStep.spotlightY + currentStep.spotlightHeight + 16,
            },
          ]}
          gap="$2"
          padding="$4"
        >
          <Text weight="bold" size="lg" style={{ color: '#FFF' }}>
            {currentStep.title}
          </Text>
          <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {currentStep.description}
          </Text>

          <View style={styles.tooltipActions}>
            <Pressable onPress={handleSkip}>
              <Text size="sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Pular tutorial
              </Text>
            </Pressable>

            <Pressable onPress={handleNext} style={styles.nextBtn}>
              <Text
                weight="semibold"
                size="sm"
                style={{ color: '#FFF' }}
              >
                {step < STEPS.length - 1 ? 'Proximo' : 'Entendi!'}
              </Text>
            </Pressable>
          </View>

          {/* Step indicator */}
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === step && styles.dotActive]}
              />
            ))}
          </View>
        </YStack>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  spotlightTop: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: SCREEN_WIDTH,
  },
  spotlight: {
    width: SCREEN_WIDTH,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  spotlightBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: SCREEN_WIDTH,
  },
  tooltip: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 12,
  },
  tooltipActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  nextBtn: {
    backgroundColor: colors.accentDark,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#FFF',
  },
});
