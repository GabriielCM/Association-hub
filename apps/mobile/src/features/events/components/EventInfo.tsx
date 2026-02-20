import { useState, useEffect } from 'react';
import { XStack, YStack, View } from 'tamagui';
import { Text, Card, Icon } from '@ahub/ui';
import { EVENT_ICONS } from '@ahub/ui/src/icons';
import { useEventsTheme } from '@/features/events/hooks/useEventsTheme';
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

function formatCountdown(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}min`);
  return parts.join(' ');
}

function EventCountdown({ startDate }: { startDate: Date }) {
  const [now, setNow] = useState(Date.now());
  const target = new Date(startDate).getTime();
  const remaining = Math.max(0, target - now);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [remaining > 0]);

  if (remaining <= 0) return null;

  return (
    <View
      backgroundColor="$primary"
      borderRadius="$md"
      paddingVertical="$2"
      paddingHorizontal="$3"
      alignItems="center"
    >
      <Text style={{ color: '#fff' }} weight="bold" size="sm">
        Comeca em {formatCountdown(remaining)}
      </Text>
    </View>
  );
}

export function EventInfo({ event }: EventInfoProps) {
  const et = useEventsTheme();
  const pointsPerCheckin = Math.floor(
    event.pointsTotal / event.checkinsCount
  );
  const showCountdown =
    event.status === 'SCHEDULED' &&
    new Date(event.startDate).getTime() > Date.now();

  return (
    <Card
      variant="flat"
      {...(et.cardBg ? {
        backgroundColor: et.cardBg,
        borderWidth: 1,
        borderColor: et.cardBorder,
        shadowOpacity: 0,
      } : {})}
    >
      <YStack gap="$3" padding="$1">
        {/* Countdown */}
        {showCountdown && <EventCountdown startDate={event.startDate} />}

        {/* Date & Time */}
        <XStack gap="$3" alignItems="flex-start">
          <Icon icon={EVENT_ICONS.date} size="md" color={et.iconColor} />
          <YStack flex={1}>
            <Text weight="semibold" style={{ color: et.textPrimary }}>
              {formatDate(event.startDate)}
            </Text>
            <Text color="secondary" size="sm" style={{ color: et.textSecondary }}>
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </Text>
          </YStack>
        </XStack>

        {/* Location */}
        <XStack gap="$3" alignItems="flex-start">
          <Icon icon={EVENT_ICONS.location} size="md" color={et.iconColor} />
          <YStack flex={1}>
            <Text weight="semibold" style={{ color: et.textPrimary }}>
              {event.locationName}
            </Text>
            {event.locationAddress && (
              <Text color="secondary" size="sm" style={{ color: et.textSecondary }}>
                {event.locationAddress}
              </Text>
            )}
          </YStack>
        </XStack>

        {/* Points */}
        <XStack gap="$3" alignItems="flex-start">
          <Icon icon={EVENT_ICONS.rating} size="md" color={et.iconColor} />
          <YStack flex={1}>
            <Text weight="semibold" style={{ color: et.textPrimary }}>
              {event.pointsTotal} pontos totais
            </Text>
            <Text color="secondary" size="sm" style={{ color: et.textSecondary }}>
              {event.checkinsCount} check-ins ({pointsPerCheckin} pts cada)
              {event.checkinInterval > 0 &&
                ` • Intervalo: ${event.checkinInterval} min`}
            </Text>
          </YStack>
        </XStack>

        {/* Capacity */}
        {event.capacity && (
          <XStack gap="$3" alignItems="flex-start">
            <Icon icon={EVENT_ICONS.attendees} size="md" color={et.iconColor} />
            <YStack flex={1}>
              <Text weight="semibold" style={{ color: et.textPrimary }}>
                {event.confirmationsCount}/{event.capacity} confirmados
              </Text>
            </YStack>
          </XStack>
        )}

        {/* Badge */}
        {event.badge && (
          <XStack gap="$3" alignItems="flex-start">
            <Icon icon={EVENT_ICONS.prize} size="md" color={et.iconColor} />
            <YStack flex={1}>
              <Text weight="semibold" style={{ color: et.textPrimary }}>
                {event.badge.name}
              </Text>
              {event.badge.description && (
                <Text color="secondary" size="sm" style={{ color: et.textSecondary }}>
                  {event.badge.description}
                </Text>
              )}
            </YStack>
          </XStack>
        )}

        {/* External Link */}
        {event.externalLink && (
          <XStack gap="$3" alignItems="flex-start">
            <Icon icon={EVENT_ICONS.link} size="md" color={et.iconColor} />
            <YStack flex={1}>
              <Text weight="semibold" style={{ color: et.accent }}>
                Link externo
              </Text>
            </YStack>
          </XStack>
        )}
      </YStack>
    </Card>
  );
}
