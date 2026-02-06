import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';

import { Text, Heading } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import { useCelebration, usePointsStore } from '@/stores/points.store';

const AUTO_DISMISS_MS = 3000;

export function CelebrationOverlay() {
  const celebration = useCelebration();
  const { hideCelebration } = usePointsStore();

  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (celebration.visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 8,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        dismiss();
      }, AUTO_DISMISS_MS);

      return () => clearTimeout(timer);
    } else {
      scale.setValue(0);
      opacity.setValue(0);
    }
  }, [celebration.visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideCelebration();
    });
  };

  if (!celebration.visible) return null;

  return (
    <Modal transparent animationType="none" visible={celebration.visible}>
      <Pressable style={styles.overlay} onPress={dismiss}>
        <Animated.View
          style={[
            styles.content,
            { transform: [{ scale }], opacity },
          ]}
        >
          <YStack alignItems="center" gap="$3">
            <Text size="2xl">🎉</Text>
            <Heading level={2} color="accent" align="center">
              +{formatPoints(celebration.points)} pts
            </Heading>
            {celebration.eventName && (
              <Text color="secondary" size="lg" align="center">
                {celebration.eventName}
              </Text>
            )}
            <Text color="secondary" size="sm">
              Toque para fechar
            </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    padding: 40,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    minWidth: 250,
  },
});
