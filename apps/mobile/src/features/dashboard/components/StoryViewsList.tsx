import { FlatList, Modal, Pressable, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';

import { Text, Avatar } from '@ahub/ui';
import type { StoryView } from '@ahub/shared/types';

interface StoryViewsListProps {
  visible: boolean;
  views: StoryView[];
  totalViews: number;
  onClose: () => void;
}

export function StoryViewsList({
  visible,
  views,
  totalViews,
  onClose,
}: StoryViewsListProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.sheet}
          onPress={(e) => e.stopPropagation()}
        >
          <YStack gap="$3" padding="$4" maxHeight="70%">
            <XStack alignItems="center" justifyContent="space-between">
              <Text weight="bold" size="lg">
                Visualizacoes
              </Text>
              <Text size="sm" color="secondary">
                {totalViews} {totalViews === 1 ? 'pessoa' : 'pessoas'}
              </Text>
            </XStack>

            <FlatList
              data={views}
              keyExtractor={(item) => item.user_id}
              renderItem={({ item }) => (
                <XStack
                  alignItems="center"
                  gap="$2"
                  paddingVertical="$2"
                >
                  <Avatar
                    src={item.avatar_url}
                    name={item.username}
                    size="sm"
                  />
                  <YStack flex={1}>
                    <Text weight="semibold" size="sm">
                      {item.username}
                    </Text>
                    <Text size="xs" color="secondary">
                      {formatViewTime(item.viewed_at)}
                    </Text>
                  </YStack>
                </XStack>
              )}
              ListEmptyComponent={
                <YStack padding="$4" alignItems="center">
                  <Text color="secondary" size="sm">
                    Nenhuma visualizacao ainda
                  </Text>
                </YStack>
              }
            />
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function formatViewTime(date: Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    maxHeight: '70%',
  },
});
