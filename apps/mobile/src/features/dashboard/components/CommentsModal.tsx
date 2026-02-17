import { useState, useCallback } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { YStack, XStack } from 'tamagui';
import { useQuery } from '@tanstack/react-query';

import { Text, Avatar, Icon } from '@ahub/ui';
import { colors } from '@ahub/ui/themes';
import X from 'phosphor-react-native/src/icons/X';
import { getComments } from '../api/dashboard.api';
import {
  useCreateComment,
  useDeleteComment,
} from '../hooks/useFeedMutations';
import { CommentItem } from './CommentItem';
import { ReactionBar } from './ReactionBar';
import type { FeedComment, CommentsListResponse } from '@ahub/shared/types';

interface CommentsModalProps {
  visible: boolean;
  postId: string | null;
  onClose: () => void;
}

export function CommentsModal({
  visible,
  postId,
  onClose,
}: CommentsModalProps) {
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading, refetch } = useQuery<CommentsListResponse>({
    queryKey: ['dashboard', 'comments', postId],
    queryFn: () => getComments(postId!),
    enabled: !!postId && visible,
  });

  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const comments = data?.comments ?? [];

  const handleSend = () => {
    if (!text.trim() || !postId) return;

    createComment.mutate(
      {
        postId,
        data: {
          text: text.trim(),
          ...(replyTo && { parent_id: replyTo.id }),
        },
      },
      {
        onSuccess: () => {
          setText('');
          setReplyTo(null);
          refetch();
        },
      },
    );
  };

  const handleReply = useCallback((comment: FeedComment) => {
    setReplyTo({ id: comment.id, name: comment.author.name });
  }, []);

  const handleDelete = useCallback(
    (commentId: string) => {
      deleteComment.mutate(commentId, {
        onSuccess: () => refetch(),
      });
    },
    [deleteComment, refetch],
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Pressable
            style={styles.sheet}
            onPress={(e) => e.stopPropagation()}
          >
            <YStack gap="$3" flex={1}>
              {/* Header */}
              <XStack
                alignItems="center"
                justifyContent="space-between"
                paddingHorizontal="$4"
                paddingTop="$4"
              >
                <Text weight="bold" size="lg">
                  Comentarios
                </Text>
                <Text size="sm" color="secondary">
                  {data?.total ?? 0}
                </Text>
              </XStack>

              {/* Comments list */}
              {isLoading ? (
                <YStack padding="$8" alignItems="center">
                  <ActivityIndicator />
                </YStack>
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  renderItem={({ item }) => (
                    <CommentItem
                      comment={item}
                      onReply={handleReply}
                      onDelete={handleDelete}
                    />
                  )}
                  ListEmptyComponent={
                    <YStack padding="$8" alignItems="center">
                      <Text color="secondary" size="sm">
                        Nenhum comentario ainda
                      </Text>
                      <Text color="secondary" size="xs">
                        Seja o primeiro a comentar!
                      </Text>
                    </YStack>
                  }
                />
              )}

              {/* Reply indicator */}
              {replyTo && (
                <XStack
                  paddingHorizontal="$4"
                  paddingVertical="$1"
                  alignItems="center"
                  gap="$2"
                >
                  <Text size="xs" color="secondary">
                    Respondendo a{' '}
                    <Text size="xs" weight="semibold">
                      @{replyTo.name}
                    </Text>
                  </Text>
                  <Pressable onPress={() => setReplyTo(null)}>
                    <Icon icon={X} size="sm" color="primary" />
                  </Pressable>
                </XStack>
              )}

              {/* Input */}
              <XStack
                paddingHorizontal="$4"
                paddingBottom="$4"
                gap="$2"
                alignItems="flex-end"
              >
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder={
                    replyTo
                      ? `Respondendo a @${replyTo.name}...`
                      : 'Adicione um comentario...'
                  }
                  style={styles.input}
                  multiline
                  maxLength={500}
                />
                <Pressable
                  onPress={handleSend}
                  disabled={!text.trim() || createComment.isPending}
                  style={[
                    styles.sendBtn,
                    (!text.trim() || createComment.isPending) &&
                      styles.sendBtnDisabled,
                  ]}
                >
                  {createComment.isPending ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={{ color: '#FFF' }} weight="semibold" size="sm">
                      Enviar
                    </Text>
                  )}
                </Pressable>
              </XStack>
            </YStack>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
    maxHeight: '70%',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    maxHeight: '100%',
    flex: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 80,
  },
  sendBtn: {
    backgroundColor: colors.accentDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
