import { Pressable, StyleSheet, Image } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Card, Text } from '@ahub/ui';
import { resolveUploadUrl } from '@/config/constants';
import { SpacePeriodBadge } from './SpacePeriodBadge';
import { SpaceStatusBadge } from './SpaceStatusBadge';
import type { SpaceListItem } from '@ahub/shared/types';

interface SpaceCardProps {
  space: SpaceListItem;
  onPress: (space: SpaceListItem) => void;
}

export function SpaceCard({ space, onPress }: SpaceCardProps) {
  const feeLabel =
    space.fee != null && space.fee > 0
      ? `R$ ${(space.fee / 100).toFixed(2)}`
      : 'Gratuito';

  return (
    <Pressable onPress={() => onPress(space)}>
      <Card variant="flat">
        <XStack gap="$3">
          {/* Photo */}
          <View style={styles.imageContainer}>
            {space.mainImageUrl ? (
              <Image
                source={{ uri: resolveUploadUrl(space.mainImageUrl) ?? undefined }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text size="2xl">🏠</Text>
              </View>
            )}
          </View>

          {/* Info */}
          <YStack flex={1} gap="$1.5">
            <XStack justifyContent="space-between" alignItems="center">
              <Text weight="semibold" size="base" numberOfLines={1} flex={1}>
                {space.name}
              </Text>
              {space.status === 'MAINTENANCE' && (
                <SpaceStatusBadge status={space.status} />
              )}
            </XStack>

            <Text size="xs" color="secondary" numberOfLines={2}>
              {space.description}
            </Text>

            <XStack gap="$2" alignItems="center">
              <SpacePeriodBadge periodType={space.periodType} />
              <Text size="xs" color="secondary">
                {space.capacity} pessoas
              </Text>
            </XStack>

            <Text size="sm" weight="semibold" color="accent">
              {feeLabel}
            </Text>
          </YStack>
        </XStack>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
