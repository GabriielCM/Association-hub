import { XStack, YStack } from 'tamagui';
import { Text, Card } from '@ahub/ui';
import type { EventDetail } from '@ahub/shared/types';

interface EventInfoProps {
  event: EventDetail;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(date: Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EventInfo({ event }: EventInfoProps) {
  const pointsPerCheckin = Math.floor(
    event.pointsTotal / event.checkinsCount
  );

  return (
    <Card variant="flat">
      <YStack gap="$3" padding="$1">
        {/* Date & Time */}
        <XStack gap="$3" alignItems="flex-start">
          <Text style={{ fontSize: 20 }}>📅</Text>
          <YStack flex={1}>
            <Text weight="semibold">{formatDate(event.startDate)}</Text>
            <Text color="secondary" size="sm">
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </Text>
          </YStack>
        </XStack>

        {/* Location */}
        <XStack gap="$3" alignItems="flex-start">
          <Text style={{ fontSize: 20 }}>📍</Text>
          <YStack flex={1}>
            <Text weight="semibold">{event.locationName}</Text>
            {event.locationAddress && (
              <Text color="secondary" size="sm">
                {event.locationAddress}
              </Text>
            )}
          </YStack>
        </XStack>

        {/* Points */}
        <XStack gap="$3" alignItems="flex-start">
          <Text style={{ fontSize: 20 }}>⭐</Text>
          <YStack flex={1}>
            <Text weight="semibold">
              {event.pointsTotal} pontos totais
            </Text>
            <Text color="secondary" size="sm">
              {event.checkinsCount} check-ins ({pointsPerCheckin} pts cada)
              {event.checkinInterval > 0 &&
                ` • Intervalo: ${event.checkinInterval} min`}
            </Text>
          </YStack>
        </XStack>

        {/* Capacity */}
        {event.capacity && (
          <XStack gap="$3" alignItems="flex-start">
            <Text style={{ fontSize: 20 }}>👥</Text>
            <YStack flex={1}>
              <Text weight="semibold">
                {event.confirmationsCount}/{event.capacity} confirmados
              </Text>
            </YStack>
          </XStack>
        )}

        {/* Badge */}
        {event.badge && (
          <XStack gap="$3" alignItems="flex-start">
            <Text style={{ fontSize: 20 }}>🏆</Text>
            <YStack flex={1}>
              <Text weight="semibold">{event.badge.name}</Text>
              {event.badge.description && (
                <Text color="secondary" size="sm">
                  {event.badge.description}
                </Text>
              )}
            </YStack>
          </XStack>
        )}

        {/* External Link */}
        {event.externalLink && (
          <XStack gap="$3" alignItems="flex-start">
            <Text style={{ fontSize: 20 }}>🔗</Text>
            <YStack flex={1}>
              <Text weight="semibold" color="accent">
                Link externo
              </Text>
            </YStack>
          </XStack>
        )}
      </YStack>
    </Card>
  );
}
