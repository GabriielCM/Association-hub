import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useWalletTheme } from '../hooks/useWalletTheme';

interface ShimmerGlassSkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton loading placeholder with shimmer effect.
 * Adapts to light/dark theme via useWalletTheme.
 */
export function ShimmerGlassSkeleton({
  width,
  height,
  borderRadius = 12,
  style,
}: ShimmerGlassSkeletonProps) {
  const translateX = useSharedValue(-200);
  const t = useWalletTheme();

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(400, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: t.shimmerBg,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: t.shimmerBorder,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 200,
          },
          shimmerStyle,
        ]}
      >
        <LinearGradient
          colors={t.shimmerGradient as unknown as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

/**
 * Pre-composed skeleton layout for the wallet home screen.
 */
export function WalletHomeSkeleton() {
  return (
    <View style={{ gap: 20 }}>
      <ShimmerGlassSkeleton width="100%" height={180} borderRadius={20} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <ShimmerGlassSkeleton width={64} height={84} borderRadius={32} />
        <ShimmerGlassSkeleton width={64} height={84} borderRadius={32} />
        <ShimmerGlassSkeleton width={64} height={84} borderRadius={32} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <ShimmerGlassSkeleton width="31%" height={80} borderRadius={16} />
        <ShimmerGlassSkeleton width="31%" height={80} borderRadius={16} />
        <ShimmerGlassSkeleton width="31%" height={80} borderRadius={16} />
      </View>
      <ShimmerGlassSkeleton width="100%" height={90} borderRadius={20} />
      <ShimmerGlassSkeleton width="100%" height={200} borderRadius={20} />
    </View>
  );
}
