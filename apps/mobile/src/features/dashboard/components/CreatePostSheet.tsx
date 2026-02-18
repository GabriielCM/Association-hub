import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { YStack, XStack } from 'tamagui';
import * as ImagePicker from 'expo-image-picker';

import { Text, Icon } from '@ahub/ui';
import X from 'phosphor-react-native/src/icons/X';
import ImageSquare from 'phosphor-react-native/src/icons/ImageSquare';
import { useCreatePost } from '../hooks/useFeedMutations';
import { useDashboardTheme } from '../hooks/useDashboardTheme';

const MAX_DESCRIPTION_LENGTH = 500;

interface CreatePostSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function CreatePostSheet({ visible, onClose }: CreatePostSheetProps) {
  const dt = useDashboardTheme();
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');

  const createPost = useCreatePost();

  const reset = () => {
    setDescription('');
    setImageUri(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled) return;
    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageMime(asset.mimeType || 'image/jpeg');
  };

  const handleSubmit = () => {
    if (!description.trim()) return;

    const formData = new FormData();
    formData.append('description', description.trim());

    if (imageUri) {
      formData.append('image', {
        uri: imageUri,
        type: imageMime,
        name: 'post.jpg',
      } as any);
    }

    createPost.mutate(formData, {
      onSuccess: () => handleClose(),
      onError: (error) => {
        const msg =
          (error as any)?.response?.data?.error?.message || error.message;
        Alert.alert('Erro ao publicar', msg || 'Tente novamente.');
      },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={[styles.overlay, { backgroundColor: dt.overlayBg }]} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ justifyContent: 'flex-end' }}
        >
          <Pressable
            style={[styles.sheet, { backgroundColor: dt.sheetBg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <YStack gap="$4" padding="$4">
              <XStack
                alignItems="center"
                justifyContent="space-between"
              >
                <Pressable onPress={handleClose}>
                  <Text color="secondary" size="sm">
                    Cancelar
                  </Text>
                </Pressable>
                <Text weight="bold" size="lg" style={{ color: dt.textPrimary }}>
                  Novo Post
                </Text>
                <Pressable
                  onPress={handleSubmit}
                  disabled={!description.trim() || createPost.isPending}
                >
                  {createPost.isPending ? (
                    <ActivityIndicator size="small" color={dt.textSecondary} />
                  ) : (
                    <Text
                      color={description.trim() ? 'accent' : 'secondary'}
                      weight="semibold"
                      size="sm"
                    >
                      Publicar
                    </Text>
                  )}
                </Pressable>
              </XStack>

              {/* Text input */}
              <TextInput
                value={description}
                onChangeText={(t) =>
                  t.length <= MAX_DESCRIPTION_LENGTH && setDescription(t)
                }
                placeholder="O que voce quer compartilhar?"
                placeholderTextColor={dt.inputPlaceholder}
                multiline
                numberOfLines={4}
                style={[styles.input, { color: dt.inputText }]}
                maxLength={MAX_DESCRIPTION_LENGTH}
                autoFocus
              />

              <XStack
                alignItems="center"
                justifyContent="space-between"
              >
                <Text size="xs" color="secondary">
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </Text>
              </XStack>

              {/* Image preview */}
              {imageUri && (
                <YStack>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => setImageUri(null)}
                    style={styles.removeImageBtn}
                  >
                    <X size={14} color="#FFF" weight="bold" />
                  </Pressable>
                </YStack>
              )}

              {/* Actions */}
              <XStack gap="$3">
                <Pressable
                  onPress={handlePickImage}
                  style={[styles.actionBtn, { borderColor: dt.borderColor }]}
                >
                  <Icon icon={ImageSquare} size="lg" color="secondary" />
                  <Text size="xs" color="secondary">
                    Foto
                  </Text>
                </Pressable>
              </XStack>
            </YStack>
          </Pressable>
        </KeyboardAvoidingView>
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
  input: {
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
});
