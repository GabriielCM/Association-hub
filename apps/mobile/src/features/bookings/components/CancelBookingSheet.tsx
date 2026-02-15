import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { useCancelBooking } from '../hooks/useBookings';
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    backgroundColor: '#F3F4F6',
  },
  cancelBtn: {
    backgroundColor: '#EF4444',
  },
});
