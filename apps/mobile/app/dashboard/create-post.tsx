import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { Text, Icon } from '@ahub/ui';
import X from 'phosphor-react-native/src/icons/X';
import ImageSquare from 'phosphor-react-native/src/icons/ImageSquare';
import { useCreatePost } from '@/features/dashboard/hooks/useFeedMutations';

const MAX_DESCRIPTION_LENGTH = 500;

export default function CreatePostScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');

  const createPost = useCreatePost();

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
      onSuccess: () => router.back(),
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          padding="$4"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Pressable onPress={() => router.back()}>
            <Text color="secondary">Cancelar</Text>
          </Pressable>
          <Text weight="bold" size="lg">
            Novo Post
          </Text>
          <Pressable
            onPress={handleSubmit}
            disabled={!description.trim() || createPost.isPending}
          >
            {createPost.isPending ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text
                color={description.trim() ? 'accent' : 'secondary'}
                weight="semibold"
              >
                Publicar
              </Text>
            )}
          </Pressable>
        </XStack>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <TextInput
            value={description}
            onChangeText={(t) =>
              t.length <= MAX_DESCRIPTION_LENGTH && setDescription(t)
            }
            placeholder="O que voce quer compartilhar?"
            multiline
            style={styles.input}
            maxLength={MAX_DESCRIPTION_LENGTH}
            autoFocus
          />

          <Text size="xs" color="secondary" style={{ textAlign: 'right' }}>
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </Text>

          {imageUri && (
            <YStack>
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <Pressable
                onPress={() => setImageUri(null)}
                style={styles.removeBtn}
              >
                <X size={14} color="#FFF" weight="bold" />
              </Pressable>
            </YStack>
          )}

          <Pressable onPress={handlePickImage} style={styles.addImageBtn}>
            <Icon icon={ImageSquare} size="lg" color="secondary" />
            <Text size="sm" color="secondary">
              Adicionar foto
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderStyle: 'dashed',
  },
});
