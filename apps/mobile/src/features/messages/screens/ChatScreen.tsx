import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useColorScheme,
} from 'react-native';
import { YStack, View } from 'tamagui';
import { Text, Avatar, ScreenHeader, Icon } from '@ahub/ui';
import { ArrowDown } from '@ahub/ui/src/icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useAuthStore } from '@/stores/auth.store';
import { useConversation } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { useSendMessage, useAddReaction, useDeleteMessage } from '../hooks/useSendMessage';
import { useMarkConversationAsRead } from '../hooks/useConversations';
import { useMessageWebSocket } from '../hooks/useMessageWebSocket';
import { useTyping } from '../hooks/useTyping';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { messageGlass } from '@ahub/ui/themes';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { TypingIndicator } from '../components/TypingIndicator';
import { OnlineStatus } from '../components/OnlineStatus';
import { MessageContextMenu } from '../components/MessageContextMenu';
import { ChatBackground } from '../components/ChatBackground';
import { DateSeparator } from '../components/DateSeparator';
import { GlassView } from '../components/GlassView';
import { EmptyChatState } from '../components/EmptyChatState';
import { isSameDay } from '../utils/dateFormatters';
import { CLUSTER_TIME_GAP } from '../utils/animations';
import type { Message, MessageContentType } from '@ahub/shared/types';

const SCROLL_THRESHOLD = 150;

type ListItem =
  | { type: 'message'; data: Message; isFirstInCluster: boolean; isLastInCluster: boolean }
  | { type: 'date'; date: string };

export function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const user = useAuthStore((s) => s.user);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const chatBg = isDark ? messageGlass.chatBgDark : messageGlass.chatBgLight;
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
  const deleteMessage = useDeleteMessage();
  const markAsRead = useMarkConversationAsRead();

  const { typingUsers, recordingUsers, presenceMap } = useMessageWebSocket(conversationId ?? '');
  const { handleTextChange, stopTyping } = useTyping(conversationId ?? '');
  const { emit } = useWebSocket();

  const handleRecordingChange = useCallback((isRecording: boolean) => {
    emit(isRecording ? 'recording.start' : 'recording.stop', { conversationId });
  }, [emit, conversationId]);

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [contextMenuTarget, setContextMenuTarget] = useState<Message | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const prevMessageCount = useRef(0);

  useEffect(() => {
    if (conversationId) {
      markAsRead.mutate(conversationId);
    }
  }, [conversationId]);

  const messages = messagesData?.pages.flatMap((page) => page.data) ?? [];

  // Build list items with clustering and date separators
  const listItems = useMemo((): ListItem[] => {
    if (messages.length === 0) return [];

    const items: ListItem[] = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]!;
      const prevMsg = messages[i - 1]; // newer in time (list is inverted)
      const nextMsg = messages[i + 1]; // older in time

      // Cluster logic: same sender + within time gap
      const isSameSenderAsPrev =
        prevMsg && prevMsg.sender.id === msg.sender.id &&
        Math.abs(new Date(prevMsg.createdAt).getTime() - new Date(msg.createdAt).getTime()) < CLUSTER_TIME_GAP;

      const isSameSenderAsNext =
        nextMsg && nextMsg.sender.id === msg.sender.id &&
        Math.abs(new Date(msg.createdAt).getTime() - new Date(nextMsg.createdAt).getTime()) < CLUSTER_TIME_GAP;

      const isFirstInCluster = !isSameSenderAsPrev;
      const isLastInCluster = !isSameSenderAsNext;

      items.push({ type: 'message', data: msg, isFirstInCluster, isLastInCluster });

      // Date separator: insert after message if next message is on a different day
      // (since list is inverted, "after" means older in time = next in array)
      if (nextMsg && !isSameDay(msg.createdAt, nextMsg.createdAt)) {
        items.push({ type: 'date', date: msg.createdAt });
      }

      // Last message (oldest) gets a date separator
      if (i === messages.length - 1) {
        items.push({ type: 'date', date: msg.createdAt });
      }
    }

    return items;
  }, [messages]);

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
      if (names.length === 1) return `${names[0]} esta gravando audio...`;
      if (names.length === 2) return `${names[0]} e ${names[1]} estao gravando audio...`;
      return `${names[0]} e mais ${names.length - 1} gravando audio...`;
    }
    if (typingUsers.length > 0) {
      const names = typingUsers.map((u) => u.name?.split(' ')[0]).filter(Boolean);
      if (names.length === 1) return `${names[0]} esta digitando...`;
      if (names.length === 2) return `${names[0]} e ${names[1]} estao digitando...`;
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
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    },
    [sendMessage, stopTyping]
  );

  const handleLongPress = useCallback((message: Message) => {
    setContextMenuTarget(message);
  }, []);

  const handleContextMenuReaction = useCallback(
    (emoji: string) => {
      if (contextMenuTarget) {
        addReaction.mutate({ messageId: contextMenuTarget.id, emoji });
      }
    },
    [contextMenuTarget, addReaction]
  );

  const handleContextMenuReply = useCallback(() => {
    if (contextMenuTarget) {
      setReplyTo(contextMenuTarget);
    }
  }, [contextMenuTarget]);

  const handleContextMenuCopy = useCallback(async () => {
    if (contextMenuTarget?.content) {
      await Clipboard.setStringAsync(contextMenuTarget.content);
    }
  }, [contextMenuTarget]);

  const handleContextMenuForward = useCallback(() => {
    if (contextMenuTarget) {
      router.push({
        pathname: '/messages/forward',
        params: { messageId: contextMenuTarget.id },
      } as never);
    }
  }, [contextMenuTarget]);

  const handleContextMenuDelete = useCallback(() => {
    if (contextMenuTarget) {
      Alert.alert(
        'Apagar mensagem',
        'Tem certeza que deseja apagar esta mensagem?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Apagar',
            style: 'destructive',
            onPress: () => deleteMessage.mutate(contextMenuTarget.id),
          },
        ]
      );
    }
  }, [contextMenuTarget, deleteMessage]);

  const handleReply = useCallback((message: Message) => {
    setReplyTo(message);
  }, []);

  const handleIceBreaker = useCallback(
    (text: string) => {
      sendMessage.mutate({ content: text, contentType: 'TEXT' });
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    },
    [sendMessage]
  );

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

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'date') {
        return <DateSeparator date={item.date} />;
      }

      const msg = item.data;
      const isOwn = msg.sender.id === user?.id;
      const prevMsg = messages[messages.indexOf(msg) + 1];
      const showSender =
        isGroup && !isOwn && item.isFirstInCluster && prevMsg?.sender.id !== msg.sender.id;

      return (
        <MessageBubble
          message={msg}
          isOwn={isOwn}
          showSender={showSender}
          isGroup={isGroup}
          isFirstInCluster={item.isFirstInCluster}
          isLastInCluster={item.isLastInCluster}
          onLongPress={handleLongPress}
          onReaction={() => setContextMenuTarget(msg)}
          onReplyPress={handleReply}
          onSenderPress={handleSenderPress}
        />
      );
    },
    [user?.id, isGroup, messages, handleLongPress, handleReply, handleSenderPress]
  );

  const getItemKey = useCallback((item: ListItem, index: number) => {
    if (item.type === 'date') return `date-${item.date}-${index}`;
    return item.data.id;
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: chatBg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <YStack flex={1} backgroundColor={chatBg}>
          {/* Header */}
          <Pressable onPress={handleHeaderPress}>
            <ScreenHeader onBack={() => router.back()} borderBottom>
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
                      hasActivityIndicator ? 'accent' : isGroup ? 'secondary' : 'success'
                    }
                    size="xs"
                  >
                    {headerSubtitle}
                  </Text>
                )}
              </YStack>
            </ScreenHeader>
          </Pressable>

          {/* Messages */}
          <View flex={1} position="relative">
            {/* Subtle background pattern */}
            <ChatBackground />

            <FlatList
              ref={flatListRef}
              data={listItems}
              keyExtractor={getItemKey}
              renderItem={renderItem}
              inverted
              keyboardDismissMode="interactive"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.3}
              ListHeaderComponent={
                <TypingIndicator typingUsers={typingUsers} recordingUsers={recordingUsers} />
              }
              ListEmptyComponent={
                <EmptyChatState
                  onIceBreaker={handleIceBreaker}
                  participantName={otherParticipant?.name?.split(' ')[0]}
                />
              }
              contentContainerStyle={
                listItems.length === 0
                  ? [styles.messagesList, styles.emptyList]
                  : styles.messagesList
              }
              maxToRenderPerBatch={15}
              windowSize={11}
              removeClippedSubviews={Platform.OS === 'android'}
              initialNumToRender={20}
            />

            {/* Scroll to bottom button - glassmorphism */}
            {!isNearBottom && (
              <Pressable
                onPress={scrollToBottom}
                style={styles.scrollToBottomBtn}
              >
                <GlassView variant="button" borderRadius={9999}>
                  <View
                    width={40}
                    height={40}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon icon={ArrowDown} size="sm" color="secondary" />
                  </View>
                </GlassView>
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
                      weight="bold"
                      style={{ fontSize: 10, lineHeight: 12, color: '#FFFFFF' }}
                    >
                      {newMessageCount > 99 ? '99+' : newMessageCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            )}
          </View>

          {/* Context Menu overlay */}
          {contextMenuTarget && (
            <MessageContextMenu
              message={contextMenuTarget}
              isOwn={contextMenuTarget.sender.id === user?.id}
              onReaction={handleContextMenuReaction}
              onReply={handleContextMenuReply}
              onCopy={handleContextMenuCopy}
              onForward={handleContextMenuForward}
              onDelete={handleContextMenuDelete}
              onClose={() => setContextMenuTarget(null)}
            />
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
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollToBottomBtn: {
    position: 'absolute',
    bottom: 8,
    right: 16,
    zIndex: 5,
  },
});
