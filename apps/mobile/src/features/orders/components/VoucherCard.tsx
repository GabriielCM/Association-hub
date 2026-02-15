import { Pressable, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Card, Badge } from '@ahub/ui';
import type { Voucher } from '@ahub/shared/types';

const VOUCHER_STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'secondary' | 'error' }
> = {
  available: { label: 'Disponivel', variant: 'success' },
  used: { label: 'Usado', variant: 'secondary' },
  expired: { label: 'Expirado', variant: 'error' },
};

interface VoucherCardProps {
  voucher: Voucher;
  onPress?: (voucher: Voucher) => void;
}

export function VoucherCard({ voucher, onPress }: VoucherCardProps) {
  const statusConfig = VOUCHER_STATUS_CONFIG[voucher.status] ?? {
    label: voucher.statusLabel,
    variant: 'secondary' as const,
  };

  const expiresDate = voucher.expiresAt
    ? new Date(voucher.expiresAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const content = (
    <Card variant="flat">
      <YStack gap="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <Text weight="semibold" size="sm" numberOfLines={1} flex={1}>
            {voucher.productName}
          </Text>
          <Badge variant={statusConfig.variant} size="sm">
            {statusConfig.label}
          </Badge>
        </XStack>

        <Text size="xs" color="secondary" style={styles.code}>
          {voucher.code}
        </Text>

        {expiresDate && (
          <Text size="xs" color="secondary">
            Valido ate {expiresDate}
          </Text>
        )}
      </YStack>
    </Card>
  );

  if (onPress) {
    return <Pressable onPress={() => onPress(voucher)}>{content}</Pressable>;
  }
  return content;
}

const styles = StyleSheet.create({
  code: {
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
