import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Icon } from '@ahub/ui';
import { Sun } from '@ahub/ui/src/icons';

/**
 * Small sun icon that fades out after 2 seconds.
 * Indicates that screen brightness was automatically increased.
 */
export function BrightnessIndicator() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(2000, withTiming(0, { duration: 500 }));
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animStyle]} pointerEvents="none">
      <Icon icon={Sun} size="sm" color="#FCD34D" weight="fill" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
});
