import { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import {
  ArrowBendUpLeft,
  CopySimple,
  ShareNetwork,
  Trash,
  Plus,
} from '@ahub/ui/src/icons';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  SlideInDown,
} from 'react-native-reanimated';
import { GlassView } from './GlassView';
import { messageHaptics } from '../utils/haptics';
import type { Message } from '@ahub/shared/types';

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MessageContextMenuProps {
  message: Message;
  isOwn: boolean;
  onReaction: (emoji: string) => void;
  onReply: () => void;
  onCopy: () => void;
  onForward: () => void;
  onDelete: () => void;
  onClose: () => void;
}

interface MenuAction {
  key: string;
  label: string;
  icon: typeof ArrowBendUpLeft;
  onPress: () => void;
  destructive?: boolean;
  ownOnly?: boolean;
}

export function MessageContextMenu({
  message,
  isOwn,
  onReaction,
  onReply,
  onCopy,
  onForward,
  onDelete,
  onClose,
}: MessageContextMenuProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleReaction = useCallback(
    (emoji: string) => {
      messageHaptics.react();
      onReaction(emoji);
      onClose();
    },
    [onReaction, onClose]
  );

  const actions: MenuAction[] = [
    { key: 'reply', label: 'Responder', icon: ArrowBendUpLeft, onPress: onReply },
    { key: 'copy', label: 'Copiar', icon: CopySimple, onPress: onCopy },
    { key: 'forward', label: 'Encaminhar', icon: ShareNetwork, onPress: onForward },
    { key: 'delete', label: 'Apagar', icon: Trash, onPress: onDelete, destructive: true, ownOnly: true },
  ];

  const visibleActions = actions.filter((a) => !a.ownOnly || isOwn);

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={[
          styles.backdrop,
          { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)' },
        ]}
      />

      <Animated.View
        entering={ZoomIn.springify().damping(20).stiffness(200)}
        exiting={FadeOut.duration(120)}
        style={styles.menuContainer}
      >
        {/* Quick reactions row */}
        <GlassView variant="menu" borderRadius={9999}>
          <XStack paddingHorizontal="$2" paddingVertical="$1.5" gap="$0.5" alignItems="center">
            {QUICK_REACTIONS.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => handleReaction(emoji)}
                style={styles.emojiBtn}
              >
                <Text style={{ fontSize: 24 }}>{emoji}</Text>
              </Pressable>
            ))}
            <Pressable onPress={onClose} style={styles.emojiBtn}>
              <Icon icon={Plus} size="sm" color="secondary" />
            </Pressable>
          </XStack>
        </GlassView>

        {/* Action menu */}
        <Animated.View entering={SlideInDown.delay(80).duration(200)}>
          <GlassView variant="menu" borderRadius={14} style={{ marginTop: 8 }}>
            <YStack paddingVertical="$1">
              {visibleActions.map((action, i) => (
                <Pressable
                  key={action.key}
                  onPress={() => {
                    action.onPress();
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.actionRow,
                    pressed && {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                >
                  <XStack
                    alignItems="center"
                    gap="$2.5"
                    paddingHorizontal="$3"
                    paddingVertical="$2.5"
                  >
                    <Icon
                      icon={action.icon}
                      size="sm"
                      color={action.destructive ? '#EF4444' : isDark ? '#E5E7EB' : '#374151'}
                    />
                    <Text
                      size="sm"
                      style={action.destructive
                        ? { color: '#EF4444' }
                        : isDark ? { color: '#E5E7EB' } : undefined
                      }
                    >
                      {action.label}
                    </Text>
                  </XStack>
                  {i < visibleActions.length - 1 && (
                    <View
                      height={StyleSheet.hairlineWidth}
                      backgroundColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                      marginLeft={48}
                    />
                  )}
                </Pressable>
              ))}
            </YStack>
          </GlassView>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuContainer: {
    width: SCREEN_WIDTH * 0.72,
    maxWidth: 300,
  },
  emojiBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    borderRadius: 0,
  },
});
