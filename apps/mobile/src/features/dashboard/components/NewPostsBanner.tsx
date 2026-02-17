import { Pressable } from 'react-native';
import { XStack } from 'tamagui';

import { Text } from '@ahub/ui';
import { useHasNewPosts, useNewPostsCount, useDashboardStore } from '@/stores/dashboard.store';

interface NewPostsBannerProps {
  onPress: () => void;
}

export function NewPostsBanner({ onPress }: NewPostsBannerProps) {
  const hasNew = useHasNewPosts();
  const count = useNewPostsCount();
  const resetNewPosts = useDashboardStore((s) => s.resetNewPosts);

  if (!hasNew || count === 0) return null;

  const handlePress = () => {
    resetNewPosts();
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <XStack
        backgroundColor="$accent"
        paddingVertical="$2"
        paddingHorizontal="$4"
        borderRadius="$4"
        alignItems="center"
        justifyContent="center"
        alignSelf="center"
        marginVertical="$2"
      >
        <Text color="white" size="sm" weight="semibold">
          {count} {count === 1 ? 'novo post' : 'novos posts'}
        </Text>
      </XStack>
    </Pressable>
  );
}
