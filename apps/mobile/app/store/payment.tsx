import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Heading, Button, Spinner } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import { isStripeAvailable } from '@/providers/StripeProvider';
import { useProcessCheckout } from '@/features/store/hooks/useCheckout';
import { BiometricConfirm } from '@/features/store/components/BiometricConfirm';
import { PaymentStatusPolling } from '@/features/store/components/PaymentStatusPolling';
import type {
  OrderPaymentMethod,
  PointsCheckoutResponse,
  CardCheckoutResponse,
  MixedCheckoutResponse,
} from '@ahub/shared/types';

// Conditional Stripe hook — returns stub when native module is unavailable (Expo Go)
function useStripeConditional() {
  if (!isStripeAvailable()) {
    return {
      initPaymentSheet: async (_opts: Record<string, unknown>) =>
        ({ error: { code: 'Unavailable', message: 'Stripe indisponivel no Expo Go' } }) as const,
      presentPaymentSheet: async () =>
        ({ error: { code: 'Unavailable', message: 'Stripe indisponivel no Expo Go' } }) as const,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const stripe = require('@stripe/stripe-react-native');
  return stripe.useStripe() as {
    initPaymentSheet: (opts: Record<string, unknown>) => Promise<{ error?: { code: string; message: string } }>;
    presentPaymentSheet: () => Promise<{ error?: { code: string; message: string } }>;
  };
}

type PaymentStep =
  | 'idle'
  | 'biometric'
  | 'processing'
  | 'stripe'
  | 'polling'
  | 'error';

export default function PaymentScreen() {
  const { method, pointsToUse } = useLocalSearchParams<{
    method: string;
    pointsToUse?: string;
  }>();
  const paymentMethod = method as OrderPaymentMethod;
  const pointsAmount = pointsToUse ? Number(pointsToUse) : undefined;

  const { initPaymentSheet, presentPaymentSheet } = useStripeConditional();
  const processCheckout = useProcessCheckout();

  const [step, setStep] = useState<PaymentStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mixedPointsUsed, setMixedPointsUsed] = useState(0);

  // Start the flow based on payment method
  useEffect(() => {
    if (paymentMethod === 'POINTS' || paymentMethod === 'MIXED') {
      setStep('biometric');
    } else if (paymentMethod === 'MONEY') {
      handleCardFlow();
    }
  }, []);

  // ==========================================
  // POINTS FLOW
  // ==========================================
  const handlePointsFlow = useCallback(async () => {
    setStep('processing');
    try {
      const result = await processCheckout.mutateAsync({
        paymentMethod: 'POINTS',
      });

      if ('orderId' in result) {
        const pointsResult = result as PointsCheckoutResponse;
        router.replace({
          pathname: '/store/confirmation' as any,
          params: {
            orderId: pointsResult.orderId,
            orderCode: pointsResult.orderCode,
            pointsUsed: String(pointsResult.pointsUsed),
          },
        });
      }
    } catch (err) {
      setStep('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Erro ao processar pagamento',
      );
    }
  }, [processCheckout]);

  // ==========================================
  // CARD (MONEY) FLOW
  // ==========================================
  const handleCardFlow = useCallback(async () => {
    if (!isStripeAvailable()) {
      setStep('error');
      setErrorMessage(
        'Pagamento com cartao requer um dev build. Use "eas build --profile development" para testar pagamentos.',
      );
      return;
    }

    setStep('processing');
    try {
      const result = await processCheckout.mutateAsync({
        paymentMethod: 'MONEY',
      });

      if ('clientSecret' in result) {
        const cardResult = result as CardCheckoutResponse;
        await launchPaymentSheet(cardResult.clientSecret);
      }
    } catch (err) {
      setStep('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Erro ao processar pagamento',
      );
    }
  }, [processCheckout]);

  // ==========================================
  // MIXED FLOW
  // ==========================================
  const handleMixedFlow = useCallback(async () => {
    if (!isStripeAvailable()) {
      setStep('error');
      setErrorMessage(
        'Pagamento misto requer um dev build. Use "eas build --profile development" para testar pagamentos.',
      );
      return;
    }

    setStep('processing');
    try {
      const checkoutData: { paymentMethod: OrderPaymentMethod; pointsToUse?: number } = {
        paymentMethod: 'MIXED',
      };
      if (pointsAmount != null) {
        checkoutData.pointsToUse = pointsAmount;
      }
      const result = await processCheckout.mutateAsync(checkoutData);

      if ('clientSecret' in result) {
        const mixedResult = result as MixedCheckoutResponse;
        setMixedPointsUsed(mixedResult.pointsUsed);
        await launchPaymentSheet(mixedResult.clientSecret);
      }
    } catch (err) {
      setStep('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Erro ao processar pagamento',
      );
    }
  }, [processCheckout, pointsAmount]);

  // ==========================================
  // STRIPE PAYMENT SHEET
  // ==========================================
  const launchPaymentSheet = async (clientSecret: string) => {
    setStep('stripe');

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'A-hub Store',
    });

    if (initError) {
      setStep('error');
      setErrorMessage(initError.message);
      return;
    }

    const { error: presentError } = await presentPaymentSheet();

    if (presentError) {
      if (presentError.code === 'Canceled') {
        // User cancelled the PaymentSheet
        if (paymentMethod === 'MIXED') {
          // Points were already debited - warn user
          Alert.alert(
            'Pagamento cancelado',
            'Os pontos utilizados serao devolvidos automaticamente caso o pagamento nao seja concluido.',
            [
              { text: 'Tentar novamente', onPress: () => launchPaymentSheet(clientSecret) },
              { text: 'Voltar', onPress: () => router.back() },
            ],
          );
        } else {
          router.back();
        }
        return;
      }
      setStep('error');
      setErrorMessage(presentError.message);
      return;
    }

    // Payment succeeded - start polling for webhook confirmation
    setStep('polling');
  };

  // ==========================================
  // BIOMETRIC CALLBACK
  // ==========================================
  const handleBiometricConfirm = useCallback(() => {
    if (paymentMethod === 'POINTS') {
      handlePointsFlow();
    } else if (paymentMethod === 'MIXED') {
      handleMixedFlow();
    }
  }, [paymentMethod, handlePointsFlow, handleMixedFlow]);

  const handleBiometricCancel = useCallback(() => {
    router.back();
  }, []);

  // ==========================================
  // POLLING CALLBACKS
  // ==========================================
  const handlePollingConfirmed = useCallback(
    (order: { orderId: string; orderCode: string }) => {
      const params: Record<string, string> = {
        orderId: order.orderId,
        orderCode: order.orderCode,
      };
      if (paymentMethod === 'MIXED' && mixedPointsUsed > 0) {
        params.pointsUsed = String(mixedPointsUsed);
      }
      router.replace({
        pathname: '/store/confirmation' as any,
        params,
      });
    },
    [paymentMethod, mixedPointsUsed],
  );

  const handlePollingTimeout = useCallback(() => {
    Alert.alert(
      'Processamento em andamento',
      'Seu pagamento esta sendo processado. Verifique seus pedidos em alguns instantes.',
      [{ text: 'Ver pedidos', onPress: () => router.replace('/store' as any) }],
    );
  }, []);

  // ==========================================
  // RENDER
  // ==========================================

  // Biometric modal for POINTS / MIXED
  if (step === 'biometric') {
    const biometricAmount =
      paymentMethod === 'POINTS'
        ? 0 // Will show total from checkout
        : pointsAmount ?? 0;

    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <BiometricConfirm
          visible
          onConfirm={handleBiometricConfirm}
          onCancel={handleBiometricCancel}
          amount={biometricAmount}
          description={
            paymentMethod === 'POINTS'
              ? 'Confirme para pagar com seus pontos'
              : `Confirme o uso de ${formatPoints(pointsAmount ?? 0)} pontos`
          }
        />
      </SafeAreaView>
    );
  }

  // Processing state
  if (step === 'processing' || step === 'stripe') {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$6">
          <Spinner />
          <Text size="lg" weight="semibold">
            {step === 'stripe' ? 'Abrindo pagamento...' : 'Processando...'}
          </Text>
          <Text size="sm" color="secondary" align="center">
            {paymentMethod === 'POINTS'
              ? 'Debitando pontos da sua conta'
              : 'Preparando pagamento com cartao'}
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  // Polling state (after Stripe PaymentSheet success)
  if (step === 'polling') {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <PaymentStatusPolling
          onConfirmed={handlePollingConfirmed}
          onTimeout={handlePollingTimeout}
        />
      </SafeAreaView>
    );
  }

  // Error state
  if (step === 'error') {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" padding="$6">
          <Text size="2xl">😔</Text>
          <Heading level={4}>Erro no pagamento</Heading>
          <Text size="sm" color="secondary" align="center">
            {errorMessage || 'Ocorreu um erro inesperado'}
          </Text>
          <YStack gap="$2" width="100%">
            <Button
              onPress={() => {
                setStep('idle');
                setErrorMessage(null);
                if (paymentMethod === 'POINTS' || paymentMethod === 'MIXED') {
                  setStep('biometric');
                } else {
                  handleCardFlow();
                }
              }}
            >
              Tentar novamente
            </Button>
            <Button variant="outline" onPress={() => router.back()}>
              Voltar ao checkout
            </Button>
          </YStack>
        </YStack>
      </SafeAreaView>
    );
  }

  // Idle / initial state (brief, should transition quickly)
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
        <Spinner />
        <Text size="sm" color="secondary">
          Iniciando pagamento...
        </Text>
      </YStack>
    </SafeAreaView>
  );
}
