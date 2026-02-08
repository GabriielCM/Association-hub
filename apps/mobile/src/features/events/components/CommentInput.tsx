import { useState, useCallback } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { XStack } from 'tamagui';
import { Button } from '@ahub/ui';

interface CommentInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

export function CommentInput({ onSubmit, isLoading }: CommentInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  }, [text, onSubmit]);

  return (
    <XStack gap="$2" alignItems="flex-end" padding="$3">
      <TextInput
        style={styles.input}
        placeholder="Escreva um comentario..."
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
        disabled={!text.trim() || isLoading}
      >
        Enviar
      </Button>
    </XStack>
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
});
