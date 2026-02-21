import { FlatList, Image, Dimensions, Pressable } from 'react-native';
import { YStack } from 'tamagui';
import { useRouter } from 'expo-router';
import { Text, Icon } from '@ahub/ui';
import { Camera } from '@ahub/ui/src/icons';
import { useProfileTheme } from '../hooks/useProfileTheme';
import { useUserPosts } from '@/features/dashboard/hooks/useDashboard';
import { resolveUploadUrl } from '@/config/constants';
import type { FeedPost } from '@ahub/shared/types';

const COLUMN_COUNT = 3;
const GAP = 2;
const ITEM_SIZE = (Dimensions.get('window').width - GAP * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

interface PostsTabProps {
  userId: string;
}

export function PostsTab({ userId }: PostsTabProps) {
  const router = useRouter();
  const pt = useProfileTheme();
  const { data, fetchNextPage, hasNextPage, isLoading } =
    useUserPosts(userId);

  const posts = data?.pages.flatMap((page) => page.posts)
    .filter((post) => !!post.content.image_url) ?? [];

  if (!isLoading && posts.length === 0) {
    return (
      <YStack alignItems="center" paddingVertical="$8" gap="$3">
        <Icon icon={Camera} size={48} color="muted" weight="duotone" />
        <Text weight="semibold" size="lg" style={{ color: pt.textPrimary }}>
          Nenhum post ainda
        </Text>
        <Text color="secondary" size="sm" align="center" style={{ color: pt.textSecondary, maxWidth: 240 }}>
          Os posts do usuário aparecerão aqui.
        </Text>
      </YStack>
    );
  }

  const renderItem = ({ item }: { item: FeedPost }) => {
    const imageUrl = resolveUploadUrl(item.content.image_url);

    return (
      <Pressable
        style={{ margin: GAP / 2 }}
        onPress={() =>
          router.push({
            pathname: '/dashboard/post/[id]',
            params: { id: item.id, userId },
          } as any)
        }
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: 4 }}
            resizeMode="cover"
          />
        ) : (
          <YStack
            width={ITEM_SIZE}
            height={ITEM_SIZE}
            backgroundColor="$backgroundHover"
            borderRadius={4}
            alignItems="center"
            justifyContent="center"
            padding="$2"
          >
            <Text size="xs" color="secondary" numberOfLines={3} align="center">
              {item.content.description?.slice(0, 60)}
            </Text>
          </YStack>
        )}
      </Pressable>
    );
  };

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={COLUMN_COUNT}
      contentContainerStyle={{ padding: GAP / 2 }}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      scrollEnabled={false}
    />
  );
}
