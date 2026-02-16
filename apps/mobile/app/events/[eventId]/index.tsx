import { ScrollView, Linking } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, Heading, Button, Card, Spinner, ScreenHeader } from '@ahub/ui';
import { useEvent, useEventComments } from '@/features/events/hooks/useEvents';
import {
  useConfirmEvent,
  useRemoveConfirmation,
} from '@/features/events/hooks/useEventMutations';
import { EventHeader } from '@/features/events/components/EventHeader';
import { EventInfo } from '@/features/events/components/EventInfo';
import { CheckInProgress } from '@/features/events/components/CheckInProgress';
import { CheckInButton } from '@/features/events/components/CheckInButton';
import { CommentItem } from '@/features/events/components/CommentItem';
import { CelebrationOverlay } from '@/features/events/components/CelebrationOverlay';

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();

  const { data: event, isLoading } = useEvent(eventId);
  const { data: commentsData } = useEventComments(eventId, {
    perPage: 5,
  });

  const confirmMutation = useConfirmEvent(eventId);
  const removeMutation = useRemoveConfirmation(eventId);

  if (isLoading || !event) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="lg" />
        </YStack>
      </SafeAreaView>
    );
  }

  const comments = commentsData?.data ?? [];
  const canConfirm =
    event.status === 'SCHEDULED' || event.status === 'ONGOING';
  const canRemoveConfirm = event.status === 'SCHEDULED';

  const handleToggleConfirm = () => {
    if (event.isConfirmed && canRemoveConfirm) {
      removeMutation.mutate();
    } else if (!event.isConfirmed && canConfirm) {
      confirmMutation.mutate();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <ScrollView>
        <ScreenHeader title="Voltar" onBack={() => router.back()} style={{ position: 'absolute', zIndex: 10 }} />

        {/* Header */}
        <EventHeader event={event} />

        <YStack padding="$4" gap="$4">
          {/* Description */}
          <Text>{event.description}</Text>

          {/* Event Info */}
          <EventInfo event={event} />

          {/* Check-in Progress */}
          {event.userCheckInsCompleted > 0 && (
            <Card variant="flat">
              <YStack padding="$3">
                <CheckInProgress
                  completedCheckins={event.userCheckIns.map(ci => ci.checkinNumber)}
                  total={event.checkinsCount}
                  pointsTotal={event.pointsTotal}
                />
              </YStack>
            </Card>
          )}

          {/* Action Buttons */}
          <YStack gap="$2">
            {/* Confirm Presence */}
            {canConfirm && (
              <Button
                variant={event.isConfirmed ? 'ghost' : 'primary'}
                size="lg"
                fullWidth
                onPress={handleToggleConfirm}
                disabled={
                  confirmMutation.isPending || removeMutation.isPending
                }
              >
                {event.isConfirmed
                  ? canRemoveConfirm
                    ? 'Remover confirmacao'
                    : 'Presenca confirmada'
                  : 'Confirmar presenca'}
              </Button>
            )}

            {/* Check-in Button */}
            <CheckInButton event={event} />

            {/* External Link */}
            {event.externalLink && (
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onPress={() => Linking.openURL(event.externalLink!)}
              >
                Abrir link externo
              </Button>
            )}
          </YStack>

          {/* Comments Preview */}
          <YStack gap="$3">
            <XStack
              justifyContent="space-between"
              alignItems="center"
            >
              <Heading level={4}>
                Comentarios ({event.commentsCount})
              </Heading>
              {event.commentsCount > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() =>
                    router.push(`/events/${eventId}/comments` as never)
                  }
                >
                  Ver todos
                </Button>
              )}
            </XStack>

            {comments.length > 0 ? (
              <YStack gap="$3">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </YStack>
            ) : (
              <Text color="secondary" size="sm">
                Nenhum comentario ainda
              </Text>
            )}

            <Button
              variant="ghost"
              size="sm"
              onPress={() =>
                router.push(`/events/${eventId}/comments` as never)
              }
            >
              Escrever comentario
            </Button>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Celebration Overlay */}
      <CelebrationOverlay />
    </SafeAreaView>
  );
}
