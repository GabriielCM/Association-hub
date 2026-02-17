import { useEffect } from 'react';
import { Gyroscope } from 'expo-sensors';
import {
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

interface GyroscopeData {
  rotateX: SharedValue<number>;
  rotateY: SharedValue<number>;
}

const SPRING_CONFIG = { damping: 20, stiffness: 150 };
const CLAMP = 0.5;
const SENSITIVITY = 0.3;

/**
 * Provides gyroscope-driven rotation values for the card shine effect.
 * Returns static zero values when gyroscope is unavailable.
 */
export function useGyroscope(enabled = true): GyroscopeData {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  useEffect(() => {
    if (!enabled) return;

    let subscription: ReturnType<typeof Gyroscope.addListener> | null = null;

    const start = async () => {
      try {
        const available = await Gyroscope.isAvailableAsync();
        if (!available) return;

        Gyroscope.setUpdateInterval(32); // ~30fps, saves battery

        subscription = Gyroscope.addListener(({ x, y }) => {
          const clampedX = Math.max(-CLAMP, Math.min(CLAMP, x * SENSITIVITY));
          const clampedY = Math.max(-CLAMP, Math.min(CLAMP, y * SENSITIVITY));

          rotateX.value = withSpring(clampedX, SPRING_CONFIG);
          rotateY.value = withSpring(clampedY, SPRING_CONFIG);
        });
      } catch {
        // Gyroscope not available — silently degrade
      }
    };

    start();

    return () => {
      subscription?.remove();
    };
  }, [enabled, rotateX, rotateY]);

  return { rotateX, rotateY };
}
