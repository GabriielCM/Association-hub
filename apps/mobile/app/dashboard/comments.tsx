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

import { useDashboardTheme } from '@/features/dashboard/hooks/useDashboardTheme';
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
  const dt = useDashboardTheme();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: dt.screenBg }} edges={['top', 'bottom']}>
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
          style={{ borderBottomWidth: 1, borderBottomColor: dt.borderColor }}
        >
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: dt.textSecondary }}>← Voltar</Text>
          </Pressable>
          <Text weight="bold" size="lg" style={{ color: dt.textPrimary }}>
            Comentarios
          </Text>
          <Text size="sm" style={{ color: dt.textSecondary }}>
            {data?.total ?? 0}
          </Text>
        </XStack>

        {/* Comments list */}
        {isLoading ? (
          <YStack padding="$8" alignItems="center" flex={1}>
            <ActivityIndicator color={dt.accent} />
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
                <Text style={{ color: dt.textSecondary }} weight="semibold">
                  Nenhum comentario ainda
                </Text>
                <Text style={{ color: dt.textSecondary }} size="xs">
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
            style={{ backgroundColor: dt.inputBg }}
          >
            <Text size="xs" style={{ color: dt.textSecondary }}>
              Respondendo a @{replyTo.name}
            </Text>
            <Pressable onPress={() => setReplyTo(null)}>
              <X size={16} color={dt.accent} />
            </Pressable>
          </XStack>
        )}

        {/* Input */}
        <XStack
          padding="$4"
          gap="$2"
          alignItems="flex-end"
          style={{ borderTopWidth: 1, borderTopColor: dt.borderColor }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={
              replyTo
                ? `Respondendo a @${replyTo.name}...`
                : 'Adicione um comentario...'
            }
            placeholderTextColor={dt.inputPlaceholder}
            style={[
              styles.input,
              {
                borderColor: dt.inputBorder,
                color: dt.inputText,
                backgroundColor: dt.inputBg,
              },
            ]}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || createComment.isPending}
            style={[
              styles.sendBtn,
              { backgroundColor: dt.isDark ? '#00E5FF' : dt.accent },
              (!text.trim() || createComment.isPending) &&
                styles.sendBtnDisabled,
            ]}
          >
            {createComment.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={{ color: '#FFFFFF' }} weight="semibold" size="sm">
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 80,
  },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
