import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text, Heading, Card, Button, Spinner } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import { useValidateCheckout } from '@/features/store/hooks/useCheckout';
import { CartSummary } from '@/features/store/components/CartSummary';
import { PaymentOptions } from '@/features/store/components/PaymentOptions';
import { MixedPaymentSlider } from '@/features/store/components/MixedPaymentSlider';
import type { CheckoutValidation, OrderPaymentMethod } from '@ahub/shared/types';

export default function CheckoutScreen() {
  const validateCheckout = useValidateCheckout();
  const [validation, setValidation] = useState<CheckoutValidation | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<OrderPaymentMethod | null>(
    null,
  );
  const [pointsToUse, setPointsToUse] = useState(0);

  useEffect(() => {
    validateCheckout.mutate(undefined, {
      onSuccess: (data) => setValidation(data),
    });
  }, []);

  const handleContinue = () => {
    if (!selectedMethod) return;

    router.push({
      pathname: '/store/payment' as any,
      params: {
        method: selectedMethod,
        pointsToUse: selectedMethod === 'MIXED' ? String(pointsToUse) : undefined,
      },
    });
  };

  if (validateCheckout.isPending) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
          <Spinner />
          <Text size="sm" color="secondary">
            Validando carrinho...
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  if (validateCheckout.isError) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3" padding="$4">
          <Text size="2xl">😔</Text>
          <Text weight="semibold">Erro ao validar</Text>
          <Text color="secondary" size="sm" align="center">
            {validateCheckout.error?.message || 'Tente novamente'}
          </Text>
          <Button onPress={() => router.back()} size="sm">
            Voltar ao carrinho
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  if (validation && !validation.isValid) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} padding="$4" gap="$4">
          <XStack gap="$3" alignItems="center">
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text size="lg">←</Text>
            </Pressable>
            <Heading level={4}>Checkout</Heading>
          </XStack>

          <Card variant="flat">
            <YStack gap="$2">
              <Text weight="semibold" color="error">
                Não é possível finalizar a compra
              </Text>
              {validation.errors?.map((error, i) => (
                <Text key={i} size="sm" color="secondary">
                  • {error}
                </Text>
              ))}
            </YStack>
          </Card>

          <Button onPress={() => router.back()} variant="outline">
            Voltar ao carrinho
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  if (!validation) return null;

  const canContinue =
    selectedMethod != null &&
    (selectedMethod !== 'POINTS' || validation.canPayWithPoints);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {/* Header */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        gap="$3"
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text size="lg">←</Text>
        </Pressable>
        <Heading level={4}>Checkout</Heading>
      </XStack>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order summary */}
        <CartSummary
          subtotalPoints={validation.subtotalPoints}
          subtotalMoney={validation.subtotalMoney}
          itemCount={validation.items.length}
          discountPoints={validation.discountPoints}
          discountMoney={validation.discountMoney}
          totalPoints={validation.totalPoints}
          totalMoney={validation.totalMoney}
        />

        {/* User balance */}
        <Card variant="flat">
          <XStack justifyContent="space-between" alignItems="center">
            <Text size="sm" color="secondary">
              Seu saldo
            </Text>
            <Text weight="bold" color="accent" size="sm">
              {formatPoints(validation.userBalance)} pts
            </Text>
          </XStack>
        </Card>

        {/* Payment method */}
        <PaymentOptions
          availableMethods={validation.availablePaymentMethods}
          selectedMethod={selectedMethod}
          onSelect={setSelectedMethod}
          canPayWithPoints={validation.canPayWithPoints}
          userBalance={validation.userBalance}
          totalPoints={validation.totalPoints}
          totalMoney={validation.totalMoney}
        />

        {/* Mixed slider */}
        {selectedMethod === 'MIXED' && (
          <MixedPaymentSlider
            totalPoints={validation.totalPoints}
            totalMoney={validation.totalMoney}
            userBalance={validation.userBalance}
            onPointsChange={setPointsToUse}
          />
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <YStack style={styles.bottomBar}>
        <Button onPress={handleContinue} disabled={!canContinue}>
          Continuar para pagamento
        </Button>
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 24,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
});
