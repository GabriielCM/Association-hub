import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Avatar } from '@ahub/ui';
import { CheckCircle } from '@ahub/ui/src/icons';
import { formatPoints } from '@ahub/shared/utils';
import { useWalletTheme } from '@/features/wallet/hooks/useWalletTheme';
import type { TransferResult } from '@ahub/shared/types';

interface TransferReceiptProps {
  result: TransferResult;
  message?: string | undefined;
  onClose: () => void;
}

export function TransferReceipt({ result, message, onClose }: TransferReceiptProps) {
  const t = useWalletTheme();

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
      <YStack gap={20} alignItems="center">
        {/* Success Icon */}
        <View style={[styles.checkCircle, { backgroundColor: t.successBg, borderColor: t.successBorder }]}>
          <CheckCircle size={32} color={t.success} weight="fill" />
        </View>

        <Text style={[styles.title, { color: t.textPrimary }]}>Transferencia realizada!</Text>

        <Text style={[styles.amount, { color: t.accent }]}>
          -{formatPoints(result.amount)} pts
        </Text>

        {/* Recipient */}
        <XStack alignItems="center" gap={12}>
          <Avatar
            src={result.recipient.avatar}
            name={result.recipient.name}
            size="md"
          />
          <YStack>
            <Text style={[styles.recipientName, { color: t.textPrimary }]}>{result.recipient.name}</Text>
            <Text style={[styles.recipientLabel, { color: t.textTertiary }]}>Destinatario</Text>
          </YStack>
        </XStack>

        {/* Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: t.inputBg, borderColor: t.inputBorder }]}>
          <YStack gap={12}>
            <DetailRow label="Valor" value={`${formatPoints(result.amount)} pts`} t={t} />
            <DetailRow label="Saldo atual" value={`${formatPoints(result.senderBalanceAfter)} pts`} t={t} />
            <DetailRow label="Data" value={`${formattedDate} as ${formattedTime}`} t={t} />
            <DetailRow label="ID" value={result.transactionId.slice(0, 12) + '...'} t={t} />
          </YStack>
        </View>

        {/* Message */}
        {message ? (
          <View style={[styles.messageCard, { backgroundColor: t.inputBg, borderColor: t.inputBorder }]}>
            <YStack gap={4}>
              <Text style={[styles.messageLabel, { color: t.textTertiary }]}>Mensagem</Text>
              <Text style={[styles.messageText, { color: t.textSecondary }]}>"{message}"</Text>
            </YStack>
          </View>
        ) : null}

        {/* Close Button */}
        <YStack gap={10} width="100%" marginTop={8}>
          <Pressable onPress={onClose} style={[styles.closeButton, { backgroundColor: t.primaryButton }]}>
            <Text style={[styles.closeText, { color: t.primaryButtonText }]}>Fechar</Text>
          </Pressable>
        </YStack>
      </YStack>
    </ScrollView>
  );
}

function DetailRow({
  label,
  value,
  t,
}: {
  label: string;
  value: string;
  t: ReturnType<typeof useWalletTheme>;
}) {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <Text style={[styles.detailLabel, { color: t.textTertiary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: t.textPrimary }]} numberOfLines={1}>{value}</Text>
    </XStack>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  recipientLabel: {
    fontSize: 12,
  },
  detailsCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '60%',
  },
  messageCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  messageLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 14,
  },
  closeButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
