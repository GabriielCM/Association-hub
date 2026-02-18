import { useEffect, useCallback } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { CheckCircle } from '@ahub/ui/src/icons';
import { formatPoints } from '@ahub/shared/utils';
import { useCelebration, usePointsStore } from '@/stores/points.store';
import { useWalletTheme } from '@/features/wallet/hooks/useWalletTheme';
import * as Haptics from 'expo-haptics';

const AUTO_DISMISS_MS = 3000;

export function CelebrationOverlay() {
  const celebration = useCelebration();
  const { hideCelebration } = usePointsStore();
  const t = useWalletTheme();

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkScale = useSharedValue(0);

  const dismiss = useCallback(() => {
    scale.value = withTiming(0, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) runOnJS(hideCelebration)();
    });
  }, [hideCelebration, scale, opacity]);

  useEffect(() => {
    if (celebration.visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Entrance animations
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 8, stiffness: 100 });
      checkScale.value = withDelay(
        400,
        withSpring(1, { damping: 6, stiffness: 120 }),
      );

      const timer = setTimeout(() => {
        dismiss();
      }, AUTO_DISMISS_MS);

      return () => clearTimeout(timer);
    } else {
      scale.value = 0;
      opacity.value = 0;
      checkScale.value = 0;
    }
  }, [celebration.visible]);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  if (!celebration.visible) return null;

  return (
    <Modal transparent animationType="none" visible={celebration.visible}>
      <Pressable style={[styles.overlay, { backgroundColor: t.overlayBg }]} onPress={dismiss}>
        <Animated.View
          style={[
            styles.content,
            {
              backgroundColor: t.glassBg,
              borderColor: t.successBorder,
            },
            t.cardShadow,
            contentStyle,
          ]}
        >
          <YStack alignItems="center" gap={20}>
            {/* Checkmark Circle */}
            <Animated.View
              style={[
                styles.checkCircle,
                { backgroundColor: t.celebrationCheckBg, borderWidth: 1, borderColor: t.successBorder },
                checkStyle,
              ]}
            >
              <CheckCircle size={48} color={t.successIcon} weight="fill" />
            </Animated.View>

            <YStack alignItems="center" gap={8}>
              <Text style={[styles.title, { color: t.textPrimary }]}>Transferencia realizada!</Text>
              <Text style={[styles.amount, { color: t.success }]}>
                +{formatPoints(celebration.points)} pts
              </Text>
            </YStack>

            {celebration.eventName && (
              <Text style={[styles.eventName, { color: t.textSecondary }]}>
                {celebration.eventName}
              </Text>
            )}

            <Text style={[styles.dismiss, { color: t.textTertiary }]}>Toque para fechar</Text>
          </YStack>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 40,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 280,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 44,
  },
  eventName: {
    fontSize: 15,
    textAlign: 'center',
  },
  dismiss: {
    fontSize: 13,
    marginTop: 8,
  },
});
