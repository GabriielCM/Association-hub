import { useState, useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { router } from 'expo-router';
import { Card, Text, Badge, Icon } from '@ahub/ui';
import { EVENT_ICONS } from '@ahub/ui/src/icons';
import type { EventListItem } from '@ahub/shared/types';
import { resolveUploadUrl } from '@/config/constants';

interface EventCardProps {
  event: EventListItem;
}

const categoryLabels: Record<string, string> = {
  SOCIAL: 'Social',
  SPORTS: 'Esportes',
  CULTURAL: 'Cultural',
  EDUCATIONAL: 'Educacional',
  NETWORKING: 'Networking',
  GASTRO: 'Gastronomia',
  MUSIC: 'Musica',
  ART: 'Arte',
  GAMES: 'Jogos',
  INSTITUTIONAL: 'Institucional',
};

function formatEventDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EventCard({ event }: EventCardProps) {
  const isOngoing = event.status === 'ONGOING';
  const isEnded = event.status === 'ENDED';

  // Banner carousel: prefer bannerDisplay array, fallback to bannerFeed
  const banners = useMemo(() => {
    if (event.bannerDisplay?.length > 0)
      return event.bannerDisplay.map((u) => resolveUploadUrl(u)!);
    const feed = resolveUploadUrl(event.bannerFeed);
    if (feed) return [feed];
    return [];
  }, [event.bannerDisplay, event.bannerFeed]);

  const [, setCurrentIndex] = useState(0);

  // Animated opacity values for crossfade
  const opacities = useRef<Animated.Value[]>([]);
  if (opacities.current.length !== banners.length) {
    opacities.current = banners.map(
      (_, i) => new Animated.Value(i === 0 ? 1 : 0),
    );
  }

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % banners.length;
        Animated.parallel([
          Animated.timing(opacities.current[prev]!, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacities.current[next]!, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handlePress = () => {
    router.push({
      pathname: '/events/[eventId]',
      params: { eventId: event.id },
    } as never);
  };

  return (
    <Pressable onPress={handlePress}>
      <Card variant="elevated">
        <YStack gap="$2">
          {/* Banner */}
          {banners.length > 0 ? (
            <View
              borderRadius="$md"
              height={140}
              overflow="hidden"
              backgroundColor="$backgroundHover"
            >
              {banners.map((uri, i) => (
                <Animated.Image
                  key={uri}
                  source={{ uri }}
                  style={[
                    StyleSheet.absoluteFill,
                    { opacity: opacities.current[i] ?? 1 },
                  ]}
                  resizeMode="cover"
                />
              ))}
            </View>
          ) : (
            <View
              backgroundColor={event.color ?? '$backgroundHover'}
              borderRadius="$md"
              height={100}
              alignItems="center"
              justifyContent="center"
            >
              <Icon
                icon={isOngoing ? EVENT_ICONS.live : EVENT_ICONS.date}
                size="lg"
                color={isOngoing ? 'error' : 'muted'}
                weight="duotone"
              />
            </View>
          )}

          {/* Status + Category */}
          <XStack gap="$2" alignItems="center">
            <Badge
              variant={
                isOngoing ? 'warning' : isEnded ? 'ghost' : 'primary'
              }
            >
              {categoryLabels[event.category] ?? event.category}
            </Badge>
            {isOngoing && (
              <Badge variant="error">Ao vivo</Badge>
            )}
            {event.isConfirmed && (
              <Badge variant="success">Confirmado</Badge>
            )}
          </XStack>

          {/* Event Info */}
          <XStack
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <YStack flex={1} gap="$1">
              <Text weight="bold" size="lg" numberOfLines={2}>
                {event.title}
              </Text>
              <XStack gap="$1" alignItems="center">
                <Icon icon={EVENT_ICONS.location} size="sm" color="secondary" />
                <Text color="secondary" size="sm">
                  {event.locationName}
                </Text>
              </XStack>
              <XStack gap="$1" alignItems="center">
                <Icon icon={EVENT_ICONS.date} size="sm" color="secondary" />
                <Text color="secondary" size="sm">
                  {formatEventDate(event.startDate)}
                </Text>
              </XStack>
            </YStack>
            <YStack alignItems="flex-end" gap="$1">
              <Badge variant="success">+{event.pointsTotal} pts</Badge>
              <Text color="secondary" size="xs">
                {event.confirmationsCount} confirmados
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </Card>
    </Pressable>
  );
}
