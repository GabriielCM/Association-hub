import { View, StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { CARD_HISTORY_ICONS } from '@ahub/ui/src/icons';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';
import type { CardUsageLog } from '@ahub/shared/types';

interface CardHistoryItemProps {
  log: CardUsageLog;
}

const typeConfig: Record<string, { icon: PhosphorIcon; label: string }> = {
  CHECKIN: { icon: CARD_HISTORY_ICONS.CHECKIN, label: 'Check-in' },
  BENEFIT_USED: { icon: CARD_HISTORY_ICONS.BENEFIT_USED, label: 'Benefício' },
  EVENT_VALIDATION: { icon: CARD_HISTORY_ICONS.EVENT_VALIDATION, label: 'Evento' },
  QR_SCANNED: { icon: CARD_HISTORY_ICONS.QR_SCANNED, label: 'QR Escaneado' },
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
  const config = typeConfig[log.type] || { icon: CARD_HISTORY_ICONS.DEFAULT, label: log.type };

  return (
    <XStack
      padding="$3"
      gap="$3"
      alignItems="center"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <View style={styles.iconContainer}>
        <Icon icon={config.icon} size="sm" color="primary" />
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
});
