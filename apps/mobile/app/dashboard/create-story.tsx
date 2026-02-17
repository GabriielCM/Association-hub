import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  View,
} from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { Text, Icon } from '@ahub/ui';
import { Camera } from '@ahub/ui/src/icons';
import ImageSquare from 'phosphor-react-native/src/icons/ImageSquare';
import PencilSimple from 'phosphor-react-native/src/icons/PencilSimple';
import {
  useCreateTextStory,
  useCreateMediaStory,
} from '@/features/dashboard/hooks/useStoryMutations';

const BG_COLORS = [
  '#6366F1',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#EF4444',
  '#8B5CF6',
  '#14B8A6',
];

const MAX_TEXT_LENGTH = 280;

export default function CreateStoryScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'choose' | 'text'>('choose');
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);

  const createTextStory = useCreateTextStory();
  const createMediaStory = useCreateMediaStory();

  const isPending = createTextStory.isPending || createMediaStory.isPending;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [9, 16],
    });

    if (result.canceled) return;
    const asset = result.assets[0];

    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || 'story.jpg',
    } as any);

    createMediaStory.mutate(formData, {
      onSuccess: () => router.back(),
    });
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [9, 16],
    });

    if (result.canceled) return;
    const asset = result.assets[0];

    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || 'story.jpg',
    } as any);

    createMediaStory.mutate(formData, {
      onSuccess: () => router.back(),
    });
  };

  const handleCreateTextStory = () => {
    if (!text.trim()) return;
    createTextStory.mutate(
      { type: 'TEXT', text: text.trim(), background_color: bgColor },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
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
          {mode === 'text' ? 'Story de Texto' : 'Criar Story'}
        </Text>
        {mode === 'text' ? (
          <Pressable
            onPress={handleCreateTextStory}
            disabled={!text.trim() || isPending}
          >
            {isPending ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text
                color={text.trim() ? 'accent' : 'secondary'}
                weight="semibold"
              >
                Publicar
              </Text>
            )}
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </XStack>

      {mode === 'choose' ? (
        <YStack padding="$4" gap="$3">
          <Pressable
            style={styles.optionBtn}
            onPress={handleCamera}
            disabled={isPending}
          >
            <XStack alignItems="center" gap="$3">
              <Icon icon={Camera} size="xl" color="primary" />
              <YStack>
                <Text weight="semibold">Camera</Text>
                <Text size="xs" color="secondary">
                  Tire uma foto agora
                </Text>
              </YStack>
            </XStack>
          </Pressable>

          <Pressable
            style={styles.optionBtn}
            onPress={handlePickImage}
            disabled={isPending}
          >
            <XStack alignItems="center" gap="$3">
              <Icon icon={ImageSquare} size="xl" color="primary" />
              <YStack>
                <Text weight="semibold">Galeria</Text>
                <Text size="xs" color="secondary">
                  Escolha da galeria
                </Text>
              </YStack>
            </XStack>
          </Pressable>

          <Pressable
            style={styles.optionBtn}
            onPress={() => setMode('text')}
            disabled={isPending}
          >
            <XStack alignItems="center" gap="$3">
              <Icon icon={PencilSimple} size="xl" color="primary" />
              <YStack>
                <Text weight="semibold">Texto</Text>
                <Text size="xs" color="secondary">
                  Crie um story de texto
                </Text>
              </YStack>
            </XStack>
          </Pressable>

          {isPending && (
            <YStack alignItems="center" padding="$4">
              <ActivityIndicator />
              <Text size="xs" color="secondary">
                Enviando...
              </Text>
            </YStack>
          )}
        </YStack>
      ) : (
        <YStack padding="$4" gap="$4" flex={1}>
          {/* Preview */}
          <YStack
            backgroundColor={bgColor as any}
            borderRadius="$4"
            padding="$4"
            flex={1}
            maxHeight={300}
            alignItems="center"
            justifyContent="center"
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 20,
                textAlign: 'center',
              }}
            >
              {text || 'Seu texto aqui...'}
            </Text>
          </YStack>

          {/* Color picker */}
          <XStack gap="$2" justifyContent="center">
            {BG_COLORS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setBgColor(color)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  bgColor === color && styles.colorActive,
                ]}
              />
            ))}
          </XStack>

          {/* Input */}
          <YStack gap="$1">
            <TextInput
              value={text}
              onChangeText={(t) => t.length <= MAX_TEXT_LENGTH && setText(t)}
              placeholder="Digite seu texto..."
              multiline
              numberOfLines={3}
              style={styles.input}
              maxLength={MAX_TEXT_LENGTH}
              autoFocus
            />
            <Text size="xs" color="secondary" style={{ textAlign: 'right' }}>
              {text.length}/{MAX_TEXT_LENGTH}
            </Text>
          </YStack>

          {/* Back button */}
          <Pressable onPress={() => setMode('choose')}>
            <Text color="accent" size="sm">
              ← Voltar as opcoes
            </Text>
          </Pressable>
        </YStack>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  optionBtn: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorActive: {
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
});
