import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@ahub/ui';
import { CaretLeft, XCircle } from '@ahub/ui/src/icons';
import {
  useCheckoutDetails,
  usePdvPayment,
} from '@/features/wallet/hooks/usePdvPayment';
import { PdvCheckout } from '@/features/wallet/components/PdvCheckout';
import { PdvPixPayment } from '@/features/wallet/components/PdvPixPayment';
import { WalletGlassBackground } from '@/features/wallet/components/WalletGlassBackground';
import { ShimmerGlassSkeleton } from '@/features/wallet/components/ShimmerGlassSkeleton';
import { GlassPanel } from '@/features/wallet/components/GlassPanel';
import { useWalletTheme } from '@/features/wallet/hooks/useWalletTheme';
import { useBiometrics } from '@/hooks/useBiometrics';
import { usePointsStore } from '@/stores/points.store';

export default function PdvCheckoutScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { data: checkout, isLoading, error } = useCheckoutDetails(code ?? '');
  const payMutation = usePdvPayment();
  const { authenticate } = useBiometrics();
  const showCelebration = usePointsStore((s) => s.showCelebration);
  const [showPixFlow, setShowPixFlow] = useState(false);
  const t = useWalletTheme();

  const handlePay = useCallback(async () => {
    if (!code) return;

    const biometricResult = await authenticate('Confirme o pagamento');
    if (!biometricResult.success) {
      Alert.alert('Cancelado', 'Autenticacao biometrica necessaria.');
      return;
    }

    payMutation.mutate(
      { checkoutCode: code, biometricConfirmed: true },
      {
        onSuccess: () => {
          showCelebration(
            checkout?.totalPoints ?? 0,
            `Pagamento em ${checkout?.pdv.name ?? 'PDV'}`,
          );
          router.dismissTo('/wallet' as any);
        },
        onError: (err) => {
          Alert.alert('Erro', err.message ?? 'Falha no pagamento.');
        },
      },
    );
  }, [code, authenticate, payMutation, checkout, showCelebration]);

  const handlePixSuccess = useCallback(
    (cashbackEarned: number) => {
      const message =
        cashbackEarned > 0
          ? `Pagamento confirmado! Cashback: +${cashbackEarned} pts`
          : `Pagamento em ${checkout?.pdv.name ?? 'PDV'}`;
      showCelebration(cashbackEarned, message);
      router.dismissTo('/wallet' as any);
    },
    [checkout, showCelebration],
  );

  const handlePixCancel = useCallback(() => {
    setShowPixFlow(false);
  }, []);

  // Auto-initiate PIX when payment method was pre-selected on display
  useEffect(() => {
    if (checkout?.paymentMethod === 'PIX' && !showPixFlow) {
      setShowPixFlow(true);
    }
  }, [checkout?.paymentMethod]);

  return (
    <View style={[styles.root, { backgroundColor: t.screenBg }]}>
      <WalletGlassBackground colors={t.gradientColors} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (showPixFlow) {
                setShowPixFlow(false);
              } else {
                router.back();
              }
            }}
            hitSlop={12}
            style={[styles.backButton, { backgroundColor: t.headerButtonBg }]}
          >
            <CaretLeft size={22} color={t.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
            {showPixFlow ? 'Pagamento PIX' : 'Pagamento'}
          </Text>
          <View style={{ width: 34 }} />
        </View>

        <YStack flex={1} paddingHorizontal={20} gap={16}>
          {/* Loading */}
          {isLoading ? (
            <YStack flex={1} justifyContent="center" alignItems="center" gap={16}>
              <ShimmerGlassSkeleton width={56} height={56} borderRadius={28} />
              <ShimmerGlassSkeleton width={180} height={24} borderRadius={8} />
              <ShimmerGlassSkeleton width="100%" height={120} borderRadius={16} />
              <ShimmerGlassSkeleton width="100%" height={80} borderRadius={16} />
              <ShimmerGlassSkeleton width="100%" height={60} borderRadius={14} />
              <ShimmerGlassSkeleton width="100%" height={54} borderRadius={14} />
            </YStack>
          ) : error ? (
            /* Error State */
            <YStack flex={1} justifyContent="center" alignItems="center" gap={16}>
              <GlassPanel
                padding={32}
                borderRadius={20}
                borderColor={t.errorBorder}
                blurTint={t.glassBlurTint}
                intensity={t.glassBlurIntensity}
              >
                <YStack alignItems="center" gap={12}>
                  <XCircle size={48} color={t.error} weight="duotone" />
                  <Text style={[styles.errorTitle, { color: t.error }]}>
                    Checkout nao encontrado ou expirado.
                  </Text>
                  <Pressable
                    onPress={() => router.back()}
                    style={[styles.retryButton, { borderColor: t.outlineButtonBorder }]}
                  >
                    <Text style={[styles.retryText, { color: t.textSecondary }]}>Voltar</Text>
                  </Pressable>
                </YStack>
              </GlassPanel>
            </YStack>
          ) : checkout && showPixFlow ? (
            <PdvPixPayment
              checkoutCode={code!}
              totalMoney={checkout.totalMoney}
              pdvName={checkout.pdv.name}
              onSuccess={handlePixSuccess}
              onCancel={handlePixCancel}
              displayHasQr={checkout.paymentMethod === 'PIX'}
            />
          ) : checkout ? (
            <PdvCheckout
              checkout={checkout}
              isPaying={payMutation.isPending}
              onPay={handlePay}
              onCancel={() => router.back()}
            />
          ) : null}
        </YStack>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
