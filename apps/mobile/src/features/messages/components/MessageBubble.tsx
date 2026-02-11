import { useCallback, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text, Avatar } from '@ahub/ui';
import type { Message, MessageStatus } from '@ahub/shared/types';
import { ImageMessage } from './ImageMessage';
import { AudioMessage } from './AudioMessage';

const STATUS_ICONS: Record<MessageStatus, string> = {
  SENDING: '○',
  SENT: '✓',
  DELIVERED: '✓✓',
  READ: '✓✓',
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

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
  isGroup?: boolean;
  onLongPress?: (message: Message) => void;
  onReaction?: (messageId: string) => void;
  onReplyPress?: (message: Message) => void;
  onSenderPress?: (senderId: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showSender = false,
  isGroup = false,
  onLongPress,
  onReaction,
  onReplyPress,
  onSenderPress,
}: MessageBubbleProps) {
  const handleLongPress = useCallback(() => {
    onLongPress?.(message);
  }, [message, onLongPress]);

  const isDeleted = !!message.deletedAt;

  return (
    <YStack
      alignItems={isOwn ? 'flex-end' : 'flex-start'}
      paddingHorizontal="$3"
      paddingVertical="$0.5"
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

      <Pressable
        onLongPress={handleLongPress}
        style={{ maxWidth: '80%' }}
      >
        <YStack
          backgroundColor={isOwn ? '$primary' : '$backgroundHover'}
          borderRadius="$lg"
          borderTopRightRadius={isOwn ? '$sm' : '$lg'}
          borderTopLeftRadius={isOwn ? '$lg' : '$sm'}
          padding="$2"
          gap="$1"
          opacity={isDeleted ? 0.5 : 1}
        >
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
                  color={isOwn ? 'white' : 'primary'}
                  numberOfLines={1}
                >
                  {message.replyTo.senderName}
                </Text>
                <Text
                  size="xs"
                  color={isOwn ? 'rgba(255,255,255,0.7)' : 'secondary'}
                  numberOfLines={1}
                >
                  {message.replyTo.contentType === 'IMAGE'
                    ? '📷 Foto'
                    : message.replyTo.contentType === 'AUDIO'
                      ? '🎤 Áudio'
                      : message.replyTo.content}
                </Text>
              </View>
            </Pressable>
          )}

          {/* Content */}
          {isDeleted ? (
            <Text
              color={isOwn ? 'rgba(255,255,255,0.7)' : 'secondary'}
              size="sm"
              style={{ fontStyle: 'italic' }}
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
            <Text
              color={isOwn ? 'white' : undefined}
              size="sm"
            >
              {message.content}
            </Text>
          )}

          {/* Footer: time + status */}
          <XStack alignItems="center" justifyContent="flex-end" gap="$1">
            <Text
              size="xs"
              color={isOwn ? 'rgba(255,255,255,0.6)' : 'secondary'}
              style={{ fontSize: 10 }}
            >
              {formatTime(message.createdAt)}
            </Text>
            {isOwn && (
              <Text
                size="xs"
                color={
                  message.status === 'READ'
                    ? '#60A5FA'
                    : isOwn
                      ? 'rgba(255,255,255,0.6)'
                      : 'secondary'
                }
                style={{ fontSize: 10 }}
              >
                {STATUS_ICONS[message.status]}
              </Text>
            )}
          </XStack>
        </YStack>
      </Pressable>

      {/* Reactions */}
      {message.reactions.length > 0 && (
        <XStack gap="$0.5" marginTop="$0.5" flexWrap="wrap">
          {message.reactions.map((reaction) => (
            <Pressable
              key={reaction.emoji}
              onPress={() => onReaction?.(message.id)}
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
}
