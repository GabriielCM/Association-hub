import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { Icon } from '@ahub/ui';
import { Microphone, PaperPlaneRight } from '@ahub/ui/src/icons';
import { colors } from '@ahub/ui/themes';
import { MORPH_SPRING } from '../utils/animations';
import { messageHaptics } from '../utils/haptics';

interface MorphSendButtonProps {
  hasText: boolean;
  onSend: () => void;
  onMicPress: () => void;
  disabled?: boolean;
}

export function MorphSendButton({
  hasText,
  onSend,
  onMicPress,
  disabled = false,
}: MorphSendButtonProps) {
  const progress = useSharedValue(hasText ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(hasText ? 1 : 0, MORPH_SPRING);
  }, [hasText, progress]);

  const containerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#6B7280', colors.primary],
    );
    return { backgroundColor };
  });

  const micStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { scale: 1 - progress.value * 0.5 },
    ],
    position: 'absolute' as const,
  }));

  const sendStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: 0.5 + progress.value * 0.5 },
      { rotate: `${(1 - progress.value) * -45}deg` },
    ],
    position: 'absolute' as const,
  }));

  const handlePress = () => {
    if (hasText) {
      messageHaptics.send();
      onSend();
    } else {
      onMicPress();
    }
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View style={[styles.button, containerStyle]}>
        <Animated.View style={micStyle}>
          <Icon icon={Microphone} size="sm" color="#FFFFFF" />
        </Animated.View>
        <Animated.View style={sendStyle}>
          <Icon icon={PaperPlaneRight} size="sm" color="#FFFFFF" weight="fill" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
