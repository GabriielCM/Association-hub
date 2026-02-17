import { Dimensions } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Card } from '@ahub/ui';
import { SkeletonBlock } from './SkeletonCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PADDING = 32;
const CONTENT_WIDTH = SCREEN_WIDTH - PADDING * 2;

export function SkeletonPointsCard() {
  return (
    <Card variant="elevated">
      <YStack gap="$2">
        <XStack alignItems="center" gap="$2">
          <SkeletonBlock width={24} height={24} borderRadius={12} />
          <SkeletonBlock width={100} height={14} />
        </XStack>
        <XStack alignItems="flex-end" justifyContent="space-between">
          <YStack gap={6}>
            <SkeletonBlock width={120} height={28} />
            <SkeletonBlock width={80} height={14} />
          </YStack>
          <YStack gap={4} alignItems="flex-end">
            <SkeletonBlock width={60} height={10} />
            <SkeletonBlock width={80} height={30} borderRadius={4} />
          </YStack>
        </XStack>
      </YStack>
    </Card>
  );
}

export function SkeletonQuickAccess() {
  const itemWidth = (SCREEN_WIDTH - PADDING * 2 - 12 * 3) / 3.5;

  return (
    <YStack gap="$2">
      <SkeletonBlock width={120} height={18} />
      <XStack gap={12}>
        {[0, 1, 2].map((i) => (
          <SkeletonBlock key={i} width={itemWidth} height={itemWidth} borderRadius={16} />
        ))}
        <SkeletonBlock width={itemWidth / 2} height={itemWidth} borderRadius={16} />
      </XStack>
    </YStack>
  );
}

export function SkeletonStories() {
  return (
    <XStack gap="$3">
      {[0, 1, 2, 3, 4].map((i) => (
        <YStack key={i} alignItems="center" gap={6}>
          <SkeletonBlock width={60} height={60} borderRadius={30} />
          <SkeletonBlock width={48} height={10} />
        </YStack>
      ))}
    </XStack>
  );
}

export function SkeletonFeedPost() {
  return (
    <Card variant="flat">
      <YStack gap="$3">
        <XStack alignItems="center" gap="$2">
          <SkeletonBlock width={32} height={32} borderRadius={16} />
          <YStack gap={4}>
            <SkeletonBlock width={100} height={14} />
            <SkeletonBlock width={60} height={10} />
          </YStack>
        </XStack>
        <SkeletonBlock width={CONTENT_WIDTH} height={CONTENT_WIDTH} borderRadius={8} />
        <XStack gap="$4">
          <SkeletonBlock width={50} height={20} />
          <SkeletonBlock width={50} height={20} />
          <SkeletonBlock width={24} height={20} />
        </XStack>
        <SkeletonBlock width={CONTENT_WIDTH * 0.8} height={14} />
        <SkeletonBlock width={CONTENT_WIDTH * 0.5} height={14} />
      </YStack>
    </Card>
  );
}
