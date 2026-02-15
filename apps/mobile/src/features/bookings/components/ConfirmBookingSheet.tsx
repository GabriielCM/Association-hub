import { useState } from 'react';
import { Modal, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { useCreateBooking } from '../hooks/useBookings';
import type { SpaceDetail } from '@ahub/shared/types';

interface ConfirmBookingSheetProps {
  visible: boolean;
  space: SpaceDetail;
  date: string;
  shift?: string;
  startTime?: string;
  endTime?: string;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function ConfirmBookingSheet({
  visible,
  space,
  date,
  shift,
  startTime,
  endTime,
  onClose,
  onSuccess,
}: ConfirmBookingSheetProps) {
  const createBooking = useCreateBooking();
  const [error, setError] = useState<string | null>(null);

  const periodLabel =
    space.periodType === 'DAY'
      ? 'Dia inteiro'
      : space.periodType === 'SHIFT' && shift
        ? `Turno: ${shift}`
        : startTime && endTime
          ? `${startTime} - ${endTime}`
          : '';

  const feeLabel =
    space.fee != null && space.fee > 0
      ? `R$ ${(space.fee / 100).toFixed(2)}`
      : 'Gratuito';

  const handleConfirm = () => {
    setError(null);
    createBooking.mutate(
      {
        spaceId: space.id,
        date,
        periodType: space.periodType,
        ...(shift != null && { shiftName: shift }),
        ...(startTime != null && { startTime }),
        ...(endTime != null && { endTime }),
      },
      {
        onSuccess: (result) => {
          onSuccess(result.id);
        },
        onError: (err) => {
          setError(
            err instanceof Error ? err.message : 'Erro ao criar reserva',
          );
        },
      },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <YStack gap="$4" padding="$4">
            <YStack gap="$1" alignItems="center">
              <Text weight="bold" size="lg">
                Confirmar Reserva
              </Text>
              <Text size="xs" color="secondary">
                Sua reserva ficará pendente até aprovação
              </Text>
            </YStack>

            <YStack gap="$3" padding="$3" style={styles.summaryCard}>
              <XStack justifyContent="space-between">
                <Text size="sm" color="secondary">Espaço</Text>
                <Text size="sm" weight="medium">{space.name}</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text size="sm" color="secondary">Data</Text>
                <Text size="sm" weight="medium">{formatDate(date)}</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text size="sm" color="secondary">Período</Text>
                <Text size="sm" weight="medium">{periodLabel}</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text size="sm" color="secondary">Taxa</Text>
                <Text size="sm" weight="semibold" color="accent">{feeLabel}</Text>
              </XStack>
            </YStack>

            {error && (
              <Text size="sm" color="error" style={styles.errorText}>
                {error}
              </Text>
            )}

            <XStack gap="$3">
              <Pressable
                onPress={onClose}
                style={[styles.button, styles.cancelBtn]}
                disabled={createBooking.isPending}
              >
                <Text size="sm" weight="medium">
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={[styles.button, styles.confirmBtn]}
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{ color: '#FFFFFF' }}
                  >
                    Confirmar
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
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
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
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  confirmBtn: {
    backgroundColor: '#3B82F6',
  },
});
