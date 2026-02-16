import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button, Spinner, ScreenHeader } from '@ahub/ui';
import { RecipientPicker } from '@/features/points/components/RecipientPicker';
import { TransferForm } from '@/features/points/components/TransferForm';
import { TransferReceipt } from '@/features/points/components/TransferReceipt';
import { useTransfer } from '@/features/points/hooks/useTransfer';
import { useBiometrics } from '@/hooks/useBiometrics';
import { usePointsStore } from '@/stores/points.store';
import type { RecentRecipient, TransferResult } from '@ahub/shared/types';

type Step = 'recipient' | 'amount' | 'confirm' | 'receipt';

export default function WalletTransferScreen() {
  const { recipientId, recipientName } = useLocalSearchParams<{
    recipientId?: string;
    recipientName?: string;
  }>();

  const [step, setStep] = useState<Step>(recipientId ? 'amount' : 'recipient');
  const [recipient, setRecipient] = useState<RecentRecipient | null>(
    recipientId
      ? { userId: recipientId, name: recipientName ?? '', lastTransferAt: new Date() }
      : null
  );
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const transferMutation = useTransfer();
  const { authenticate, authMethod } = useBiometrics();
  const showCelebration = usePointsStore((s) => s.showCelebration);

  const handleSelectRecipient = useCallback((r: RecentRecipient) => {
    setRecipient(r);
    setStep('amount');
  }, []);

  const handleAmountSubmit = useCallback((amt: number, msg: string) => {
    setAmount(amt);
    setMessage(msg);
    setStep('confirm');
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!recipient) return;

    const authResult = await authenticate('Confirme a transferência');
    if (!authResult.success) return;

    transferMutation.mutate(
      {
        recipientId: recipient.userId,
        amount,
        ...(message ? { message } : {}),
      },
      {
        onSuccess: (result) => {
          showCelebration(amount, `Transferência para ${recipient.name}`);
          setTransferResult(result);
          setStep('receipt');
        },
        onError: (error) => {
          Alert.alert('Erro', error.message ?? 'Não foi possível transferir.');
        },
      }
    );
  }, [recipient, amount, message, authenticate, transferMutation, showCelebration]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {step !== 'receipt' && (
        <ScreenHeader
          title="Transferir Pontos"
          onBack={() => {
            if (step === 'amount') setStep('recipient');
            else if (step === 'confirm') setStep('amount');
            else router.back();
          }}
        />
      )}
      <YStack flex={1} padding="$4" gap="$4">
        {/* Steps */}
        {step === 'recipient' && (
          <RecipientPicker
            onSelect={handleSelectRecipient}
            onScanQR={() => router.push('/wallet/scanner')}
          />
        )}

        {step === 'amount' && recipient && (
          <TransferForm
            recipientName={recipient.name}
            onSubmit={handleAmountSubmit}
            onBack={() => setStep('recipient')}
          />
        )}

        {step === 'confirm' && recipient && (
          <YStack flex={1} gap="$4" justifyContent="center" alignItems="center">
            <Text style={{ fontSize: 48 }}>✅</Text>
            <Heading level={4} align="center">
              Confirmar transferência
            </Heading>
            <Text color="secondary" align="center">
              {amount} pontos para {recipient.name}
            </Text>
            {message && (
              <Text color="secondary" size="sm" align="center">
                "{message}"
              </Text>
            )}
            <YStack gap="$2" width="100%" marginTop="$4">
              <Button
                onPress={handleConfirm}
                disabled={transferMutation.isPending}
              >
                {transferMutation.isPending ? (
                  <Spinner size="sm" />
                ) : authMethod === 'biometric' ? (
                  'Confirmar com biometria'
                ) : authMethod === 'device_credential' ? (
                  'Confirmar com senha'
                ) : (
                  'Confirmar transferência'
                )}
              </Button>
              <Button variant="outline" onPress={() => setStep('amount')}>
                Voltar
              </Button>
            </YStack>
          </YStack>
        )}

        {step === 'receipt' && transferResult && (
          <TransferReceipt
            result={transferResult}
            message={message || undefined}
            onClose={() => router.dismissTo('/wallet' as any)}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}
