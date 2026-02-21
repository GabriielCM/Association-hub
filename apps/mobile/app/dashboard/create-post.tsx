import { useState } from 'react';
import {
  Alert,
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
import { Camera } from '@ahub/ui/src/icons';

import { useDashboardTheme } from '@/features/dashboard/hooks/useDashboardTheme';
import { useCreatePost } from '@/features/dashboard/hooks/useFeedMutations';
import { ImageSquare, X } from 'phosphor-react-native';

const MAX_DESCRIPTION_LENGTH = 500;

export default function CreatePostScreen() {
  const router = useRouter();
  const dt = useDashboardTheme();
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

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Permita o acesso à câmera nas configurações.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
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
      onError: (error) => {
        const msg =
          (error as any)?.response?.data?.error?.message || error.message;
        Alert.alert('Erro ao publicar', msg || 'Tente novamente.');
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: dt.screenBg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          padding="$4"
          style={{ borderBottomWidth: 1, borderBottomColor: dt.borderColor }}
        >
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: dt.textSecondary }}>Cancelar</Text>
          </Pressable>
          <Text weight="bold" size="lg" style={{ color: dt.textPrimary }}>
            Novo Post
          </Text>
          <Pressable
            onPress={handleSubmit}
            disabled={!description.trim() || createPost.isPending}
          >
            {createPost.isPending ? (
              <ActivityIndicator size="small" color={dt.accent} />
            ) : (
              <Text
                weight="semibold"
                style={{
                  color: description.trim() ? dt.accent : dt.textSecondary,
                }}
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
            placeholderTextColor={dt.inputPlaceholder}
            multiline
            style={[styles.input, { color: dt.inputText }]}
            maxLength={MAX_DESCRIPTION_LENGTH}
            autoFocus
          />

          <Text size="xs" style={{ textAlign: 'right', color: dt.textSecondary }}>
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

          <XStack gap="$3">
            <Pressable
              onPress={handleCamera}
              style={[styles.addImageBtn, { borderColor: dt.borderColor, flex: 1 }]}
            >
              <Camera size={22} color={dt.accent} />
              <Text size="sm" style={{ color: dt.accent }}>
                Câmera
              </Text>
            </Pressable>

            <Pressable
              onPress={handlePickImage}
              style={[styles.addImageBtn, { borderColor: dt.borderColor, flex: 1 }]}
            >
              <ImageSquare size={22} color={dt.accent} />
              <Text size="sm" style={{ color: dt.accent }}>
                Galeria
              </Text>
            </Pressable>
          </XStack>
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
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
});
