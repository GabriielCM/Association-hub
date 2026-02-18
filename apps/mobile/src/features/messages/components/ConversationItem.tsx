import { useCallback, useRef, memo } from 'react';
import { Pressable, StyleSheet, Animated as RNAnimated, useColorScheme } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text, Avatar, Icon } from '@ahub/ui';
import {
  Camera,
  Microphone,
  SpeakerSlash,
  PushPin,
  Bell,
  BellSlash,
  Archive,
  Trash,
} from '@ahub/ui/src/icons';
import { Swipeable } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import type { Conversation } from '@ahub/shared/types';
import { GroupAvatar } from './GroupAvatar';
import { StatusRing } from './OnlineStatus';
import { formatConversationTime } from '../utils/dateFormatters';
import { messageHaptics } from '../utils/haptics';

function getPreviewData(conversation: Conversation): {
  prefix: string;
  contentType: string;
  text: string;
} {
  if (!conversation.lastMessage)
    return { prefix: '', contentType: 'TEXT', text: 'Nenhuma mensagem' };

  const prefix =
    conversation.type === 'GROUP' && conversation.lastMessage.senderName
      ? `${conversation.lastMessage.senderName.split(' ')[0]}: `
      : '';

  return {
    prefix,
    contentType: conversation.lastMessage.contentType,
    text: conversation.lastMessage.content,
  };
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
  onPin?: (id: string) => void;
  onMute?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ConversationItem = memo(function ConversationItem({
  conversation,
  currentUserId,
  presenceMap,
  typingUsers,
  recordingUsers,
  onPin,
  onMute,
  onArchive,
  onDelete,
}: ConversationItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const swipeableRef = useRef<Swipeable>(null);

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

  const isOtherOnline = otherParticipant
    ? (presenceMap?.get(otherParticipant.id)?.isOnline ?? otherParticipant.isOnline ?? false)
    : false;

  // Recording preview (priority over typing)
  const activeRecordingUsers = recordingUsers?.filter((u) => u.id !== currentUserId) ?? [];
  const isRecording = activeRecordingUsers.length > 0;
  const firstRecording = activeRecordingUsers[0];
  const recordingLabel = isRecording && firstRecording
    ? activeRecordingUsers.length === 1
      ? `${firstRecording.name.split(' ')[0]} esta gravando audio...`
      : `${firstRecording.name.split(' ')[0]} e mais ${activeRecordingUsers.length - 1} gravando audio...`
    : null;

  // Typing preview
  const activeTypingUsers = typingUsers?.filter((u) => u.id !== currentUserId) ?? [];
  const isTyping = activeTypingUsers.length > 0;
  const firstTyping = activeTypingUsers[0];
  const typingLabel = isTyping && firstTyping
    ? activeTypingUsers.length === 1
      ? `${firstTyping.name.split(' ')[0]} esta digitando...`
      : `${firstTyping.name.split(' ')[0]} e mais ${activeTypingUsers.length - 1} digitando...`
    : null;

  const hasActivity = isRecording || isTyping;
  const activityLabel = recordingLabel ?? typingLabel;

  // Wallet-inspired text colors for dark mode
  const nameColor = isDark ? '#FFFFFF' : undefined;
  const secondaryColor = isDark ? 'rgba(255,255,255,0.6)' : undefined;
  const iconSecondaryColor = isDark ? 'rgba(255,255,255,0.4)' : 'secondary';

  // Swipe right = Pin
  const renderRightActions = useCallback(
    (_progress: RNAnimated.AnimatedInterpolation<number>, dragX: RNAnimated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [0, 80],
        outputRange: [0.5, 1],
        extrapolate: 'clamp',
      });
      return (
        <Pressable
          onPress={() => {
            messageHaptics.swipeAction();
            onPin?.(conversation.id);
            swipeableRef.current?.close();
          }}
          style={styles.swipeActionRight}
        >
          <RNAnimated.View style={{ transform: [{ scale }] }}>
            <Icon icon={PushPin} size="lg" color="#FFFFFF" weight="fill" />
          </RNAnimated.View>
        </Pressable>
      );
    },
    [conversation.id, onPin]
  );

  // Swipe left = Mute | Archive | Delete
  const renderLeftActions = useCallback(
    (_progress: RNAnimated.AnimatedInterpolation<number>, dragX: RNAnimated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [-200, -120, 0],
        outputRange: [1, 0.8, 0.5],
        extrapolate: 'clamp',
      });
      return (
        <XStack>
          <Pressable
            onPress={() => {
              messageHaptics.swipeAction();
              onMute?.(conversation.id);
              swipeableRef.current?.close();
            }}
            style={[styles.swipeAction, { backgroundColor: '#F59E0B' }]}
          >
            <RNAnimated.View style={{ transform: [{ scale }] }}>
              <Icon
                icon={conversation.isMuted ? Bell : BellSlash}
                size="lg"
                color="#FFFFFF"
                weight="fill"
              />
            </RNAnimated.View>
          </Pressable>
          <Pressable
            onPress={() => {
              messageHaptics.swipeAction();
              onArchive?.(conversation.id);
              swipeableRef.current?.close();
            }}
            style={[styles.swipeAction, { backgroundColor: '#3B82F6' }]}
          >
            <RNAnimated.View style={{ transform: [{ scale }] }}>
              <Icon icon={Archive} size="lg" color="#FFFFFF" weight="fill" />
            </RNAnimated.View>
          </Pressable>
          <Pressable
            onPress={() => {
              messageHaptics.swipeAction();
              onDelete?.(conversation.id);
              swipeableRef.current?.close();
            }}
            style={[styles.swipeAction, { backgroundColor: '#EF4444' }]}
          >
            <RNAnimated.View style={{ transform: [{ scale }] }}>
              <Icon icon={Trash} size="lg" color="#FFFFFF" weight="fill" />
            </RNAnimated.View>
          </Pressable>
        </XStack>
      );
    },
    [conversation.id, conversation.isMuted, onMute, onArchive, onDelete]
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootRight={false}
      overshootLeft={false}
      friction={2}
    >
      <XStack
        alignItems="center"
        gap="$2.5"
        paddingHorizontal="$3"
        paddingVertical="$1.5"
        backgroundColor={isDark ? 'rgba(255,255,255,0.07)' : '$background'}
        borderBottomWidth={StyleSheet.hairlineWidth}
        borderBottomColor={isDark ? 'rgba(255,255,255,0.06)' : '#E5E7EB'}
      >
        {/* Avatar with status ring */}
        <Pressable onPress={handleAvatarPress}>
          {conversation.type === 'GROUP' && conversation.group ? (
            <GroupAvatar
              participants={conversation.participants}
              imageUrl={conversation.group.imageUrl}
              size={52}
            />
          ) : (
            <StatusRing isOnline={isOtherOnline} size={48}>
              <Avatar
                src={otherParticipant?.avatarUrl}
                name={displayName}
                size="md"
              />
            </StatusRing>
          )}
        </Pressable>

        {/* Content */}
        <Pressable onPress={handlePress} style={{ flex: 1 }}>
          <YStack gap="$0.5">
            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" gap="$1" flex={1}>
                <Text
                  weight="semibold"
                  size="sm"
                  numberOfLines={1}
                  flex={1}
                  {...(nameColor ? { style: { color: nameColor } } : {})}
                >
                  {displayName}
                </Text>
                {conversation.isMuted && (
                  <Icon icon={SpeakerSlash} size="sm" color={iconSecondaryColor} />
                )}
              </XStack>
              <Text size="xs" {...(secondaryColor ? { style: { color: secondaryColor } } : { color: 'secondary' })}>
                {conversation.lastMessage
                  ? formatConversationTime(conversation.lastMessage.createdAt)
                  : ''}
              </Text>
            </XStack>

            <XStack alignItems="center" justifyContent="space-between">
              <XStack flex={1} alignItems="center" gap="$0.5">
                {isRecording && (
                  <Icon icon={Microphone} size={12} color="primary" />
                )}
                {!hasActivity && (() => {
                  const preview = getPreviewData(conversation);
                  if (preview.contentType === 'IMAGE') {
                    return (
                      <>
                        {preview.prefix ? (
                          <Text size="xs" numberOfLines={1} {...(secondaryColor ? { style: { color: secondaryColor } } : { color: 'secondary' })}>{preview.prefix}</Text>
                        ) : null}
                        <Icon icon={Camera} size={12} color={iconSecondaryColor} />
                        <Text size="xs" numberOfLines={1} {...(secondaryColor ? { style: { color: secondaryColor } } : { color: 'secondary' })}>Foto</Text>
                      </>
                    );
                  }
                  if (preview.contentType === 'AUDIO') {
                    return (
                      <>
                        {preview.prefix ? (
                          <Text size="xs" numberOfLines={1} {...(secondaryColor ? { style: { color: secondaryColor } } : { color: 'secondary' })}>{preview.prefix}</Text>
                        ) : null}
                        <Icon icon={Microphone} size={12} color={iconSecondaryColor} />
                        <Text size="xs" numberOfLines={1} {...(secondaryColor ? { style: { color: secondaryColor } } : { color: 'secondary' })}>Audio</Text>
                      </>
                    );
                  }
                  return (
                    <Text size="xs" numberOfLines={1} flex={1} {...(secondaryColor ? { style: { color: secondaryColor } } : { color: 'secondary' })}>
                      {preview.prefix}{preview.text}
                    </Text>
                  );
                })()}
                {hasActivity && (
                  <Text
                    color="primary"
                    size="xs"
                    numberOfLines={1}
                    flex={1}
                    style={{ fontStyle: 'italic' }}
                  >
                    {activityLabel}
                  </Text>
                )}
              </XStack>

              {conversation.unreadCount > 0 && (
                <View
                  minWidth={20}
                  height={20}
                  borderRadius="$full"
                  backgroundColor={isDark ? '#06B6D4' : '$primary'}
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
    </Swipeable>
  );
});

const styles = StyleSheet.create({
  swipeActionRight: {
    width: 80,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeAction: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
