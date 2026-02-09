import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { Button, Text } from '@ahub/ui';
import type { EventDetail } from '@ahub/shared/types';

interface CheckInButtonProps {
  event: EventDetail;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function CheckInButton({ event }: CheckInButtonProps) {
  const router = useRouter();
  const [now, setNow] = useState(Date.now());

  const isOngoing = event.status === 'ONGOING';
  const isPaused = event.isPaused;
  const allCompleted =
    event.userCheckInsCompleted >= event.checkinsCount;
  const currentCheckin = event.currentCheckinNumber;

  // Find last check-in time for countdown calculation
  const lastUserCheckin = event.userCheckIns.length > 0
    ? event.userCheckIns.reduce((latest, ci) =>
        new Date(ci.createdAt) > new Date(latest.createdAt) ? ci : latest
      )
    : null;

  // Countdown based on last check-in time + interval
  const nextAvailableAt = lastUserCheckin && !allCompleted
    ? new Date(lastUserCheckin.createdAt).getTime() + event.checkinInterval * 60_000
    : 0;
  const remaining = nextAvailableAt > 0 ? Math.max(0, nextAvailableAt - now) : 0;

  // Tick countdown every second when waiting
  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [remaining > 0]);

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

  // Waiting for interval to pass before next check-in
  if (remaining > 0) {
    return (
      <YStack gap="$1" alignItems="center">
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          disabled
        >
          Check-in {currentCheckin - 1} realizado
        </Button>
        <Text color="secondary" size="sm">
          Proximo check-in em {formatCountdown(remaining)}
        </Text>
      </YStack>
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
