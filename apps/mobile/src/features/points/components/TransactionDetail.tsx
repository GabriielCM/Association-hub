import { Modal, Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';

import { Card, Text, Heading, Badge, Button } from '@ahub/ui';
import { formatPoints, formatDateTime } from '@ahub/shared/utils';
import type { PointTransaction } from '@ahub/shared/types';
import { SOURCE_LABELS } from './TransactionItem';

interface TransactionDetailProps {
  transaction: PointTransaction | null;
  visible: boolean;
  onClose: () => void;
}

export function TransactionDetail({
  transaction,
  visible,
  onClose,
}: TransactionDetailProps) {
  if (!transaction) return null;

  const isCredit = transaction.type === 'credit';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Card
            variant="elevated"
            size="lg"
            borderBottomLeftRadius={0}
            borderBottomRightRadius={0}
          >
            <YStack gap="$3">
              <XStack alignItems="center" justifyContent="space-between">
                <Heading level={4}>Detalhes</Heading>
                <Badge variant={isCredit ? 'success' : 'error'}>
                  {isCredit ? 'Credito' : 'Debito'}
                </Badge>
              </XStack>

              <Heading
                level={2}
                color={isCredit ? 'accent' : 'primary'}
                align="center"
              >
                {isCredit ? '+' : '-'}{formatPoints(transaction.amount)} pts
              </Heading>

              <YStack gap="$2">
                <DetailRow
                  label="Origem"
                  value={SOURCE_LABELS[transaction.source] ?? transaction.source}
                />
                {transaction.description && (
                  <DetailRow label="Descricao" value={transaction.description} />
                )}
                <DetailRow
                  label="Saldo apos"
                  value={`${formatPoints(transaction.balanceAfter)} pts`}
                />
                <DetailRow
                  label="Data"
                  value={formatDateTime(transaction.createdAt)}
                />
                <DetailRow label="ID" value={transaction.id} />
              </YStack>

              <Button onPress={onClose}>Fechar</Button>
            </YStack>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <Text color="secondary" size="sm">
        {label}
      </Text>
      <Text size="sm" weight="medium" numberOfLines={1} maxWidth="60%">
        {value}
      </Text>
    </XStack>
  );
}
