import { Pressable, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Card, Text, Badge } from '@ahub/ui';
import type { WaitlistEntry } from '@ahub/shared/types';

interface WaitlistCardProps {
  entry: WaitlistEntry;
  onConfirm: (entry: WaitlistEntry) => void;
  onLeave: (entry: WaitlistEntry) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function formatTimeRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expirado';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}min`;
}

export function WaitlistCard({ entry, onConfirm, onLeave }: WaitlistCardProps) {
  return (
    <Card variant="flat">
      <YStack gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <Text weight="semibold" size="sm">
            {entry.space.name}
          </Text>
          <Badge variant={entry.notified ? 'warning' : 'info'} size="sm">
            {entry.notified ? 'Vaga disponível!' : `Posição ${entry.position}`}
          </Badge>
        </XStack>

        <XStack gap="$2">
          <Text size="xs" color="secondary">
            {formatDate(entry.date)}
          </Text>
          <Text size="xs" color="secondary">
            · {entry.totalInQueue} na fila
          </Text>
        </XStack>

        {entry.notified && entry.expiresAt && (
          <Text size="xs" color="warning">
            Confirme em {formatTimeRemaining(entry.expiresAt)}
          </Text>
        )}

        <XStack gap="$2" justifyContent="flex-end">
          <Pressable
            onPress={() => onLeave(entry)}
            style={[styles.btn, styles.leaveBtn]}
          >
            <Text size="xs" color="secondary">
              Sair da fila
            </Text>
          </Pressable>
          {entry.notified && (
            <Pressable
              onPress={() => onConfirm(entry)}
              style={[styles.btn, styles.confirmBtn]}
            >
              <Text size="xs" style={{ color: '#FFFFFF' }} weight="semibold">
                Confirmar vaga
              </Text>
            </Pressable>
          )}
        </XStack>
      </YStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  leaveBtn: {
    backgroundColor: '#F3F4F6',
  },
  confirmBtn: {
    backgroundColor: '#22C55E',
  },
});
