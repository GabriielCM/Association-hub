import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { YStack } from 'tamagui';
import { Text, Heading, Button, Avatar } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
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
  if (!result) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.backdrop}>
          <Pressable style={styles.backdropTouch} onPress={onClose} />
          <View style={styles.sheet}>
            <YStack gap="$4" padding="$4" alignItems="center">
              <Text style={{ fontSize: 48 }}>&#x26A0;&#xFE0F;</Text>
              <Heading level={4}>Erro</Heading>
              <YStack gap="$2" alignItems="center">
                <View style={styles.errorBadge}>
                  <Text style={styles.errorText}>Falha na leitura</Text>
                </View>
                <Text color="secondary" size="sm" align="center">
                  Nao foi possivel processar o QR Code. Tente novamente.
                </Text>
              </YStack>
              <YStack gap="$2" width="100%" marginTop="$2">
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

  const icon = TYPE_ICONS[result.type] ?? '📱';
  const label = TYPE_LABELS[result.type] ?? result.type;

  // Extract transfer recipient data
  const transferData = result.type === 'user_transfer' && result.valid
    ? (result.data as { recipient: { id: string; name: string; username?: string; avatarUrl?: string }; senderBalance: number } | undefined)
    : undefined;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouch} onPress={onClose} />
        <View style={styles.sheet}>
          <YStack gap="$4" padding="$4" alignItems="center">
            {transferData ? (
              <>
                <Avatar
                  src={transferData.recipient.avatarUrl}
                  name={transferData.recipient.name}
                  size="xl"
                />
                <YStack alignItems="center" gap={2}>
                  <Heading level={3}>{transferData.recipient.name}</Heading>
                  {transferData.recipient.username && (
                    <Text color="secondary" size="sm">
                      @{transferData.recipient.username}
                    </Text>
                  )}
                </YStack>
                <View style={styles.balanceCard}>
                  <Text color="secondary" size="xs">Seu saldo</Text>
                  <Text weight="bold" size="lg">
                    {formatPoints(transferData.senderBalance)} pts
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 48 }}>{icon}</Text>
                <Heading level={4}>{label}</Heading>

                {result.valid ? (
                  <YStack gap="$2" alignItems="center">
                    <View style={styles.successBadge}>
                      <Text style={styles.successText}>Válido</Text>
                    </View>
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
              </>
            )}

            <YStack gap="$2" width="100%" marginTop="$2">
              {result.valid && onAction && (
                <Button onPress={() => onAction(result)}>
                  {transferData ? 'Transferir pontos' : 'Continuar'}
                </Button>
              )}
              <Button variant="outline" onPress={onClose}>
                {transferData ? 'Cancelar' : 'Fechar'}
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
  balanceCard: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center' as const,
    gap: 2,
  },
});
