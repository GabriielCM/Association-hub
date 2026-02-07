import { View, StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import type { CardUsageLog } from '@ahub/shared/types';

interface CardHistoryItemProps {
  log: CardUsageLog;
}

const typeConfig: Record<string, { icon: string; label: string }> = {
  CHECKIN: { icon: '🏢', label: 'Check-in' },
  BENEFIT_USED: { icon: '✨', label: 'Benefício' },
  EVENT_VALIDATION: { icon: '📅', label: 'Evento' },
  QR_SCANNED: { icon: '📱', label: 'QR Escaneado' },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CardHistoryItem({ log }: CardHistoryItemProps) {
  const config = typeConfig[log.type] || { icon: '📋', label: log.type };

  return (
    <XStack
      padding="$3"
      gap="$3"
      alignItems="center"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>

      <YStack flex={1} gap={2}>
        <Text weight="medium" size="sm">
          {config.label}
        </Text>
        {log.partner && (
          <Text color="secondary" size="xs">
            {log.partner.name}
          </Text>
        )}
        {log.location && !log.partner && (
          <Text color="secondary" size="xs">
            {log.location}
          </Text>
        )}
      </YStack>

      <Text color="secondary" size="xs">
        {formatDate(log.scannedAt)}
      </Text>
    </XStack>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
  },
});
