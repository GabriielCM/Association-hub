import { memo } from 'react';
import { Pressable, Image, Dimensions } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';

import { Text, Card, Badge, Icon } from '@ahub/ui';
import { Heart, ChatCircle, Calendar, MapPin, Confetti } from '@ahub/ui/src/icons';

import { useDashboardTheme } from '../hooks/useDashboardTheme';
import type { FeedPost } from '@ahub/shared/types';
import { Shield } from 'phosphor-react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `ha ${diffMin}min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `ha ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  return `ha ${diffDays}d`;
}

interface FeedEventCardProps {
  post: FeedPost;
}

export const FeedEventCard = memo(function FeedEventCard({ post }: FeedEventCardProps) {
  const router = useRouter();
  const dt = useDashboardTheme();

  const { content, created_at } = post;
  const eventData = (content as any).event;

  return (
    <Pressable
      onPress={() => {
        if (eventData?.id) {
          router.push(`/events/${eventData.id}` as any);
        }
      }}
    >
      <Card variant="flat" {...(dt.cardBg ? { backgroundColor: dt.cardBg, borderWidth: 1, borderColor: dt.cardBorder, shadowOpacity: 0 } : {})}>
        <YStack gap="$3">
          {/* Admin badge header */}
          <XStack alignItems="center" gap="$2">
            <Badge variant="primary"><Icon icon={Shield} size="sm" color="primary" weight="fill" /> ADMINISTRACAO</Badge>
            <Text size="xs" style={{ color: dt.textSecondary }}>
              {timeAgo(created_at)}
            </Text>
          </XStack>

          {/* Banner */}
          {content.image_url && (
            <Image
              source={{ uri: content.image_url }}
              style={{
                width: SCREEN_WIDTH - 48,
                height: (SCREEN_WIDTH - 48) * (9 / 16),
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
          )}

          {/* Event info */}
          <YStack gap="$1">
            {eventData?.title && (
              <XStack gap="$1" alignItems="center">
                <Icon icon={Confetti} size="md" color={dt.accent} />
                <Text weight="bold" size="lg" style={{ color: dt.textPrimary }}>{eventData.title}</Text>
              </XStack>
            )}
            {eventData?.date && (
              <XStack gap="$1" alignItems="center">
                <Icon icon={Calendar} size="sm" color={dt.textSecondary} />
                <Text size="sm" style={{ color: dt.textSecondary }}>{eventData.date}</Text>
              </XStack>
            )}
            {eventData?.location && (
              <XStack gap="$1" alignItems="center">
                <Icon icon={MapPin} size="sm" color={dt.textSecondary} />
                <Text size="sm" style={{ color: dt.textSecondary }}>{eventData.location}</Text>
              </XStack>
            )}
          </YStack>

          {/* Description */}
          {content.description && (
            <Text size="sm" numberOfLines={3} style={{ color: dt.textPrimary }}>
              {content.description}
            </Text>
          )}

          {/* Social actions */}
          <XStack gap="$4">
            <XStack alignItems="center" gap="$1">
              <Icon icon={Heart} size="lg" color="error" weight="fill" />
              <Text size="sm" style={{ color: dt.textSecondary }}>
                {content.likes_count}
              </Text>
            </XStack>
            <XStack alignItems="center" gap="$1">
              <Icon icon={ChatCircle} size="lg" color={dt.textSecondary} />
              <Text size="sm" style={{ color: dt.textSecondary }}>
                {content.comments_count}
              </Text>
            </XStack>
          </XStack>
        </YStack>
      </Card>
    </Pressable>
  );
});
