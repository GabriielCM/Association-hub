import { ScrollView, StyleSheet, View } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Heading, Button, Avatar, Card, Icon } from '@ahub/ui';
import { CheckCircle } from '@ahub/ui/src/icons';
import { formatPoints } from '@ahub/shared/utils';
import type { TransferResult } from '@ahub/shared/types';

interface TransferReceiptProps {
  result: TransferResult;
  message?: string | undefined;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <Text color="secondary" size="sm">{label}</Text>
      <Text size="sm" weight="medium" numberOfLines={1} style={{ maxWidth: '60%' }}>{value}</Text>
    </XStack>
  );
}

export function TransferReceipt({ result, message, onClose }: TransferReceiptProps) {
  const date = new Date(result.createdAt);
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
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <YStack gap="$4" alignItems="center">
        <View style={styles.checkCircle}>
          <Icon icon={CheckCircle} size={28} color="#16A34A" weight="fill" />
        </View>

        <Heading level={3} align="center">
          Transferência realizada!
        </Heading>

        <Text style={styles.amountText} numberOfLines={1} adjustsFontSizeToFit>
          -{formatPoints(result.amount)} pts
        </Text>

        <XStack alignItems="center" gap="$3">
          <Avatar
            src={result.recipient.avatar}
            name={result.recipient.name}
            size="md"
          />
          <YStack>
            <Text weight="semibold">{result.recipient.name}</Text>
            <Text color="secondary" size="xs">Destinatário</Text>
          </YStack>
        </XStack>

        <Card variant="flat" width="100%">
          <YStack gap="$2">
            <DetailRow label="Valor" value={`${formatPoints(result.amount)} pts`} />
            <DetailRow label="Saldo atual" value={`${formatPoints(result.senderBalanceAfter)} pts`} />
            <DetailRow label="Data" value={`${formattedDate} às ${formattedTime}`} />
            <DetailRow label="ID" value={result.transactionId.slice(0, 12) + '...'} />
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

        <YStack gap="$2" width="100%" marginTop="$2">
          <Button onPress={onClose}>
            Fechar
          </Button>
        </YStack>
      </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 28,
    color: '#16A34A',
    fontWeight: '700',
  },
  amountText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8B5CF6',
    minWidth: 50,
    textAlign: 'center',
  },
});
