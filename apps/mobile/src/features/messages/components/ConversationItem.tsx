import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text, Avatar } from '@ahub/ui';
import { router } from 'expo-router';
import type { Conversation } from '@ahub/shared/types';
import { GroupAvatar } from './GroupAvatar';
import { OnlineStatus } from './OnlineStatus';

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (date >= today) {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const yesterday = new Date(today.getTime() - 86400000);
  if (date >= yesterday) return 'Ontem';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function getPreview(conversation: Conversation): string {
  if (!conversation.lastMessage) return 'Nenhuma mensagem';

  const prefix =
    conversation.type === 'GROUP' && conversation.lastMessage.senderName
      ? `${conversation.lastMessage.senderName.split(' ')[0]}: `
      : '';

  switch (conversation.lastMessage.contentType) {
    case 'IMAGE':
      return `${prefix}📷 Foto`;
    case 'AUDIO':
      return `${prefix}🎤 Áudio`;
    default:
      return `${prefix}${conversation.lastMessage.content}`;
  }
}

function getDisplayName(conversation: Conversation, currentUserId?: string): string {
  if (conversation.type === 'GROUP' && conversation.group) {
    return conversation.group.name;
  }
  const other = conversation.participants.find((p) => p.id !== currentUserId);
  return other?.name ?? 'Conversa';
}

interface PresenceInfo {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

interface TypingUser {
  id: string;
  name: string;
}

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId?: string | undefined;
  presenceMap?: Map<string, PresenceInfo> | undefined;
  typingUsers?: TypingUser[] | undefined;
  recordingUsers?: TypingUser[] | undefined;
}

export function ConversationItem({
  conversation,
  currentUserId,
  presenceMap,
  typingUsers,
  recordingUsers,
}: ConversationItemProps) {
  const handlePress = useCallback(() => {
    router.push({
      pathname: '/messages/[conversationId]',
      params: { conversationId: conversation.id },
    } as never);
  }, [conversation.id]);

  const handleAvatarPress = useCallback(() => {
    if (conversation.type === 'GROUP') {
      router.push({
        pathname: '/messages/[conversationId]/group',
        params: { conversationId: conversation.id },
      } as never);
    } else {
      router.push({
        pathname: '/messages/[conversationId]/contact',
        params: { conversationId: conversation.id },
      } as never);
    }
  }, [conversation.id, conversation.type]);

  const displayName = getDisplayName(conversation, currentUserId);
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUserId
  );

  // Online status: prefer real-time presenceMap, fallback to API response
  const isOtherOnline = otherParticipant
    ? (presenceMap?.get(otherParticipant.id)?.isOnline ?? otherParticipant.isOnline ?? false)
    : false;

  // Recording preview (priority over typing)
  const activeRecordingUsers = recordingUsers?.filter((u) => u.id !== currentUserId) ?? [];
  const isRecording = activeRecordingUsers.length > 0;
  const firstRecording = activeRecordingUsers[0];
  const recordingLabel = isRecording && firstRecording
    ? activeRecordingUsers.length === 1
      ? `🎤 ${firstRecording.name.split(' ')[0]} está gravando áudio...`
      : `🎤 ${firstRecording.name.split(' ')[0]} e mais ${activeRecordingUsers.length - 1} gravando áudio...`
    : null;

  // Typing preview
  const activeTypingUsers = typingUsers?.filter((u) => u.id !== currentUserId) ?? [];
  const isTyping = activeTypingUsers.length > 0;
  const firstTyping = activeTypingUsers[0];
  const typingLabel = isTyping && firstTyping
    ? activeTypingUsers.length === 1
      ? `${firstTyping.name.split(' ')[0]} está digitando...`
      : `${firstTyping.name.split(' ')[0]} e mais ${activeTypingUsers.length - 1} digitando...`
    : null;

  const hasActivity = isRecording || isTyping;
  const activityLabel = recordingLabel ?? typingLabel;

  return (
    <XStack
      alignItems="center"
      gap="$2.5"
      padding="$3"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      {/* Avatar - taps open profile/contact/group info */}
      <Pressable onPress={handleAvatarPress}>
        <View position="relative">
          {conversation.type === 'GROUP' && conversation.group ? (
            <GroupAvatar
              participants={conversation.participants}
              imageUrl={conversation.group.imageUrl}
              size={48}
            />
          ) : (
            <Avatar
              src={otherParticipant?.avatarUrl}
              name={displayName}
              size="md"
            />
          )}
          {conversation.type === 'DIRECT' && otherParticipant && (
            <View position="absolute" bottom={0} right={0}>
              <OnlineStatus
                isOnline={isOtherOnline}
                size={12}
              />
            </View>
          )}
        </View>
      </Pressable>

      {/* Content - taps open the chat */}
      <Pressable onPress={handlePress} style={{ flex: 1 }}>
        <YStack gap="$0.5">
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$1" flex={1}>
              <Text
                weight="semibold"
                size="sm"
                numberOfLines={1}
                flex={1}
              >
                {displayName}
              </Text>
              {conversation.isMuted && (
                <Text color="secondary" size="xs">🔇</Text>
              )}
            </XStack>
            <Text color="secondary" size="xs">
              {conversation.lastMessage
                ? formatTime(conversation.lastMessage.createdAt)
                : ''}
            </Text>
          </XStack>

          <XStack alignItems="center" justifyContent="space-between">
            <Text
              color={hasActivity ? 'primary' : 'secondary'}
              size="xs"
              numberOfLines={1}
              flex={1}
              style={hasActivity ? { fontStyle: 'italic' } : undefined}
            >
              {activityLabel ?? getPreview(conversation)}
            </Text>

            {conversation.unreadCount > 0 && (
              <View
                minWidth={20}
                height={20}
                borderRadius="$full"
                backgroundColor="$primary"
                alignItems="center"
                justifyContent="center"
                paddingHorizontal="$0.5"
                marginLeft="$1"
              >
                <Text
                  weight="bold"
                  style={{ fontSize: 10, lineHeight: 12, color: '#FFFFFF' }}
                >
                  {conversation.unreadCount > 99
                    ? '99+'
                    : conversation.unreadCount}
                </Text>
              </View>
            )}
          </XStack>
        </YStack>
      </Pressable>
    </XStack>
  );
}
