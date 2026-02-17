import { Pressable, StyleSheet, View } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Heading, Card, Icon } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import type { WalletDashboard } from '@ahub/shared/types';
import { QrCode } from '@ahub/ui/src/icons';

interface WalletCardProps {
  dashboard: WalletDashboard;
  onQrPress?: () => void;
}

export function WalletCard({ dashboard, onQrPress }: WalletCardProps) {
  const { balance, summary } = dashboard;

  return (
    <View style={styles.container}>
      <YStack gap={16} padding={24}>
        {/* Balance */}
        <YStack alignItems="center" gap={4}>
          <Text style={styles.balanceLabel}>Saldo disponível</Text>
          <Heading level={1} style={styles.balance}>
            {formatPoints(balance)} pts
          </Heading>
        </YStack>

        {/* QR Mini */}
        {dashboard.qrCode && (
          <Pressable
            onPress={onQrPress}
            style={({ pressed }) => [
              styles.qrButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Icon icon={QrCode} size="md" color="#fff" />
            <Text style={styles.qrText}>Meu QR Code</Text>
          </Pressable>
        )}

        {/* Month Summary */}
        <Card variant="flat" style={styles.summaryCard}>
          <XStack justifyContent="space-between" alignItems="center">
            <YStack alignItems="center" flex={1}>
              <Text color="success" size="sm" weight="semibold">
                +{formatPoints(summary.earned)}
              </Text>
              <Text color="secondary" size="xs">Ganhou</Text>
            </YStack>
            <View style={styles.divider} />
            <YStack alignItems="center" flex={1}>
              <Text color="error" size="sm" weight="semibold">
                -{formatPoints(summary.spent)}
              </Text>
              <Text color="secondary" size="xs">Gastou</Text>
            </YStack>
            <View style={styles.divider} />
            <YStack alignItems="center" flex={1}>
              <Text weight="semibold" size="sm">
                {summary.net >= 0 ? '+' : ''}{formatPoints(summary.net)}
              </Text>
              <Text color="secondary" size="xs">Líquido</Text>
            </YStack>
          </XStack>
        </Card>
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#7C3AED',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  balance: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'center',
  },
  qrText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
