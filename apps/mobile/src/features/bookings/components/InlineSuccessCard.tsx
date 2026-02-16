import React, { useEffect, useRef } from 'react';
import { StyleSheet, Pressable, Platform } from 'react-native';
import { YStack } from 'tamagui';
import { Text, GlassCard } from '@ahub/ui';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@ahub/ui/themes';

interface InlineSuccessCardProps {
  visible: boolean;
  spaceName: string;
  date: string;
  periodLabel: string;
  onViewBookings: () => void;
  onDismiss: () => void;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  });
}

export function InlineSuccessCard({
  visible,
  spaceName,
  date,
  periodLabel,
  onViewBookings,
  onDismiss,
}: InlineSuccessCardProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 120 });
      lottieRef.current?.play();

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = 0.95;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard intensity="medium" borderRadius={16} padding={20}>
        <YStack alignItems="center" gap="$3">
          {/* Lottie check animation */}
          <LottieView
            ref={lottieRef}
            source={require('@/assets/animations/success-check.json')}
            autoPlay={false}
            loop={false}
            style={styles.lottie}
          />

          {/* Title */}
          <Text weight="bold" size="lg" style={{ textAlign: 'center' }}>
            Reserva criada com sucesso!
          </Text>

          <Text size="sm" color="secondary" style={{ textAlign: 'center' }}>
            Sua reserva esta pendente de aprovacao.
          </Text>

          {/* Compact summary */}
          <YStack
            gap="$1.5"
            padding="$2"
            borderRadius="$md"
            width="100%"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)' }}
          >
            <Text size="xs" color="secondary" style={{ textAlign: 'center' }}>
              {spaceName} • {formatDateShort(date)} • {periodLabel}
            </Text>
          </YStack>

          {/* Actions */}
          <YStack gap="$2" width="100%">
            <Pressable onPress={onViewBookings} style={styles.primaryButton}>
              <Text size="sm" weight="semibold" style={{ color: '#FFFFFF' }}>
                Ver Minhas Reservas
              </Text>
            </Pressable>

            <Text
              size="sm"
              color="secondary"
              onPress={onDismiss}
              style={{ textAlign: 'center', paddingVertical: 4 }}
            >
              Voltar
            </Text>
          </YStack>
        </YStack>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  lottie: {
    width: 120,
    height: 120,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: 'center',
  },
});
