import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, ActivityIndicator, Platform, View } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, NativeViewFallback } from '@ahub/ui';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useCancelBooking } from '../hooks/useBookings';
import { colors } from '@ahub/ui/themes';
import type { BookingListItem } from '@ahub/shared/types';

interface CancelBookingSheetProps {
  visible: boolean;
  booking: BookingListItem | null;
  onClose: () => void;
  onCancelled: () => void;
}

export function CancelBookingSheet({
  visible,
  booking,
  onClose,
  onCancelled,
}: CancelBookingSheetProps) {
  const cancelBooking = useCancelBooking();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    if (!booking) return;
    setError(null);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    cancelBooking.mutate(
      {
        id: booking.id,
        ...(reason.trim() && { reason: reason.trim() }),
      },
      {
        onSuccess: () => {
          setReason('');
          onCancelled();
        },
        onError: (err) => {
          setError(
            err instanceof Error ? err.message : 'Erro ao cancelar reserva',
          );
        },
      },
    );
  };

  if (!booking) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <NativeViewFallback
            fallback={
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.85)' }]} />
            }
          >
            <BlurView intensity={16} tint="light" style={StyleSheet.absoluteFill} />
          </NativeViewFallback>
          <YStack gap="$4" padding="$4">
            <YStack gap="$1" alignItems="center">
              <Text weight="bold" size="lg">
                Cancelar Reserva
              </Text>
              <Text size="xs" color="secondary">
                {booking.space.name} - {new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR')}
              </Text>
            </YStack>

            <YStack gap="$2">
              <Text size="sm" color="secondary">
                Motivo (opcional)
              </Text>
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Informe o motivo do cancelamento..."
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            </YStack>

            {error && (
              <Text size="sm" color="error" style={styles.errorText}>
                {error}
              </Text>
            )}

            <XStack gap="$3">
              <Pressable
                onPress={onClose}
                style={[styles.button, styles.backBtn]}
                disabled={cancelBooking.isPending}
              >
                <Text size="sm" weight="medium">
                  Voltar
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCancel}
                style={[styles.button, styles.cancelBtn]}
                disabled={cancelBooking.isPending}
              >
                {cancelBooking.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text size="sm" weight="semibold" style={{ color: '#FFFFFF' }}>
                    Cancelar Reserva
                  </Text>
                )}
              </Pressable>
            </XStack>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
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
  errorText: {
    textAlign: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  cancelBtn: {
    backgroundColor: colors.errorDark,
  },
});
