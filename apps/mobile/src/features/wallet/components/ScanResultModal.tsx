import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { YStack } from 'tamagui';
import { Text, Heading, Button } from '@ahub/ui';
import type { QrScanResult } from '@ahub/shared/types';

interface ScanResultModalProps {
  result: QrScanResult | null;
  visible: boolean;
  onClose: () => void;
  onAction?: (result: QrScanResult) => void;
}

const TYPE_LABELS: Record<string, string> = {
  member_card: 'Carteirinha de Membro',
  event_checkin: 'Check-in de Evento',
  user_transfer: 'Transferência',
  pdv_payment: 'Pagamento PDV',
};

const TYPE_ICONS: Record<string, string> = {
  member_card: '🪪',
  event_checkin: '📍',
  user_transfer: '💸',
  pdv_payment: '🏪',
};

export function ScanResultModal({
  result,
  visible,
  onClose,
  onAction,
}: ScanResultModalProps) {
  if (!result) return null;

  const icon = TYPE_ICONS[result.type] ?? '📱';
  const label = TYPE_LABELS[result.type] ?? result.type;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouch} onPress={onClose} />
        <View style={styles.sheet}>
          <YStack gap="$4" padding="$4" alignItems="center">
            <Text style={{ fontSize: 48 }}>{icon}</Text>
            <Heading level={4}>{label}</Heading>

            {result.valid ? (
              <YStack gap="$2" alignItems="center">
                <View style={styles.successBadge}>
                  <Text style={styles.successText}>Válido</Text>
                </View>
                {result.action && (
                  <Text color="secondary" size="sm" align="center">
                    {result.action}
                  </Text>
                )}
              </YStack>
            ) : (
              <YStack gap="$2" alignItems="center">
                <View style={styles.errorBadge}>
                  <Text style={styles.errorText}>Inválido</Text>
                </View>
                {result.error && (
                  <Text color="error" size="sm" align="center">
                    {result.error}
                  </Text>
                )}
              </YStack>
            )}

            <YStack gap="$2" width="100%" marginTop="$2">
              {result.valid && onAction && (
                <Button onPress={() => onAction(result)}>
                  Continuar
                </Button>
              )}
              <Button variant="outline" onPress={onClose}>
                Fechar
              </Button>
            </YStack>
          </YStack>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 300,
  },
  successBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  successText: {
    color: '#16A34A',
    fontWeight: '600',
    fontSize: 14,
  },
  errorBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  errorText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 14,
  },
});
