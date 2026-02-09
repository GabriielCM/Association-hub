import { useState, useEffect, useMemo } from 'react';
import { Image, StyleSheet } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Heading, Badge } from '@ahub/ui';
import type { EventDetail } from '@ahub/shared/types';
import { resolveUploadUrl } from '@/config/constants';

interface EventHeaderProps {
  event: EventDetail;
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

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Agendado',
  ONGOING: 'Em andamento',
  ENDED: 'Encerrado',
  CANCELED: 'Cancelado',
};

export function EventHeader({ event }: EventHeaderProps) {
  const isOngoing = event.status === 'ONGOING';

  // Only bannerDisplay images rotate; bannerFeed is a separate static fallback
  const banners = useMemo(
    () => (event.bannerDisplay ?? []).map((u) => resolveUploadUrl(u)!),
    [event.bannerDisplay]
  );
  const fallbackImage = resolveUploadUrl(event.bannerFeed);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <YStack>
      {/* Banner */}
      <View
        backgroundColor={event.color ?? '$backgroundHover'}
        height={220}
        overflow="hidden"
      >
        {banners.length > 0 ? (
          <>
            <Image
              source={{ uri: banners[currentIndex] }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <View
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="rgba(0,0,0,0.2)"
            />
            {/* Dot indicators */}
            {banners.length > 1 && (
              <XStack
                position="absolute"
                bottom={12}
                alignSelf="center"
                gap={6}
              >
                {banners.map((_, i) => (
                  <View
                    key={i}
                    width={8}
                    height={8}
                    borderRadius={4}
                    backgroundColor={
                      i === currentIndex
                        ? 'white'
                        : 'rgba(255,255,255,0.5)'
                    }
                  />
                ))}
              </XStack>
            )}
          </>
        ) : fallbackImage ? (
          <>
            <Image
              source={{ uri: fallbackImage }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <View
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="rgba(0,0,0,0.2)"
            />
          </>
        ) : (
          <View flex={1} alignItems="center" justifyContent="center">
            <Text style={{ fontSize: 48 }}>
              {isOngoing ? '🔴' : '📅'}
            </Text>
          </View>
        )}
      </View>

      {/* Title + Status */}
      <YStack paddingHorizontal="$4" paddingTop="$3" gap="$2">
        <YStack gap="$1" flexDirection="row" flexWrap="wrap" alignItems="center">
          <Badge
            variant={isOngoing ? 'error' : 'primary'}
          >
            {statusLabels[event.status] ?? event.status}
          </Badge>
          <Badge variant="ghost">
            {categoryLabels[event.category] ?? event.category}
          </Badge>
          {event.isPaused && (
            <Badge variant="warning">Pausado</Badge>
          )}
        </YStack>

        <Heading level={2}>{event.title}</Heading>
      </YStack>
    </YStack>
  );
}
