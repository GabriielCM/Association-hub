import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { XStack } from 'tamagui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Icon } from '@ahub/ui';
import { Plus, ImageSquare, Camera, Microphone, File } from '@ahub/ui/src/icons';
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
  { key: 'audio', icon: Microphone, label: 'Audio' },
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
  const rotation = useSharedValue(0);
  const itemScales = ACTIONS.map(() => useSharedValue(0));

  useEffect(() => {
    rotation.value = withSpring(visible ? 1 : 0, MORPH_SPRING);
    itemScales.forEach((scale, i) => {
      scale.value = visible
        ? withDelay(i * FAN_OUT_STAGGER, withSpring(1, MORPH_SPRING))
        : withSpring(0, MORPH_SPRING);
    });
  }, [visible]);

  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 45}deg` }],
  }));

  const handlers: Record<string, () => void> = {
    gallery: onGallery,
    camera: onCamera,
    audio: onAudio,
    document: onDocument,
  };

  return (
    <XStack alignItems="center" gap="$1">
      <Pressable onPress={onToggle}>
        <Animated.View style={[styles.plusBtn, plusStyle]}>
          <Icon icon={Plus} size="lg" color="secondary" />
        </Animated.View>
      </Pressable>

      {visible && ACTIONS.map((action, i) => {
        const animStyle = useAnimatedStyle(() => ({
          transform: [{ scale: itemScales[i]!.value }],
          opacity: itemScales[i]!.value,
        }));

        return (
          <Animated.View key={action.key} style={animStyle}>
            <Pressable
              onPress={() => {
                handlers[action.key]?.();
                onToggle();
              }}
              style={styles.actionBtn}
            >
              <Icon icon={action.icon} size="sm" color="secondary" />
            </Pressable>
          </Animated.View>
        );
      })}
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
