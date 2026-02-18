import { useCallback, memo } from 'react';
import { Pressable, useColorScheme } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text, Avatar, Icon } from '@ahub/ui';
import { Check, Checks, CircleNotch, Camera, Microphone, ArrowBendUpLeft } from '@ahub/ui/src/icons';
import type { Message, MessageStatus } from '@ahub/shared/types';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { GlassView } from './GlassView';
import { ImageMessage } from './ImageMessage';
import { AudioMessage } from './AudioMessage';
import { LinkPreview } from './LinkPreview';
import { messageGlass } from '@ahub/ui/themes';
import { formatMessageTime } from '../utils/dateFormatters';
import { CLUSTER_MESSAGE_GAP, NORMAL_MESSAGE_GAP, SWIPE_REPLY_THRESHOLD, SPRING_CONFIG } from '../utils/animations';
import { messageHaptics } from '../utils/haptics';
import { extractUrl } from '../utils/ogMetadata';

const STATUS_ICON_MAP: Record<MessageStatus, { icon: PhosphorIcon; readColor?: string }> = {
  SENDING: { icon: CircleNotch },
  SENT: { icon: Check },
  DELIVERED: { icon: Checks },
  READ: { icon: Checks, readColor: '#60A5FA' },
};

const SENDER_COLORS = [
  '#E53E3E', '#DD6B20', '#D69E2E', '#38A169',
  '#319795', '#3182CE', '#805AD5', '#D53F8C',
];

function getSenderColor(senderId: string): string {
  let hash = 0;
  for (const ch of senderId) {
    hash = ((hash << 5) - hash) + ch.charCodeAt(0);
  }
  return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length] ?? '#3182CE';
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
  isGroup?: boolean;
  isFirstInCluster?: boolean;
  isLastInCluster?: boolean;
  onLongPress?: (message: Message) => void;
  onReaction?: (messageId: string) => void;
  onReplyPress?: (message: Message) => void;
  onSenderPress?: (senderId: string) => void;
  highlightText?: string;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isOwn,
  showSender = false,
  isGroup = false,
  isFirstInCluster = true,
  isLastInCluster = true,
  onLongPress,
  onReaction,
  onReplyPress,
  onSenderPress,
  highlightText,
}: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // --- Swipe to reply ---
  const translateX = useSharedValue(0);
  const hasTriggeredHaptic = useSharedValue(false);

  const triggerReply = useCallback(() => {
    onReplyPress?.(message);
  }, [message, onReplyPress]);

  const triggerSwipeHaptic = useCallback(() => {
    messageHaptics.swipeReply();
  }, []);

  const panGesture = Gesture.Pan()
    .activeOffsetX(15)
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      // Only allow swipe right (positive direction)
      const tx = Math.max(0, Math.min(e.translationX, SWIPE_REPLY_THRESHOLD + 20));
      translateX.value = tx;

      if (tx >= SWIPE_REPLY_THRESHOLD && !hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = true;
        runOnJS(triggerSwipeHaptic)();
      } else if (tx < SWIPE_REPLY_THRESHOLD) {
        hasTriggeredHaptic.value = false;
      }
    })
    .onEnd(() => {
      if (translateX.value >= SWIPE_REPLY_THRESHOLD) {
        runOnJS(triggerReply)();
      }
      translateX.value = withSpring(0, SPRING_CONFIG);
      hasTriggeredHaptic.value = false;
    });

  const swipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const replyIconStyle = useAnimatedStyle(() => {
    const progress = Math.min(translateX.value / SWIPE_REPLY_THRESHOLD, 1);
    return {
      opacity: progress,
      transform: [{ scale: 0.5 + progress * 0.5 }],
    };
  });

  // --- Long press with haptic ---
  const handleLongPress = useCallback(() => {
    messageHaptics.longPress();
    onLongPress?.(message);
  }, [message, onLongPress]);

  const isDeleted = !!message.deletedAt;

  // Dynamic border radius for clusters
  const bubbleRadius = 16;
  const tailRadius = 4;

  const borderTopRightRadius = isOwn
    ? (isFirstInCluster ? bubbleRadius : tailRadius)
    : bubbleRadius;
  const borderTopLeftRadius = isOwn
    ? bubbleRadius
    : (isFirstInCluster ? bubbleRadius : tailRadius);
  const borderBottomRightRadius = isOwn
    ? (isLastInCluster ? tailRadius : bubbleRadius)
    : bubbleRadius;
  const borderBottomLeftRadius = isOwn
    ? bubbleRadius
    : (isLastInCluster ? tailRadius : bubbleRadius);

  // Spacing: tight cluster gap or normal gap
  const paddingTop = isFirstInCluster ? NORMAL_MESSAGE_GAP : CLUSTER_MESSAGE_GAP;

  // Text colors for glass bubbles
  const textColor = isOwn ? messageGlass.bubbleOwnText : undefined;
  const textSecondaryColor = isOwn ? messageGlass.bubbleOwnTextSecondary : undefined;
  const textTimeColor = isOwn ? messageGlass.bubbleOwnTextTime : undefined;

  // Highlight matching text if search is active
  const renderContent = (content: string) => {
    if (!highlightText || !content) {
      return (
        <Text style={isOwn ? { color: textColor } : undefined} size="sm">
          {content}
        </Text>
      );
    }

    const regex = new RegExp(`(${highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = content.split(regex);

    return (
      <Text size="sm" style={isOwn ? { color: textColor } : undefined}>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <Text
              key={i}
              size="sm"
              style={{
                backgroundColor: 'rgba(255, 213, 0, 0.4)',
                color: isOwn ? textColor : undefined,
              }}
            >
              {part}
            </Text>
          ) : (
            part
          ),
        )}
      </Text>
    );
  };

  return (
    <YStack
      alignItems={isOwn ? 'flex-end' : 'flex-start'}
      paddingHorizontal="$3"
      style={{ paddingTop }}
    >
      {/* Sender name for group chats */}
      {showSender && !isOwn && (
        <Pressable onPress={() => onSenderPress?.(message.sender.id)}>
          <XStack alignItems="center" gap="$1" paddingLeft="$1" marginBottom="$0.5">
            <Avatar
              src={message.sender.avatarUrl}
              name={message.sender.name}
              size="xs"
            />
            <Text
              size="xs"
              weight="semibold"
              style={isGroup ? { color: getSenderColor(message.sender.id) } : undefined}
              color={isGroup ? undefined : 'primary'}
            >
              {message.sender.name.split(' ')[0]}
            </Text>
          </XStack>
        </Pressable>
      )}

      {/* Swipe to reply wrapper */}
      <View style={{ maxWidth: '80%', position: 'relative' }}>
        {/* Reply icon indicator (behind the bubble) */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: -32,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              width: 28,
            },
            replyIconStyle,
          ]}
        >
          <View
            width={24}
            height={24}
            borderRadius="$full"
            backgroundColor={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}
            alignItems="center"
            justifyContent="center"
          >
            <Icon icon={ArrowBendUpLeft} size={14} color="secondary" />
          </View>
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={swipeStyle}>
            <Pressable
              onLongPress={handleLongPress}
              delayLongPress={400}
            >
              <GlassView
                variant={isOwn ? 'bubble-own' : 'bubble-other'}
                borderRadius={0}
                style={{
                  borderTopRightRadius,
                  borderTopLeftRadius,
                  borderBottomRightRadius,
                  borderBottomLeftRadius,
                  opacity: isDeleted ? 0.5 : 1,
                }}
              >
                <YStack padding="$2" gap="$1">
                  {/* Reply preview */}
                  {message.replyTo && (
                    <Pressable onPress={() => onReplyPress?.(message)}>
                      <View
                        borderLeftWidth={2}
                        borderLeftColor={isOwn ? 'rgba(255,255,255,0.5)' : '$primary'}
                        paddingLeft="$1.5"
                        marginBottom="$0.5"
                      >
                        <Text
                          size="xs"
                          weight="semibold"
                          color={isOwn ? undefined : 'primary'}
                          style={isOwn ? { color: messageGlass.bubbleOwnText } : undefined}
                          numberOfLines={1}
                        >
                          {message.replyTo.senderName}
                        </Text>
                        {message.replyTo.contentType === 'IMAGE' ? (
                          <XStack alignItems="center" gap="$1">
                            <Icon icon={Camera} size="sm" color={textSecondaryColor ?? 'secondary'} />
                            <Text
                              size="xs"
                              color={isOwn ? undefined : 'secondary'}
                              style={isOwn ? { color: textSecondaryColor } : undefined}
                              numberOfLines={1}
                            >
                              Foto
                            </Text>
                          </XStack>
                        ) : message.replyTo.contentType === 'AUDIO' ? (
                          <XStack alignItems="center" gap="$1">
                            <Icon icon={Microphone} size="sm" color={textSecondaryColor ?? 'secondary'} />
                            <Text
                              size="xs"
                              color={isOwn ? undefined : 'secondary'}
                              style={isOwn ? { color: textSecondaryColor } : undefined}
                              numberOfLines={1}
                            >
                              Audio
                            </Text>
                          </XStack>
                        ) : (
                          <Text
                            size="xs"
                            color={isOwn ? undefined : 'secondary'}
                            style={isOwn ? { color: textSecondaryColor } : undefined}
                            numberOfLines={1}
                          >
                            {message.replyTo.content}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  )}

                  {/* Content */}
                  {isDeleted ? (
                    <Text
                      color={isOwn ? undefined : 'secondary'}
                      size="sm"
                      style={
                        isOwn
                          ? { fontStyle: 'italic', color: textSecondaryColor }
                          : { fontStyle: 'italic' }
                      }
                    >
                      Mensagem apagada
                    </Text>
                  ) : message.contentType === 'IMAGE' ? (
                    <ImageMessage mediaUrl={message.mediaUrl!} />
                  ) : message.contentType === 'AUDIO' ? (
                    <AudioMessage
                      mediaUrl={message.mediaUrl!}
                      duration={message.mediaDuration}
                      isOwn={isOwn}
                    />
                  ) : (
                    <>
                      {renderContent(message.content)}
                      {/* Link preview for text messages containing URLs */}
                      {extractUrl(message.content) && (
                        <LinkPreview text={message.content} isOwn={isOwn} />
                      )}
                    </>
                  )}

                  {/* Footer: time + status - only shown on last message of cluster */}
                  {isLastInCluster && (
                    <XStack alignItems="center" justifyContent="flex-end" gap="$1">
                      <Text
                        size="xs"
                        color={isOwn ? undefined : 'secondary'}
                        style={{
                          fontSize: 10,
                          fontWeight: '300',
                          lineHeight: 12,
                          ...(isOwn ? { color: textTimeColor } : {}),
                        }}
                      >
                        {formatMessageTime(message.createdAt)}
                      </Text>
                      {isOwn && (() => {
                        const statusConfig = STATUS_ICON_MAP[message.status];
                        const iconColor = statusConfig.readColor
                          ? statusConfig.readColor
                          : textTimeColor ?? undefined;
                        return (
                          <Icon
                            icon={statusConfig.icon}
                            size={12}
                            color={iconColor ?? 'secondary'}
                          />
                        );
                      })()}
                    </XStack>
                  )}
                </YStack>
              </GlassView>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Reactions */}
      {message.reactions.length > 0 && (
        <XStack gap="$0.5" marginTop="$0.5" flexWrap="wrap">
          {message.reactions.map((reaction) => (
            <Pressable
              key={reaction.emoji}
              onPress={() => {
                messageHaptics.react();
                onReaction?.(message.id);
              }}
            >
              <XStack
                alignItems="center"
                gap="$0.5"
                paddingHorizontal="$1"
                paddingVertical="$0.5"
                borderRadius="$full"
                backgroundColor={
                  reaction.hasReacted
                    ? 'rgba(139, 92, 246, 0.15)'
                    : isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : '$backgroundHover'
                }
                borderWidth={reaction.hasReacted ? 1 : 0}
                borderColor="$primary"
              >
                <Text style={{ fontSize: 12 }}>{reaction.emoji}</Text>
                {reaction.count > 1 && (
                  <Text size="xs" color="secondary" style={{ fontSize: 10 }}>
                    {reaction.count}
                  </Text>
                )}
              </XStack>
            </Pressable>
          ))}
        </XStack>
      )}
    </YStack>
  );
}, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.status === next.message.status &&
    prev.message.reactions.length === next.message.reactions.length &&
    prev.isOwn === next.isOwn &&
    prev.isFirstInCluster === next.isFirstInCluster &&
    prev.isLastInCluster === next.isLastInCluster &&
    prev.showSender === next.showSender &&
    prev.highlightText === next.highlightText &&
    !prev.message.deletedAt === !next.message.deletedAt
  );
});
