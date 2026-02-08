import { useState } from 'react';
import { Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Text, Heading, Button, Card, Avatar, Spinner } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import { RecipientPicker } from '@/features/points/components/RecipientPicker';
import { TransferForm } from '@/features/points/components/TransferForm';
import { TransferReceipt } from '@/features/points/components/TransferReceipt';
import { useTransfer } from '@/features/points/hooks/useTransfer';
import { useTransferWizard, usePointsStore } from '@/stores/points.store';
import { useBiometrics } from '@/hooks/useBiometrics';
import type { TransferResult } from '@ahub/shared/types';

export default function TransferScreen() {
  const router = useRouter();
  const wizard = useTransferWizard();
  const {
    setTransferRecipient,
    setTransferStep,
    setTransferAmount,
    setTransferMessage,
    resetTransfer,
  } = usePointsStore();
  const transfer = useTransfer();
  const { authenticate, authMethod } = useBiometrics();
  const showCelebration = usePointsStore((s) => s.showCelebration);
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);

  const handleAmountSubmit = (amount: number, message: string) => {
    setTransferAmount(amount);
    setTransferMessage(message);
    setTransferStep('confirm');
  };

  const handleConfirm = async () => {
    if (!wizard.recipient) return;

    const authResult = await authenticate('Confirme a transferência');
    if (!authResult.success) return;

    transfer.mutate(
      {
        recipientId: wizard.recipient.userId,
        amount: wizard.amount,
        message: wizard.message || undefined,
      },
      {
        onSuccess: (result) => {
          showCelebration(result.amount, `Transferência para ${result.recipient.name}`);
          setTransferResult(result);
          setTransferStep('receipt');
        },
        onError: (error) => {
          Alert.alert('Erro', error.message);
        },
      }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <YStack flex={1} padding="$4" gap="$3">
        {wizard.step !== 'receipt' && (
          <>
            <XStack alignItems="center" justifyContent="space-between">
              <Heading level={3}>Transferir Pontos</Heading>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => {
                  resetTransfer();
                  router.back();
                }}
              >
                Cancelar
              </Button>
            </XStack>

            {/* Step indicators */}
            <XStack gap="$2" justifyContent="center">
              {(['recipient', 'amount', 'confirm'] as const).map((step, i) => (
                <YStack
                  key={step}
                  width={40}
                  height={4}
                  borderRadius="$full"
                  backgroundColor={
                    i <= ['recipient', 'amount', 'confirm'].indexOf(wizard.step)
                      ? '$primary'
                      : '$borderColor'
                  }
                />
              ))}
            </XStack>
          </>
        )}

        {/* Step 1: Select Recipient */}
        {wizard.step === 'recipient' && (
          <RecipientPicker onSelect={setTransferRecipient} />
        )}

        {/* Step 2: Enter Amount */}
        {wizard.step === 'amount' && wizard.recipient && (
          <TransferForm
            recipientName={wizard.recipient.name}
            onSubmit={handleAmountSubmit}
            onBack={() => setTransferStep('recipient')}
          />
        )}

        {/* Step 3: Confirm */}
        {wizard.step === 'confirm' && wizard.recipient && (
          <YStack flex={1} gap="$4">
            <Card variant="elevated" size="lg">
              <YStack gap="$3" alignItems="center">
                <Text color="secondary" size="sm">
                  Confirme a transferencia
                </Text>

                <Avatar
                  src={wizard.recipient.avatar}
                  name={wizard.recipient.name}
                  size="lg"
                />
                <Text weight="semibold" size="lg">
                  {wizard.recipient.name}
                </Text>

                <Heading level={2} color="accent">
                  {formatPoints(wizard.amount)} pts
                </Heading>

                {wizard.message && (
                  <Card variant="flat" fullWidth>
                    <Text color="secondary" size="sm" align="center">
                      "{wizard.message}"
                    </Text>
                  </Card>
                )}
              </YStack>
            </Card>

            <YStack gap="$2" marginTop="auto">
              {transfer.isPending ? (
                <Spinner />
              ) : (
                <>
                  <Button onPress={handleConfirm}>
                    {authMethod === 'biometric'
                      ? 'Confirmar com biometria'
                      : authMethod === 'device_credential'
                        ? 'Confirmar com senha'
                        : 'Confirmar transferência'}
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => setTransferStep('amount')}
                  >
                    Voltar
                  </Button>
                </>
              )}
            </YStack>
          </YStack>
        )}

        {/* Step 4: Receipt */}
        {wizard.step === 'receipt' && transferResult && (
          <TransferReceipt
            result={transferResult}
            message={wizard.message || undefined}
            onClose={() => {
              resetTransfer();
              router.back();
            }}
          />
        )}
      </YStack>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
