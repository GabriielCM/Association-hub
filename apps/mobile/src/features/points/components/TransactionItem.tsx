import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { Text, Icon } from '@ahub/ui';
import { TRANSACTION_ICONS } from '@ahub/ui/src/icons';
import { formatPoints, formatRelativeDate } from '@ahub/shared/utils';
import type { PointTransaction } from '@ahub/shared/types';

const SOURCE_LABELS: Record<string, string> = {
  EVENT_CHECKIN: 'Check-in',
  STRAVA_RUN: 'Corrida',
  STRAVA_RIDE: 'Ciclismo',
  STRAVA_WALK: 'Caminhada',
  STRAVA_SWIM: 'Natacao',
  STRAVA_HIKE: 'Trilha',
  DAILY_POST: 'Post diario',
  PURCHASE_POINTS: 'Compra (pontos)',
  PURCHASE_PIX: 'Compra (PIX)',
  CASHBACK: 'Cashback',
  TRANSFER_IN: 'Transferencia recebida',
  TRANSFER_OUT: 'Transferencia enviada',
  ADMIN_CREDIT: 'Credito manual',
  ADMIN_DEBIT: 'Debito manual',
  REFUND: 'Estorno',
  SUBSCRIPTION_BONUS: 'Bonus assinatura',
  REFERRAL: 'Indicacao',
  MANUAL_ADJUSTMENT: 'Ajuste manual',
};


interface TransactionItemProps {
  transaction: PointTransaction;
  onPress?: (transaction: PointTransaction) => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const isCredit = transaction.type === 'credit';
  const IconComponent = TRANSACTION_ICONS[transaction.source] ?? TRANSACTION_ICONS.DEFAULT;
  const label = SOURCE_LABELS[transaction.source] ?? transaction.source;

  return (
    <Pressable onPress={() => onPress?.(transaction)}>
      <XStack
        alignItems="center"
        gap="$3"
        paddingVertical="$2"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Icon icon={IconComponent} size="lg" color={isCredit ? 'success' : 'muted'} />

        <YStack flex={1}>
          <Text size="sm" weight="medium" numberOfLines={1}>
            {transaction.description ?? label}
          </Text>
          <Text color="secondary" size="xs">
            {formatRelativeDate(transaction.createdAt)}
          </Text>
        </YStack>

        <Text
          weight="semibold"
          color={isCredit ? 'success' : 'error'}
          size="sm"
        >
          {isCredit ? '+' : '-'}{formatPoints(transaction.amount)}
        </Text>
      </XStack>
    </Pressable>
  );
}

export { SOURCE_LABELS };
