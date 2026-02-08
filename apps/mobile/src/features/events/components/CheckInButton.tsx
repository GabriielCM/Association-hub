import { useRouter } from 'expo-router';
import { Button } from '@ahub/ui';
import type { EventDetail } from '@ahub/shared/types';

interface CheckInButtonProps {
  event: EventDetail;
}

export function CheckInButton({ event }: CheckInButtonProps) {
  const router = useRouter();

  const isOngoing = event.status === 'ONGOING';
  const isPaused = event.isPaused;
  const allCompleted =
    event.userCheckInsCompleted >= event.checkinsCount;
  const currentCheckin = event.currentCheckinNumber;
  const alreadyDoneCurrentCheckin = event.userCheckIns.some(
    (ci) => ci.checkinNumber === currentCheckin
  );

  if (!isOngoing) return null;

  if (allCompleted) {
    return (
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled
      >
        Todos os check-ins concluidos!
      </Button>
    );
  }

  if (isPaused) {
    return (
      <Button
        variant="ghost"
        size="lg"
        fullWidth
        disabled
      >
        Check-ins pausados
      </Button>
    );
  }

  if (alreadyDoneCurrentCheckin) {
    return (
      <Button
        variant="ghost"
        size="lg"
        fullWidth
        disabled
      >
        Check-in {currentCheckin} ja realizado
      </Button>
    );
  }

  const pointsPerCheckin = Math.floor(
    event.pointsTotal / event.checkinsCount
  );

  return (
    <Button
      variant="primary"
      size="lg"
      fullWidth
      onPress={() => router.push(`/events/${event.id}/checkin` as never)}
    >
      Fazer Check-in {currentCheckin} (+{pointsPerCheckin} pts)
    </Button>
  );
}
