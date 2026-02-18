import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Eye from 'phosphor-react-native/src/icons/Eye';
import EyeSlash from 'phosphor-react-native/src/icons/EyeSlash';

interface EyeToggleProps {
  hidden: boolean;
  onToggle: () => void;
  size?: number;
  color?: string;
}

/**
 * Eye open/closed toggle button for balance visibility.
 * Includes haptic feedback and spring scale animation on press.
 */
export function EyeToggle({
  hidden,
  onToggle,
  size = 22,
  color = 'rgba(255, 255, 255, 0.6)',
}: EyeToggleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.85, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    Haptics.selectionAsync();
    onToggle();
  };

  const IconComponent = hidden ? EyeSlash : Eye;

  return (
    <Pressable onPress={handlePress} hitSlop={12}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <IconComponent size={size} color={color} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
});
