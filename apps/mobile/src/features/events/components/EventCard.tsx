import { useState, useEffect, useMemo } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { router } from 'expo-router';
import { Card, Text, Badge } from '@ahub/ui';
import type { EventListItem } from '@ahub/shared/types';

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
    if (event.bannerDisplay?.length > 0) return event.bannerDisplay;
    if (event.bannerFeed) return [event.bannerFeed];
    return [];
  }, [event.bannerDisplay, event.bannerFeed]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
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
      <Card variant="elevated" pressable>
        <YStack gap="$2">
          {/* Banner */}
          {banners.length > 0 ? (
            <View
              borderRadius="$md"
              height={140}
              overflow="hidden"
              backgroundColor="$backgroundHover"
            >
              <Image
                source={{ uri: banners[currentIndex] }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <View
                flex={1}
                backgroundColor={event.color ?? '$backgroundHover'}
                opacity={0.3}
              />
              {/* Dot indicators */}
              {banners.length > 1 && (
                <XStack
                  position="absolute"
                  bottom={8}
                  alignSelf="center"
                  gap={4}
                >
                  {banners.map((_, i) => (
                    <View
                      key={i}
                      width={6}
                      height={6}
                      borderRadius={3}
                      backgroundColor={
                        i === currentIndex
                          ? 'white'
                          : 'rgba(255,255,255,0.5)'
                      }
                    />
                  ))}
                </XStack>
              )}
            </View>
          ) : (
            <View
              backgroundColor={event.color ?? '$backgroundHover'}
              borderRadius="$md"
              height={100}
              alignItems="center"
              justifyContent="center"
            >
              <Text style={{ fontSize: 32 }}>
                {isOngoing ? '🔴' : '📅'}
              </Text>
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
              <Text color="secondary" size="sm">
                📍 {event.locationName}
              </Text>
              <Text color="secondary" size="sm">
                📅 {formatEventDate(event.startDate)}
              </Text>
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
