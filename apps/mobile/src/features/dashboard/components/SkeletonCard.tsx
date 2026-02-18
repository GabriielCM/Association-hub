import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useDashboardTheme } from '../hooks/useDashboardTheme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface SkeletonBlockProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonBlock({
  width,
  height,
  borderRadius = 8,
  style,
}: SkeletonBlockProps) {
  const dt = useDashboardTheme();
  const translateX = useSharedValue(-200);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(200, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: dt.skeletonBg,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <AnimatedLinearGradient
        colors={[...dt.skeletonShimmer]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFill, { width: 200 }, animatedStyle]}
      />
    </View>
  );
}
