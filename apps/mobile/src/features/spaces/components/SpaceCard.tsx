import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, GlassCard, SafeImage } from '@ahub/ui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { resolveUploadUrl } from '@/config/constants';
import { SpacePeriodBadge } from './SpacePeriodBadge';
import { SpaceStatusBadge } from './SpaceStatusBadge';
import type { SpaceListItem } from '@ahub/shared/types';

interface SpaceCardProps {
  space: SpaceListItem;
  onPress: (space: SpaceListItem) => void;
}

const IMAGE_HEIGHT = 160;

export function SpaceCard({ space, onPress }: SpaceCardProps) {
  const scale = useSharedValue(1);

  const feeLabel =
    space.fee != null && space.fee > 0
      ? `R$ ${(space.fee / 100).toFixed(2)}`
      : 'Gratuito';

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress(space);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={animatedStyle}>
        <GlassCard intensity="subtle" borderRadius={16} padding={0}>
          {/* Banner image */}
          <View style={styles.imageContainer}>
            {space.mainImageUrl ? (
              <SafeImage
                source={resolveUploadUrl(space.mainImageUrl) ?? ''}
                style={styles.image}
                contentFit="cover"
                transition={200}
                placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text size="xl">🏠</Text>
              </View>
            )}
            {space.status === 'MAINTENANCE' && (
              <View style={styles.statusOverlay}>
                <SpaceStatusBadge status={space.status} />
              </View>
            )}
          </View>

          {/* Info */}
          <YStack padding="$3" gap="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <Text weight="semibold" size="base" numberOfLines={1} style={{ flex: 1 }}>
                {space.name}
              </Text>
              <SpaceStatusBadge status={space.status} />
            </XStack>

            <Text size="xs" color="secondary" numberOfLines={2}>
              {space.description}
            </Text>

            <XStack justifyContent="space-between" alignItems="center">
              <XStack gap="$1.5" alignItems="center">
                <SpacePeriodBadge periodType={space.periodType} />
                <Text size="xs" color="secondary">
                  {space.capacity} pessoas
                </Text>
              </XStack>
              <Text size="sm" weight="semibold" color="accent">
                {feeLabel}
              </Text>
            </XStack>
          </YStack>
        </GlassCard>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
