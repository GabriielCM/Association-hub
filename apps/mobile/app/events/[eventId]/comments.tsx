import { useCallback } from 'react';
import { FlatList, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Spinner, ScreenHeader } from '@ahub/ui';
import { useEventComments } from '@/features/events/hooks/useEvents';
import { useCreateComment } from '@/features/events/hooks/useEventMutations';
import { useEventsTheme } from '@/features/events/hooks/useEventsTheme';
import type { CommentInput as CommentInputData } from '@/features/events/hooks/useEventMutations';
import { CommentItem } from '@/features/events/components/CommentItem';
import { CommentInput } from '@/features/events/components/CommentInput';
import type { EventComment } from '@ahub/shared/types';

export default function EventCommentsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const et = useEventsTheme();

  const { data, isLoading, isRefetching, refetch } = useEventComments(
    eventId,
    { perPage: 50 }
  );
  const createComment = useCreateComment(eventId);

  const comments = data?.data ?? [];

  const handleSubmit = useCallback(
    (data: CommentInputData) => {
      createComment.mutate(data);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: et.screenBg }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <ScreenHeader
          title="Comentarios"
          onBack={() => router.back()}
          borderBottom
          style={{ borderBottomColor: et.borderColor }}
        />

        {/* Comments List */}
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          style={{ backgroundColor: et.screenBg }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={et.accent}
              colors={[et.accent]}
              progressBackgroundColor={et.sheetBg}
            />
          }
          ListEmptyComponent={
            isLoading ? (
              <YStack alignItems="center" paddingVertical="$6">
                <Spinner />
              </YStack>
            ) : (
              <YStack alignItems="center" paddingVertical="$6">
                <Text color="secondary" style={{ color: et.textSecondary }}>
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
