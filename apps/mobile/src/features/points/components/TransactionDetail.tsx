import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Text, Heading, Badge, Button } from '@ahub/ui';
import { formatPoints, formatDateTime } from '@ahub/shared/utils';
import type { PointTransaction } from '@ahub/shared/types';
import { SOURCE_LABELS } from './TransactionItem';

interface TransactionDetailProps {
  transaction: PointTransaction | null;
  visible: boolean;
  onClose: () => void;
}

const TRANSFER_SOURCES = ['TRANSFER_IN', 'TRANSFER_OUT'];

export function TransactionDetail({
  transaction,
  visible,
  onClose,
}: TransactionDetailProps) {
  const insets = useSafeAreaInsets();

  if (!transaction) return null;

  const isCredit = transaction.type === 'credit';
  const isTransfer = TRANSFER_SOURCES.includes(transaction.source);

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
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {isTransfer ? (
                <TransferDetailContent transaction={transaction} onClose={onClose} />
              ) : (
                <GenericDetailContent transaction={transaction} isCredit={isCredit} onClose={onClose} />
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TransferDetailContent({
  transaction,
  onClose,
}: {
  transaction: PointTransaction;
  onClose: () => void;
}) {
  const isOutgoing = transaction.source === 'TRANSFER_OUT';
  const personName = isOutgoing
    ? ((transaction.metadata?.recipientName as string) ?? '')
    : ((transaction.metadata?.senderName as string) ?? '');
  const displayName = personName || transaction.description || '';
  const message = transaction.metadata?.message as string | undefined;

  const date = new Date(transaction.createdAt);
  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <YStack gap="$3" alignItems="center">
      <View style={styles.checkCircle}>
        <Text style={styles.checkIcon}>{isOutgoing ? '↗' : '↙'}</Text>
      </View>

      <Heading level={4} align="center">
        {isOutgoing ? 'Transferência enviada' : 'Transferência recebida'}
      </Heading>

      <Text style={[styles.amountText, !isOutgoing && styles.amountCredit]} numberOfLines={1} adjustsFontSizeToFit>
        {isOutgoing ? '-' : '+'}{formatPoints(transaction.amount)} pts
      </Text>

      {displayName ? (
        <Text color="secondary" size="sm" align="center">
          {isOutgoing ? 'Para' : 'De'}: {displayName}
        </Text>
      ) : null}

      <Card variant="flat" width="100%">
        <YStack gap="$2">
          <DetailRow label="Valor" value={`${formatPoints(transaction.amount)} pts`} />
          <DetailRow label="Saldo após" value={`${formatPoints(transaction.balanceAfter)} pts`} />
          <DetailRow label="Data" value={`${formattedDate} às ${formattedTime}`} />
          <DetailRow label="ID" value={transaction.id.slice(0, 12) + '...'} />
        </YStack>
      </Card>

      {message ? (
        <Card variant="flat" width="100%">
          <YStack gap="$1">
            <Text color="secondary" size="xs">Mensagem</Text>
            <Text size="sm">"{message}"</Text>
          </YStack>
        </Card>
      ) : null}

      <Button onPress={onClose} width="100%">Fechar</Button>
    </YStack>
  );
}

function GenericDetailContent({
  transaction,
  isCredit,
  onClose,
}: {
  transaction: PointTransaction;
  isCredit: boolean;
  onClose: () => void;
}) {
  return (
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

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    maxHeight: '85%',
  },
  checkCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 26,
    color: '#16A34A',
    fontWeight: '700',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
    textAlign: 'center',
  },
  amountCredit: {
    color: '#16A34A',
  },
});
