import { useCallback } from 'react';
import { FlatList, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Spinner, ScreenHeader } from '@ahub/ui';
import { useEventComments } from '@/features/events/hooks/useEvents';
import { useCreateComment } from '@/features/events/hooks/useEventMutations';
import { CommentItem } from '@/features/events/components/CommentItem';
import { CommentInput } from '@/features/events/components/CommentInput';
import type { EventComment } from '@ahub/shared/types';

export default function EventCommentsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();

  const { data, isLoading, isRefetching, refetch } = useEventComments(
    eventId,
    { perPage: 50 }
  );
  const createComment = useCreateComment(eventId);

  const comments = data?.data ?? [];

  const handleSubmit = useCallback(
    (text: string) => {
      createComment.mutate(text);
    },
    [createComment]
  );

  const renderItem = useCallback(
    ({ item }: { item: EventComment }) => <CommentItem comment={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: EventComment) => item.id,
    []
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <ScreenHeader title="Comentarios" onBack={() => router.back()} borderBottom />

        {/* Comments List */}
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            isLoading ? (
              <YStack alignItems="center" paddingVertical="$6">
                <Spinner />
              </YStack>
            ) : (
              <YStack alignItems="center" paddingVertical="$6">
                <Text color="secondary">
                  Nenhum comentario ainda. Seja o primeiro!
                </Text>
              </YStack>
            )
          }
        />

        {/* Comment Input */}
        <CommentInput
          onSubmit={handleSubmit}
          isLoading={createComment.isPending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
