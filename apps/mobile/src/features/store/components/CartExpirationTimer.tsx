import { useState, useEffect } from 'react';
import { XStack } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Timer, Warning } from '@ahub/ui/src/icons';

interface CartExpirationTimerProps {
  reservedUntil: string;
  onExpired: () => void;
}

export function CartExpirationTimer({
  reservedUntil,
  onExpired,
}: CartExpirationTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(
      0,
      Math.floor((new Date(reservedUntil).getTime() - Date.now()) / 1000),
    ),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(reservedUntil).getTime() - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservedUntil, onExpired]);

  if (secondsLeft <= 0) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = secondsLeft < 5 * 60;

  return (
    <XStack
      gap="$1"
      paddingHorizontal="$3"
      paddingVertical="$2"
      marginHorizontal="$4"
      borderRadius={8}
      backgroundColor={isUrgent ? '#FEE2E2' : '#FEF3C7'}
      alignItems="center"
    >
      <Icon icon={isUrgent ? Warning : Timer} size="sm" color={isUrgent ? 'error' : 'warning'} />
      <Text size="sm" color={isUrgent ? 'error' : 'warning'}>
        Reserva expira em {timeStr}
      </Text>
    </XStack>
  );
}
