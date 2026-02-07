import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  isFlipped?: boolean;
  onFlip?: () => void;
}

export function FlipCard({ front, back, isFlipped, onFlip }: FlipCardProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 48;
  const flipProgress = useSharedValue(isFlipped ? 1 : 0);

  const handleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flipProgress.value = withTiming(flipProgress.value === 0 ? 1 : 0, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    });
    onFlip?.();
  };

  const frontAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      {
        rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg`,
      },
    ],
    backfaceVisibility: 'hidden' as const,
  }));

  const backAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      {
        rotateY: `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg`,
      },
    ],
    backfaceVisibility: 'hidden' as const,
  }));

  return (
    <Pressable onPress={handleFlip} style={[styles.container, { width: cardWidth }]}>
      <Animated.View style={[styles.face, frontAnimStyle, { width: cardWidth }]}>
        {front}
      </Animated.View>
      <Animated.View
        style={[styles.face, styles.backFace, backAnimStyle, { width: cardWidth }]}
      >
        {back}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    height: 480,
  },
  face: {
    height: 480,
    borderRadius: 16,
    overflow: 'hidden',
  },
  backFace: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
