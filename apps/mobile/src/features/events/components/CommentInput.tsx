import { useState, useCallback } from 'react';
import { TextInput, Pressable, Image, Alert, StyleSheet } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Button } from '@ahub/ui';
import ImageSquare from 'phosphor-react-native/src/icons/ImageSquare';
import X from 'phosphor-react-native/src/icons/X';
import * as ImagePicker from 'expo-image-picker';
import type { CommentInput as CommentInputData } from '../hooks/useEventMutations';

interface CommentInputProps {
  onSubmit: (data: CommentInputData) => void;
  isLoading?: boolean;
}

export function CommentInput({ onSubmit, isLoading }: CommentInputProps) {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    if (selectedImage) {
      onSubmit({
        contentType: 'IMAGE',
        localImageUri: selectedImage,
        text: text.trim() || undefined,
      });
      setSelectedImage(null);
      setText('');
    } else {
      const trimmed = text.trim();
      if (!trimmed) return;
      onSubmit({ text: trimmed, contentType: 'TEXT' });
      setText('');
    }
  }, [text, selectedImage, onSubmit]);

  const handlePickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permissao necessaria',
        'Precisamos de acesso a galeria para enviar imagens.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const canSend = selectedImage || text.trim().length > 0;

  return (
    <YStack>
      {selectedImage && (
        <XStack padding="$2" paddingHorizontal="$3">
          <View position="relative">
            <Image
              source={{ uri: selectedImage }}
              style={styles.preview}
              resizeMode="cover"
            />
            <Pressable onPress={handleRemoveImage} style={styles.removeBtn}>
              <X size={14} color="#FFFFFF" weight="bold" />
            </Pressable>
          </View>
        </XStack>
      )}

      <XStack gap="$2" alignItems="flex-end" padding="$3">
        <Pressable onPress={handlePickImage} style={styles.imageBtn}>
          <ImageSquare size={24} color="#888" />
        </Pressable>

        <TextInput
          style={styles.input}
          placeholder={
            selectedImage ? 'Adicionar legenda...' : 'Escreva um comentario...'
          }
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <Button
          variant="primary"
          size="sm"
          onPress={handleSubmit}
          disabled={!canSend || isLoading}
        >
          Enviar
        </Button>
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  imageBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
