import { FlatList, Pressable } from 'react-native';
import { YStack } from 'tamagui';
import { useRouter } from 'expo-router';

import { Text, Avatar } from '@ahub/ui';
import { useStories } from '../hooks/useDashboard';
import type { StoryUserListItem } from '@ahub/shared/types';

function AddStoryButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ marginRight: 12 }}>
      <YStack alignItems="center" gap="$1">
        <YStack
          width={60}
          height={60}
          borderRadius={30}
          backgroundColor="$accent"
          alignItems="center"
          justifyContent="center"
        >
          <Text size="2xl" color="white">
            +
          </Text>
        </YStack>
        <Text size="xs" color="secondary" numberOfLines={1}>
          Seu story
        </Text>
      </YStack>
    </Pressable>
  );
}

function StoryAvatar({
  item,
  onPress,
}: {
  item: StoryUserListItem;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ marginRight: 12 }}>
      <YStack alignItems="center" gap="$1">
        <YStack
          borderWidth={2}
          borderColor={item.has_unseen ? '$accent' : '$borderColor'}
          borderRadius={32}
          padding="$0.5"
        >
          <Avatar
            src={item.avatar_url}
            name={item.username}
            size="lg"
          />
        </YStack>
        <Text
          size="xs"
          color="secondary"
          numberOfLines={1}
          style={{ maxWidth: 60, textAlign: 'center' }}
        >
          {item.username}
        </Text>
      </YStack>
    </Pressable>
  );
}

export function StoriesRow() {
  const router = useRouter();
  const { data: storiesData } = useStories();

  const stories = storiesData?.stories ?? [];

  return (
    <FlatList
      data={stories}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.user_id}
      ListHeaderComponent={
        <AddStoryButton
          onPress={() => router.push('/dashboard/create-story' as any)}
        />
      }
      renderItem={({ item }) => (
        <StoryAvatar
          item={item}
          onPress={() =>
            router.push(
              `/dashboard/story-viewer?userId=${item.user_id}&username=${encodeURIComponent(item.username)}&avatarUrl=${encodeURIComponent(item.avatar_url || '')}` as any,
            )
          }
        />
      )}
      contentContainerStyle={{ paddingRight: 16 }}
    />
  );
}
