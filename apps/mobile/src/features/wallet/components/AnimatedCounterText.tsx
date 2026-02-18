import { useEffect } from 'react';
import { TextInput, type TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedCounterTextProps {
  value: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

/**
 * Animated counter text that smoothly counts from 0 to the target value.
 * Uses Reanimated's useAnimatedProps with TextInput for native-thread animation.
 */
export function AnimatedCounterText({
  value,
  style,
  prefix = '',
  suffix = '',
  duration = 800,
}: AnimatedCounterTextProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration]);

  const animatedText = useDerivedValue(() => {
    const rounded = Math.round(animatedValue.value);
    const formatted = rounded.toLocaleString('pt-BR');
    return `${prefix}${formatted}${suffix}`;
  });

  const animatedProps = useAnimatedProps(() => ({
    text: animatedText.value,
    defaultValue: animatedText.value,
  }));

  return (
    <AnimatedTextInput
      animatedProps={animatedProps}
      editable={false}
      underlineColorAndroid="transparent"
      style={[
        {
          fontSize: 42,
          fontWeight: '700',
          padding: 0,
          textAlign: 'center',
        },
        style,
      ]}
    />
  );
}
