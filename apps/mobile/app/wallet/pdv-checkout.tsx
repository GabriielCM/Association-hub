import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button, Spinner } from '@ahub/ui';
import {
  useCheckoutDetails,
  usePdvPayment,
} from '@/features/wallet/hooks/usePdvPayment';
import { PdvCheckout } from '@/features/wallet/components/PdvCheckout';
import { PdvPixPayment } from '@/features/wallet/components/PdvPixPayment';
import { useBiometrics } from '@/hooks/useBiometrics';
import { usePointsStore } from '@/stores/points.store';

export default function PdvCheckoutScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { data: checkout, isLoading, error } = useCheckoutDetails(code ?? '');
  const payMutation = usePdvPayment();
  const { authenticate } = useBiometrics();
  const showCelebration = usePointsStore((s) => s.showCelebration);
  const [showPixFlow, setShowPixFlow] = useState(false);

  const handlePay = useCallback(async () => {
    if (!code) return;

    const biometricResult = await authenticate('Confirme o pagamento');
    if (!biometricResult.success) {
      Alert.alert('Cancelado', 'Autenticação biométrica necessária.');
      return;
    }

    payMutation.mutate(
      { checkoutCode: code, biometricConfirmed: true },
      {
        onSuccess: () => {
          showCelebration(
            checkout?.totalPoints ?? 0,
            `Pagamento em ${checkout?.pdv.name ?? 'PDV'}`
          );
          router.back();
        },
        onError: (err) => {
          Alert.alert('Erro', err.message ?? 'Falha no pagamento.');
        },
      }
    );
  }, [code, authenticate, payMutation, checkout, showCelebration]);

  const handlePayPix = useCallback(() => {
    setShowPixFlow(true);
  }, []);

  const handlePixSuccess = useCallback(
    (cashbackEarned: number) => {
      const message = cashbackEarned > 0
        ? `Pagamento confirmado! Cashback: +${cashbackEarned} pts`
        : `Pagamento em ${checkout?.pdv.name ?? 'PDV'}`;
      showCelebration(cashbackEarned, message);
      router.back();
    },
    [checkout, showCelebration]
  );

  const handlePixCancel = useCallback(() => {
    setShowPixFlow(false);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} padding="$4" gap="$4">
        {/* Header */}
        <XStack alignItems="center" gap="$2">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => {
              if (showPixFlow) {
                setShowPixFlow(false);
              } else {
                router.back();
              }
            }}
          >
            ←
          </Button>
          <Heading level={3}>
            {showPixFlow ? 'Pagamento PIX' : 'Pagamento'}
          </Heading>
        </XStack>

        {/* Content */}
        {isLoading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Spinner size="lg" />
            <Text color="secondary" marginTop="$2">
              Carregando checkout...
            </Text>
          </YStack>
        ) : error ? (
          <YStack flex={1} justifyContent="center" alignItems="center" gap="$3">
            <Text style={{ fontSize: 40 }}>❌</Text>
            <Text color="error" align="center">
              Checkout não encontrado ou expirado.
            </Text>
            <Button variant="outline" onPress={() => router.back()}>
              Voltar
            </Button>
          </YStack>
        ) : checkout && showPixFlow ? (
          <PdvPixPayment
            checkoutCode={code!}
            totalMoney={checkout.totalMoney}
            pdvName={checkout.pdv.name}
            onSuccess={handlePixSuccess}
            onCancel={handlePixCancel}
          />
        ) : checkout ? (
          <PdvCheckout
            checkout={checkout}
            isPaying={payMutation.isPending}
            onPay={handlePay}
            onPayPix={handlePayPix}
            onCancel={() => router.back()}
          />
        ) : null}
      </YStack>
    </SafeAreaView>
  );
}
