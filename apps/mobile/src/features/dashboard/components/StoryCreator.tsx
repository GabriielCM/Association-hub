import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  View,
} from 'react-native';
import { YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { Text, Icon } from '@ahub/ui';
import { Camera } from '@ahub/ui/src/icons';
import ImageSquare from 'phosphor-react-native/src/icons/ImageSquare';
import PencilSimple from 'phosphor-react-native/src/icons/PencilSimple';
import {
  useCreateTextStory,
  useCreateMediaStory,
} from '../hooks/useStoryMutations';
import { useDashboardTheme } from '../hooks/useDashboardTheme';

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

interface StoryCreatorProps {
  visible: boolean;
  onClose: () => void;
}

export function StoryCreator({ visible, onClose }: StoryCreatorProps) {
  const router = useRouter();
  const dt = useDashboardTheme();
  const [mode, setMode] = useState<'choose' | 'text'>('choose');
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);

  const createTextStory = useCreateTextStory();
  const createMediaStory = useCreateMediaStory();

  const reset = () => {
    setMode('choose');
    setText('');
    setBgColor(BG_COLORS[0]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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
      onSuccess: () => handleClose(),
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
      onSuccess: () => handleClose(),
    });
  };

  const handleCreateTextStory = () => {
    if (!text.trim()) return;

    createTextStory.mutate(
      {
        type: 'TEXT',
        text: text.trim(),
        background_color: bgColor,
      },
      { onSuccess: () => handleClose() },
    );
  };

  const isPending = createTextStory.isPending || createMediaStory.isPending;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={[styles.overlay, { backgroundColor: dt.overlayBg }]} onPress={handleClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: dt.sheetBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          {mode === 'choose' ? (
            <YStack gap="$4" padding="$4">
              <YStack gap="$1" alignItems="center">
                <Text weight="bold" size="lg" style={{ color: dt.textPrimary }}>
                  Criar Story
                </Text>
                <Text size="xs" color="secondary">
                  Escolha como deseja criar seu story
                </Text>
              </YStack>

              <YStack gap="$3">
                <Pressable
                  style={[styles.optionBtn, { borderColor: dt.borderColor }]}
                  onPress={handleCamera}
                  disabled={isPending}
                >
                  <XStack alignItems="center" gap="$3">
                    <Icon icon={Camera} size="xl" color="primary" />
                    <YStack>
                      <Text weight="semibold" style={{ color: dt.textPrimary }}>Camera</Text>
                      <Text size="xs" color="secondary">
                        Tire uma foto agora
                      </Text>
                    </YStack>
                  </XStack>
                </Pressable>

                <Pressable
                  style={[styles.optionBtn, { borderColor: dt.borderColor }]}
                  onPress={handlePickImage}
                  disabled={isPending}
                >
                  <XStack alignItems="center" gap="$3">
                    <Icon icon={ImageSquare} size="xl" color="primary" />
                    <YStack>
                      <Text weight="semibold" style={{ color: dt.textPrimary }}>Galeria</Text>
                      <Text size="xs" color="secondary">
                        Escolha da galeria
                      </Text>
                    </YStack>
                  </XStack>
                </Pressable>

                <Pressable
                  style={[styles.optionBtn, { borderColor: dt.borderColor }]}
                  onPress={() => setMode('text')}
                  disabled={isPending}
                >
                  <XStack alignItems="center" gap="$3">
                    <Icon icon={PencilSimple} size="xl" color="primary" />
                    <YStack>
                      <Text weight="semibold" style={{ color: dt.textPrimary }}>Texto</Text>
                      <Text size="xs" color="secondary">
                        Crie um story de texto
                      </Text>
                    </YStack>
                  </XStack>
                </Pressable>
              </YStack>

              {isPending && (
                <YStack alignItems="center" padding="$2">
                  <ActivityIndicator color={dt.textSecondary} />
                  <Text size="xs" color="secondary">
                    Enviando...
                  </Text>
                </YStack>
              )}

              <Pressable onPress={handleClose} style={styles.cancelBtn}>
                <Text size="sm" color="secondary">
                  Cancelar
                </Text>
              </Pressable>
            </YStack>
          ) : (
            <YStack gap="$4" padding="$4">
              {/* Text story editor */}
              <XStack
                alignItems="center"
                justifyContent="space-between"
              >
                <Pressable onPress={() => setMode('choose')}>
                  <Text color="accent" size="sm">
                    ← Voltar
                  </Text>
                </Pressable>
                <Text weight="bold" size="lg" style={{ color: dt.textPrimary }}>
                  Story de Texto
                </Text>
                <View style={{ width: 50 }} />
              </XStack>

              {/* Preview */}
              <YStack
                backgroundColor={bgColor as any}
                borderRadius="$4"
                padding="$4"
                height={200}
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  style={{ color: '#FFFFFF', fontSize: 18, textAlign: 'center' }}
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
                      bgColor === color && [styles.colorCircleActive, { borderColor: dt.isDark ? 'rgba(255,255,255,0.8)' : '#FFFFFF' }],
                    ]}
                  />
                ))}
              </XStack>

              {/* Text input */}
              <YStack gap="$1">
                <TextInput
                  value={text}
                  onChangeText={(t) =>
                    t.length <= MAX_TEXT_LENGTH && setText(t)
                  }
                  placeholder="Digite seu texto..."
                  placeholderTextColor={dt.inputPlaceholder}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, { borderColor: dt.inputBorder, backgroundColor: dt.inputBg, color: dt.inputText }]}
                  maxLength={MAX_TEXT_LENGTH}
                />
                <Text size="xs" color="secondary" style={{ textAlign: 'right' }}>
                  {text.length}/{MAX_TEXT_LENGTH}
                </Text>
              </YStack>

              <Pressable
                onPress={handleCreateTextStory}
                style={[
                  styles.publishBtn,
                  { backgroundColor: dt.accent },
                  (!text.trim() || isPending) && styles.publishBtnDisabled,
                ]}
                disabled={!text.trim() || isPending}
              >
                {isPending ? (
                  <ActivityIndicator color={dt.sendBtnText} />
                ) : (
                  <Text
                    weight="semibold"
                    style={{ color: dt.sendBtnText }}
                  >
                    Publicar Story
                  </Text>
                )}
              </Pressable>
            </YStack>
          )}
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
  optionBtn: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  cancelBtn: {
    alignItems: 'center',
    padding: 12,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorCircleActive: {
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  publishBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  publishBtnDisabled: {
    opacity: 0.5,
  },
});
