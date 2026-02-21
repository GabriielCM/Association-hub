import { useState } from 'react';
import { TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Button, Card, Icon } from '@ahub/ui';
import { Star } from '@ahub/ui/src/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview } from '../api/store.api';
import { storeKeys } from '../hooks/useCategories';
import { useStoreTheme } from '../hooks/useStoreTheme';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const st = useStoreTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { rating: number; comment?: string }) =>
      createReview(productId, { ...data, orderId: '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeKeys.reviews(productId) });
      setRating(0);
      setComment('');
      onSuccess?.();
      Alert.alert('Avaliação enviada', 'Sua avaliação será analisada antes de ser publicada.');
    },
    onError: (error: Error) => {
      Alert.alert('Erro', error.message || 'Não foi possível enviar a avaliação.');
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Atenção', 'Selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    const trimmed = comment.trim();
    mutation.mutate(trimmed ? { rating, comment: trimmed } : { rating });
  };

  return (
    <Card
      variant="flat"
      {...(st.cardBg ? {
        backgroundColor: st.cardBg,
        borderWidth: 1,
        borderColor: st.cardBorder,
        shadowOpacity: 0,
      } : {})}
    >
      <YStack gap="$3">
        <Text weight="semibold" size="sm" style={{ color: st.textPrimary }}>
          Deixe sua avaliação
        </Text>

        {/* Interactive stars */}
        <XStack gap="$2" justifyContent="center">
          {Array.from({ length: 5 }, (_, i) => (
            <Pressable
              key={i}
              onPress={() => setRating(i + 1)}
              hitSlop={4}
            >
              <Icon
                icon={Star}
                size={32}
                color={i < rating ? st.starFilled : st.starEmpty}
                weight={i < rating ? 'fill' : 'regular'}
              />
            </Pressable>
          ))}
        </XStack>

        {rating > 0 && (
          <Text size="xs" align="center" style={{ color: st.textSecondary }}>
            {rating === 1
              ? 'Péssimo'
              : rating === 2
                ? 'Ruim'
                : rating === 3
                  ? 'Regular'
                  : rating === 4
                    ? 'Bom'
                    : 'Excelente'}
          </Text>
        )}

        {/* Comment */}
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Conte sua experiência (opcional)"
          placeholderTextColor={st.inputPlaceholder}
          multiline
          maxLength={500}
          style={[styles.input, {
            borderColor: st.inputBorder,
            color: st.inputText,
            backgroundColor: st.inputBg,
          }]}
        />
        <Text size="xs" align="right" style={{ color: st.textSecondary }}>
          {comment.length}/500
        </Text>

        <Button
          onPress={handleSubmit}
          disabled={rating === 0 || mutation.isPending}
          size="sm"
        >
          {mutation.isPending ? 'Enviando...' : 'Enviar avaliação'}
        </Button>
      </YStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
