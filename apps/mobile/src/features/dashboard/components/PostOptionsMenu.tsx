import { Alert, Modal, Pressable, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';

import { Text } from '@ahub/ui';
import { useAuthContext } from '@/providers/AuthProvider';
import { useDeletePost } from '../hooks/useFeedMutations';
import { useDashboardTheme } from '../hooks/useDashboardTheme';
import type { FeedPost } from '@ahub/shared/types';

interface PostOptionsMenuProps {
  visible: boolean;
  post: FeedPost | null;
  onClose: () => void;
  onReport?: (postId: string) => void;
  onDeleteSuccess?: () => void;
}

export function PostOptionsMenu({
  visible,
  post,
  onClose,
  onReport,
  onDeleteSuccess,
}: PostOptionsMenuProps) {
  const { user } = useAuthContext();
  const deletePost = useDeletePost();
  const dt = useDashboardTheme();

  if (!post) return null;

  const isOwn = user?.id === post.author.id;

  const handleDelete = () => {
    onClose();
    Alert.alert(
      'Excluir post?',
      'Esta acao nao pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deletePost.mutate(post.id, {
              onSuccess: () => onDeleteSuccess?.(),
            });
          },
        },
      ],
    );
  };

  const handleReport = () => {
    onClose();
    onReport?.(post.id);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={[styles.overlay, { backgroundColor: dt.overlayBg }]} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: dt.sheetBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <YStack gap="$1" padding="$2">
            {isOwn ? (
              <>
                <Pressable style={styles.option} onPress={handleDelete}>
                  <Text color="error" weight="semibold">
                    Excluir post
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable style={styles.option} onPress={handleReport}>
                  <Text color="error" weight="semibold">
                    Denunciar
                  </Text>
                </Pressable>
              </>
            )}

            <Pressable style={styles.option} onPress={onClose}>
              <Text color="secondary">Cancelar</Text>
            </Pressable>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
});
