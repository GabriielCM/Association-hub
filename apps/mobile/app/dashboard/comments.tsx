import { useState, useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { Text, Icon } from '@ahub/ui';
import { ChatCircle } from '@ahub/ui/src/icons';

import { colors } from '@ahub/ui/themes';
import { getComments } from '@/features/dashboard/api/dashboard.api';
import {
  useCreateComment,
  useDeleteComment,
} from '@/features/dashboard/hooks/useFeedMutations';
import { CommentItem } from '@/features/dashboard/components/CommentItem';
import type { FeedComment, CommentsListResponse } from '@ahub/shared/types';
import { X } from 'phosphor-react-native';
export default function CommentsScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading, refetch } = useQuery<CommentsListResponse>({
    queryKey: ['dashboard', 'comments', postId],
    queryFn: () => getComments(postId!),
    enabled: !!postId,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          padding="$4"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Pressable onPress={() => router.back()}>
            <Text color="secondary">← Voltar</Text>
          </Pressable>
          <Text weight="bold" size="lg">
            Comentarios
          </Text>
          <Text size="sm" color="secondary">
            {data?.total ?? 0}
          </Text>
        </XStack>

        {/* Comments list */}
        {isLoading ? (
          <YStack padding="$8" alignItems="center" flex={1}>
            <ActivityIndicator />
          </YStack>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                onReply={handleReply}
                onDelete={handleDelete}
              />
            )}
            ListEmptyComponent={
              <YStack
                padding="$8"
                alignItems="center"
                justifyContent="center"
                flex={1}
              >
                <Icon icon={ChatCircle} size="xl" color="muted" weight="duotone" />
                <Text color="secondary" weight="semibold">
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
            backgroundColor="$background"
          >
            <Text size="xs" color="secondary">
              Respondendo a @{replyTo.name}
            </Text>
            <Pressable onPress={() => setReplyTo(null)}>
              <Icon icon={X} size="sm" color="primary" />
            </Pressable>
          </XStack>
        )}

        {/* Input */}
        <XStack
          padding="$4"
          gap="$2"
          alignItems="flex-end"
          borderTopWidth={1}
          borderTopColor="$borderColor"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
