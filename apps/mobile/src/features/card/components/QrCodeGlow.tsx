import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { QrCodeDisplay } from './QrCodeDisplay';
import { CardGlassView } from './CardGlassView';
import { useCardTheme } from '../hooks/useCardTheme';

interface QrCodeGlowProps {
  data: string;
  size?: number;
}

/**
 * QR code wrapped in a glass container with a subtle pulsing glow ring.
 * The glow indicates the QR is ready to be scanned.
 */
export function QrCodeGlow({ data, size = 130 }: QrCodeGlowProps) {
  const ct = useCardTheme();
  const glowOpacity = useSharedValue(0.3);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    const easing = Easing.inOut(Easing.ease);

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1500, easing }),
        withTiming(0.3, { duration: 1500, easing }),
      ),
      -1,
      false,
    );

    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1500, easing }),
        withTiming(1.0, { duration: 1500, easing }),
      ),
      -1,
      false,
    );
  }, [glowOpacity, glowScale]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <View style={styles.wrapper}>
      {/* Pulsing glow ring behind QR */}
      <Animated.View
        style={[
          styles.glowRing,
          { width: size + 24, height: size + 24, backgroundColor: ct.qrGlowColor },
          glowStyle,
        ]}
      />

      {/* Glass container */}
      <CardGlassView borderRadius={16} style={styles.glassContainer}>
        <View style={styles.qrWhiteBg}>
          <QrCodeDisplay data={data} size={size} />
        </View>
      </CardGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 20,
  },
  glassContainer: {
    padding: 4,
  },
  qrWhiteBg: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
  },
});
