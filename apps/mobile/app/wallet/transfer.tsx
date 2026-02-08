import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button, Spinner } from '@ahub/ui';
import { RecipientPicker } from '@/features/points/components/RecipientPicker';
import { TransferForm } from '@/features/points/components/TransferForm';
import { useTransfer } from '@/features/points/hooks/useTransfer';
import { useBiometrics } from '@/hooks/useBiometrics';
import { usePointsStore } from '@/stores/points.store';
import type { RecentRecipient } from '@ahub/shared/types';

type Step = 'recipient' | 'amount' | 'confirm';

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
  const transferMutation = useTransfer();
  const { authenticate } = useBiometrics();
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

    // Biometric check
    const biometricResult = await authenticate('Confirme a transferência');
    if (!biometricResult.success) {
      Alert.alert('Cancelado', 'Autenticação biométrica necessária.');
      return;
    }

    transferMutation.mutate(
      {
        recipientId: recipient.userId,
        amount,
        message: message || undefined,
      },
      {
        onSuccess: (result) => {
          showCelebration(amount, `Transferência para ${recipient.name}`);
          router.back();
        },
        onError: (error) => {
          Alert.alert('Erro', error.message ?? 'Não foi possível transferir.');
        },
      }
    );
  }, [recipient, amount, message, authenticate, transferMutation, showCelebration]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} padding="$4" gap="$4">
        {/* Header */}
        <XStack alignItems="center" gap="$2">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => {
              if (step === 'amount') setStep('recipient');
              else if (step === 'confirm') setStep('amount');
              else router.back();
            }}
          >
            ←
          </Button>
          <Heading level={4}>Transferir Pontos</Heading>
        </XStack>

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
                  <Spinner size="small" />
                ) : (
                  'Confirmar com biometria'
                )}
              </Button>
              <Button variant="outline" onPress={() => setStep('amount')}>
                Voltar
              </Button>
            </YStack>
          </YStack>
        )}
      </YStack>
    </SafeAreaView>
  );
}
