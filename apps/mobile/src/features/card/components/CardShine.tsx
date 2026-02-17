import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface CardShineProps {
  rotateX: SharedValue<number>;
  rotateY: SharedValue<number>;
  width: number;
  height: number;
}

/**
 * Translucent light reflection band that moves with gyroscope data.
 * Creates a subtle shine effect when the user tilts the phone.
 */
export function CardShine({ rotateX, rotateY, width, height }: CardShineProps) {
  const animStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      rotateY.value,
      [-0.5, 0.5],
      [-width * 0.6, width * 0.6],
    );
    const translateY = interpolate(
      rotateX.value,
      [-0.5, 0.5],
      [-height * 0.3, height * 0.3],
    );

    return {
      transform: [{ translateX }, { translateY }, { rotate: '35deg' }],
    };
  });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.overflow]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.shineBar,
          { width: width * 0.4, height: height * 1.5 },
          animStyle,
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255,255,255,0.06)',
            'rgba(255,255,255,0.12)',
            'rgba(255,255,255,0.06)',
            'transparent',
          ]}
          style={styles.fill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overflow: {
    overflow: 'hidden',
  },
  shineBar: {
    position: 'absolute',
    top: -50,
    left: 0,
  },
  fill: {
    flex: 1,
  },
});
