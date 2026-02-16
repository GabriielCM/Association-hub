import { useState, useCallback, useRef, useEffect } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Avatar } from '@ahub/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';
import { useConversation } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { useSendMessage, useAddReaction } from '../hooks/useSendMessage';
import { useMarkConversationAsRead } from '../hooks/useConversations';
import { useMessageWebSocket } from '../hooks/useMessageWebSocket';
import { useTyping } from '../hooks/useTyping';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { TypingIndicator } from '../components/TypingIndicator';
import { OnlineStatus } from '../components/OnlineStatus';
import { ReactionPicker } from '../components/ReactionPicker';
import type { Message, MessageContentType } from '@ahub/shared/types';

const SCROLL_THRESHOLD = 150; // px from bottom to trigger auto-scroll

export function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const user = useAuthStore((s) => s.user);
  const flatListRef = useRef<FlatList>(null);

  const { data: conversation } = useConversation(conversationId ?? '');
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId ?? '');
  const sendMessage = useSendMessage(conversationId ?? '');
  const addReaction = useAddReaction();
  const markAsRead = useMarkConversationAsRead();

  const { typingUsers, recordingUsers, presenceMap } = useMessageWebSocket(conversationId ?? '');
  const { handleTextChange, stopTyping } = useTyping(conversationId ?? '');
  const { emit } = useWebSocket();

  const handleRecordingChange = useCallback((isRecording: boolean) => {
    emit(isRecording ? 'recording.start' : 'recording.stop', { conversationId });
  }, [emit, conversationId]);

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [reactionTarget, setReactionTarget] = useState<string | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const prevMessageCount = useRef(0);

  // Mark as read on mount
  useEffect(() => {
    if (conversationId) {
      markAsRead.mutate(conversationId);
    }
  }, [conversationId]);

  // Flatten messages from infinite query pages (reversed for inverted list)
  const messages = messagesData?.pages.flatMap((page) => page.data) ?? [];

  // Track new messages for the "new message" badge
  useEffect(() => {
    if (messages.length > prevMessageCount.current && !isNearBottom) {
      setNewMessageCount((c) => c + (messages.length - prevMessageCount.current));
    }
    if (isNearBottom) {
      setNewMessageCount(0);
    }
    prevMessageCount.current = messages.length;
  }, [messages.length, isNearBottom]);

  const isGroup = conversation?.type === 'GROUP';
  const otherParticipant = conversation?.participants.find(
    (p) => p.id !== user?.id
  );
  const otherIsOnline = presenceMap.get(otherParticipant?.id ?? '')?.isOnline
    ?? otherParticipant?.isOnline
    ?? false;

  const headerTitle = isGroup
    ? conversation?.group?.name ?? conversation?.participants.length + ' participantes'
    : otherParticipant?.name ?? 'Chat';

  const hasActivityIndicator = recordingUsers.length > 0 || typingUsers.length > 0;

  const headerSubtitle = (() => {
    if (recordingUsers.length > 0) {
      const names = recordingUsers.map((u) => u.name?.split(' ')[0]).filter(Boolean);
      if (names.length === 1) return `${names[0]} está gravando áudio...`;
      if (names.length === 2) return `${names[0]} e ${names[1]} estão gravando áudio...`;
      return `${names[0]} e mais ${names.length - 1} gravando áudio...`;
    }
    if (typingUsers.length > 0) {
      const names = typingUsers.map((u) => u.name?.split(' ')[0]).filter(Boolean);
      if (names.length === 1) return `${names[0]} está digitando...`;
      if (names.length === 2) return `${names[0]} e ${names[1]} estão digitando...`;
      return `${names[0]} e mais ${names.length - 1} digitando...`;
    }
    if (!isGroup && otherParticipant) {
      return otherIsOnline ? 'Online' : undefined;
    }
    if (isGroup) {
      return `${conversation?.group?.participantsCount ?? conversation?.participants.length ?? 0} participantes`;
    }
    return undefined;
  })();

  const handleSend = useCallback(
    (data: {
      content?: string;
      contentType: MessageContentType;
      mediaUrl?: string | undefined;
      mediaDuration?: number | undefined;
      replyTo?: string | undefined;
    }) => {
      sendMessage.mutate(data);
      stopTyping();
      // Auto-scroll to bottom on send
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    },
    [sendMessage, stopTyping]
  );

  const handleLongPress = useCallback((message: Message) => {
    setReactionTarget(message.id);
  }, []);

  const handleReactionSelect = useCallback(
    (emoji: string) => {
      if (reactionTarget) {
        addReaction.mutate({ messageId: reactionTarget, emoji });
        setReactionTarget(null);
      }
    },
    [reactionTarget, addReaction]
  );

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message);
  }, []);

  const handleHeaderPress = useCallback(() => {
    if (!conversationId) return;
    if (isGroup) {
      router.push({
        pathname: '/messages/[conversationId]/group',
        params: { conversationId },
      } as never);
    } else {
      router.push({
        pathname: '/messages/[conversationId]/contact',
        params: { conversationId },
      } as never);
    }
  }, [isGroup, conversationId]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // For inverted list, offset 0 = bottom. Near bottom = offset < threshold
      const offset = event.nativeEvent.contentOffset.y;
      setIsNearBottom(offset < SCROLL_THRESHOLD);
    },
    []
  );

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setNewMessageCount(0);
  }, []);

  const handleSenderPress = useCallback((senderId: string) => {
    router.push({
      pathname: '/profile/[userId]',
      params: { userId: senderId },
    } as never);
  }, []);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwn = item.sender.id === user?.id;
      // Show sender for group chats when sender changes
      const prevMsg = messages[index + 1]; // Inverted list, so +1 is previous in time
      const showSender =
        isGroup && !isOwn && prevMsg?.sender.id !== item.sender.id;

      return (
        <MessageBubble
          message={item}
          isOwn={isOwn}
          showSender={showSender}
          isGroup={isGroup}
          onLongPress={handleLongPress}
          onReaction={() => setReactionTarget(item.id)}
          onReplyPress={handleReply}
          onSenderPress={handleSenderPress}
        />
      );
    },
    [user?.id, isGroup, messages, handleLongPress, handleReply, handleSenderPress]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <YStack flex={1} backgroundColor="$background">
          {/* Header */}
          <Pressable onPress={handleHeaderPress}>
            <XStack
              alignItems="center"
              gap="$2"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
            >
              <Pressable onPress={() => router.back()}>
                <Text size="lg">←</Text>
              </Pressable>

              {isGroup ? (
                <Avatar
                  src={conversation?.group?.imageUrl}
                  name={conversation?.group?.name ?? ''}
                  size="sm"
                />
              ) : otherParticipant ? (
                <View position="relative">
                  <Avatar
                    src={otherParticipant.avatarUrl}
                    name={otherParticipant.name}
                    size="sm"
                  />
                  <View position="absolute" bottom={0} right={0}>
                    <OnlineStatus
                      isOnline={otherIsOnline}
                      size={10}
                    />
                  </View>
                </View>
              ) : null}

              <YStack flex={1}>
                <Text weight="semibold" size="sm" numberOfLines={1}>
                  {headerTitle}
                </Text>
                {headerSubtitle && (
                  <Text
                    color={
                      hasActivityIndicator ? 'primary' : isGroup ? 'secondary' : 'success'
                    }
                    size="xs"
                  >
                    {headerSubtitle}
                  </Text>
                )}
              </YStack>
            </XStack>
          </Pressable>

          {/* Messages */}
          <View flex={1} position="relative">
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              inverted
              onScroll={handleScroll}
              scrollEventThrottle={100}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.3}
              ListHeaderComponent={
                <TypingIndicator typingUsers={typingUsers} recordingUsers={recordingUsers} />
              }
              contentContainerStyle={styles.messagesList}
            />

            {/* Scroll to bottom button */}
            {!isNearBottom && (
              <Pressable
                onPress={scrollToBottom}
                style={styles.scrollToBottomBtn}
              >
                <View
                  width={40}
                  height={40}
                  borderRadius="$full"
                  backgroundColor="$background"
                  alignItems="center"
                  justifyContent="center"
                  shadowColor="$shadowColor"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.2}
                  shadowRadius={4}
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Text size="sm">↓</Text>
                </View>
                {newMessageCount > 0 && (
                  <View
                    position="absolute"
                    top={-4}
                    right={-4}
                    minWidth={18}
                    height={18}
                    borderRadius="$full"
                    backgroundColor="$primary"
                    alignItems="center"
                    justifyContent="center"
                    paddingHorizontal="$0.5"
                  >
                    <Text
                      color="white"
                      weight="bold"
                      style={{ fontSize: 10, lineHeight: 12 }}
                    >
                      {newMessageCount > 99 ? '99+' : newMessageCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            )}
          </View>

          {/* Reaction Picker overlay */}
          {reactionTarget && (
            <View
              position="absolute"
              bottom={100}
              left={0}
              right={0}
              alignItems="center"
              zIndex={10}
            >
              <ReactionPicker
                onSelect={handleReactionSelect}
                onClose={() => setReactionTarget(null)}
              />
            </View>
          )}

          {/* Input */}
          <MessageInput
            onSend={handleSend}
            onTextChange={handleTextChange}
            onRecordingChange={handleRecordingChange}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
          />
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 8,
  },
  scrollToBottomBtn: {
    position: 'absolute',
    bottom: 8,
    right: 16,
    zIndex: 5,
  },
});
