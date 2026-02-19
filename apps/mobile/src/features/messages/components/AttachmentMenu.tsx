import { useEffect } from 'react';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import { XStack } from 'tamagui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Icon } from '@ahub/ui';
import { Plus, ImageSquare, Camera, File } from '@ahub/ui/src/icons';
import MusicNote from 'phosphor-react-native/src/icons/MusicNote';
import { MORPH_SPRING, FAN_OUT_STAGGER } from '../utils/animations';

interface AttachmentMenuProps {
  visible: boolean;
  onToggle: () => void;
  onGallery: () => void;
  onCamera: () => void;
  onAudio: () => void;
  onDocument: () => void;
}

const ACTIONS = [
  { key: 'gallery', icon: ImageSquare, label: 'Galeria' },
  { key: 'camera', icon: Camera, label: 'Camera' },
  { key: 'audio', icon: MusicNote, label: 'Audio' },
  { key: 'document', icon: File, label: 'Arquivo' },
] as const;

export function AttachmentMenu({
  visible,
  onToggle,
  onGallery,
  onCamera,
  onAudio,
  onDocument,
}: AttachmentMenuProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? 'rgba(255,255,255,0.6)' : 'secondary';

  const rotation = useSharedValue(0);

  // All hooks called unconditionally (one per fixed action)
  const scale0 = useSharedValue(0);
  const scale1 = useSharedValue(0);
  const scale2 = useSharedValue(0);
  const scale3 = useSharedValue(0);
  const scales = [scale0, scale1, scale2, scale3];

  useEffect(() => {
    rotation.value = withSpring(visible ? 1 : 0, MORPH_SPRING);
    scales.forEach((scale, i) => {
      scale.value = visible
        ? withDelay(i * FAN_OUT_STAGGER, withSpring(1, MORPH_SPRING))
        : withSpring(0, MORPH_SPRING);
    });
  }, [visible]);

  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 45}deg` }],
  }));

  // All animated styles called unconditionally (hooks at top level)
  const animStyle0 = useAnimatedStyle(() => ({
    transform: [{ scale: scale0.value }],
    opacity: scale0.value,
  }));
  const animStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: scale1.value,
  }));
  const animStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: scale2.value,
  }));
  const animStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
    opacity: scale3.value,
  }));
  const animStyles = [animStyle0, animStyle1, animStyle2, animStyle3];

  const handlers: Record<string, () => void> = {
    gallery: onGallery,
    camera: onCamera,
    audio: onAudio,
    document: onDocument,
  };

  return (
    <XStack alignItems="center" gap={2} flexShrink={0}>
      <Pressable onPress={onToggle}>
        <Animated.View style={[styles.plusBtn, plusStyle]}>
          <Icon icon={Plus} size="lg" color={iconColor} />
        </Animated.View>
      </Pressable>

      {visible && ACTIONS.map((action, i) => (
        <Animated.View key={action.key} style={animStyles[i]}>
          <Pressable
            onPress={() => {
              handlers[action.key]?.();
              onToggle();
            }}
            style={styles.actionBtn}
          >
            <Icon icon={action.icon} size="sm" color={iconColor} />
          </Pressable>
        </Animated.View>
      ))}
    </XStack>
  );
}

const styles = StyleSheet.create({
  plusBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
