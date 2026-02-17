import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  isFlipped?: boolean;
  onFlip?: () => void;
}

const FLIP_DURATION = 500;
const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 300;
const ENTRY_SPRING = { damping: 18, stiffness: 120 };

export function FlipCard({ front, back, isFlipped, onFlip }: FlipCardProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 48;
  const flipProgress = useSharedValue(isFlipped ? 1 : 0);

  // Entry animation values (wallet slide-up effect)
  const entryTranslateY = useSharedValue(200);
  const entryScale = useSharedValue(0.85);
  const entryOpacity = useSharedValue(0);

  // Mount: wallet slide-up + scale animation
  useEffect(() => {
    entryOpacity.value = withTiming(1, { duration: 300 });
    entryTranslateY.value = withSpring(0, ENTRY_SPRING);
    entryScale.value = withSpring(1, ENTRY_SPRING);
  }, [entryOpacity, entryTranslateY, entryScale]);

  const doFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flipProgress.value = withTiming(flipProgress.value === 0 ? 1 : 0, {
      duration: FLIP_DURATION,
      easing: Easing.inOut(Easing.ease),
    });
    onFlip?.();
  };

  // Tap gesture — single tap flips
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(doFlip)();
  });

  // Pan gesture — horizontal swipe flips
  const panGesture = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .onEnd((event) => {
      if (
        Math.abs(event.velocityX) > VELOCITY_THRESHOLD ||
        Math.abs(event.translationX) > SWIPE_THRESHOLD
      ) {
        runOnJS(doFlip)();
      }
    });

  // Race: first gesture to activate wins
  const composedGesture = Gesture.Race(tapGesture, panGesture);

  // Entry animation style
  const entryStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: entryTranslateY.value },
      { scale: entryScale.value },
    ],
    opacity: entryOpacity.value,
  }));

  // Front face rotation
  const frontAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      {
        rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg`,
      },
    ],
    backfaceVisibility: 'hidden' as const,
  }));

  // Back face rotation (starts at 180°)
  const backAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      {
        rotateY: `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg`,
      },
    ],
    backfaceVisibility: 'hidden' as const,
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[styles.container, { width: cardWidth }, entryStyle]}
      >
        <Animated.View
          style={[styles.face, frontAnimStyle, { width: cardWidth }]}
        >
          {front}
        </Animated.View>
        <Animated.View
          style={[styles.face, styles.backFace, backAnimStyle, { width: cardWidth }]}
        >
          {back}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    height: 540,
  },
  face: {
    height: 540,
    borderRadius: 16,
    overflow: 'hidden',
  },
  backFace: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
