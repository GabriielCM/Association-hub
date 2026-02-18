import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@ahub/ui';
import { CaretLeft, FingerprintSimple, Lock, CheckCircle } from '@ahub/ui/src/icons';
import * as Haptics from 'expo-haptics';
import { RecipientPicker } from '@/features/points/components/RecipientPicker';
import { TransferForm } from '@/features/points/components/TransferForm';
import { TransferReceipt } from '@/features/points/components/TransferReceipt';
import { CelebrationOverlay } from '@/features/points/components/CelebrationOverlay';
import { useTransfer } from '@/features/points/hooks/useTransfer';
import { useBiometrics } from '@/hooks/useBiometrics';
import { usePointsStore } from '@/stores/points.store';
import { WalletGlassBackground } from '@/features/wallet/components/WalletGlassBackground';
import { GlassPanel } from '@/features/wallet/components/GlassPanel';
import { AnimatedCounterText } from '@/features/wallet/components/AnimatedCounterText';
import { useWalletTheme } from '@/features/wallet/hooks/useWalletTheme';
import { formatPoints } from '@ahub/shared/utils';
import type { RecentRecipient, TransferResult } from '@ahub/shared/types';

type Step = 'recipient' | 'amount' | 'confirm' | 'receipt';

const STEPS: Step[] = ['recipient', 'amount', 'confirm', 'receipt'];
const STEP_LABELS = ['Destinatario', 'Valor', 'Confirmar', 'Comprovante'];

export default function WalletTransferScreen() {
  const { recipientId, recipientName } = useLocalSearchParams<{
    recipientId?: string;
    recipientName?: string;
  }>();

  const [step, setStep] = useState<Step>(recipientId ? 'amount' : 'recipient');
  const [recipient, setRecipient] = useState<RecentRecipient | null>(
    recipientId
      ? { userId: recipientId, name: recipientName ?? '', lastTransferAt: new Date() }
      : null,
  );
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const transferMutation = useTransfer();
  const { authenticate, authMethod } = useBiometrics();
  const showCelebration = usePointsStore((s) => s.showCelebration);
  const t = useWalletTheme();

  const currentStepIndex = STEPS.indexOf(step);

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

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const authResult = await authenticate('Confirme a transferencia');
    if (!authResult.success) return;

    transferMutation.mutate(
      {
        recipientId: recipient.userId,
        amount,
        ...(message ? { message } : {}),
      },
      {
        onSuccess: (result) => {
          showCelebration(amount, `Transferencia para ${recipient.name}`);
          setTransferResult(result);
          setStep('receipt');
        },
        onError: (error) => {
          Alert.alert('Erro', error.message ?? 'Nao foi possivel transferir.');
        },
      },
    );
  }, [recipient, amount, message, authenticate, transferMutation, showCelebration]);

  const handleBack = () => {
    if (step === 'amount') setStep('recipient');
    else if (step === 'confirm') setStep('amount');
    else router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: t.screenBg }]}>
      <WalletGlassBackground colors={t.gradientColors} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        {/* Header */}
        {step !== 'receipt' && (
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              hitSlop={12}
              style={[styles.backButton, { backgroundColor: t.headerButtonBg }]}
            >
              <CaretLeft size={22} color={t.textPrimary} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: t.textPrimary }]}>Transferir Pontos</Text>
            <View style={{ width: 34 }} />
          </View>
        )}

        {/* Step Dots */}
        {step !== 'receipt' && (
          <XStack justifyContent="center" gap={8} paddingVertical={12}>
            {STEPS.slice(0, 3).map((s, i) => (
              <View key={s} style={styles.dotRow}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: t.inputBorder },
                    i <= currentStepIndex && { backgroundColor: `${t.accent}66` },
                    i === currentStepIndex && {
                      backgroundColor: t.accent,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.dotLabel,
                    { color: t.textTertiary },
                    i <= currentStepIndex && { color: t.textSecondary },
                  ]}
                >
                  {STEP_LABELS[i]}
                </Text>
              </View>
            ))}
          </XStack>
        )}

        <YStack flex={1} paddingHorizontal={20} gap={16}>
          {/* Step: Recipient */}
          {step === 'recipient' && (
            <RecipientPicker
              onSelect={handleSelectRecipient}
              onScanQR={() => router.push('/wallet/scanner')}
            />
          )}

          {/* Step: Amount */}
          {step === 'amount' && recipient && (
            <TransferForm
              recipientName={recipient.name}
              onSubmit={handleAmountSubmit}
              onBack={() => setStep('recipient')}
            />
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && recipient && (
            <YStack flex={1} gap={24} justifyContent="center" alignItems="center">
              {/* Confirm Icon */}
              <View
                style={[
                  styles.confirmIcon,
                  { backgroundColor: t.accentBg, borderColor: t.accentBorder },
                ]}
              >
                <CheckCircle size={36} color={t.accent} weight="duotone" />
              </View>

              <Text style={[styles.confirmTitle, { color: t.textPrimary }]}>Confirmar transferencia</Text>

              {/* Amount */}
              <AnimatedCounterText
                value={amount}
                suffix=" pts"
                style={[styles.confirmAmount, { color: t.accent }]}
                duration={600}
              />

              <Text style={[styles.confirmRecipient, { color: t.textSecondary }]}>
                para {recipient.name}
              </Text>

              {message ? (
                <Text style={[styles.confirmMessage, { color: t.textTertiary }]}>"{message}"</Text>
              ) : null}

              {/* Summary */}
              <GlassPanel
                padding={16}
                borderRadius={16}
                borderColor={t.glassBorder}
                blurTint={t.glassBlurTint}
                intensity={t.glassBlurIntensity}
              >
                <YStack gap={10} width="100%">
                  <XStack justifyContent="space-between">
                    <Text style={[styles.summaryLabel, { color: t.textTertiary }]}>Valor</Text>
                    <Text style={[styles.summaryValue, { color: t.textPrimary }]}>{formatPoints(amount)} pts</Text>
                  </XStack>
                  <View style={[styles.summaryDivider, { backgroundColor: t.separatorColor }]} />
                  <XStack justifyContent="space-between">
                    <Text style={[styles.summaryLabel, { color: t.textTertiary }]}>Destinatario</Text>
                    <Text style={[styles.summaryValue, { color: t.textPrimary }]}>{recipient.name}</Text>
                  </XStack>
                </YStack>
              </GlassPanel>

              {/* Biometric Button */}
              <YStack gap={10} width="100%" marginTop={8}>
                <Pressable
                  onPress={handleConfirm}
                  disabled={transferMutation.isPending}
                  style={({ pressed }) => [
                    styles.biometricButton,
                    { backgroundColor: t.primaryButton },
                    pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                    transferMutation.isPending && { opacity: 0.5 },
                  ]}
                >
                  <XStack alignItems="center" gap={10}>
                    {authMethod === 'biometric' ? (
                      <FingerprintSimple size={22} color={t.primaryButtonText} />
                    ) : (
                      <Lock size={22} color={t.primaryButtonText} />
                    )}
                    <Text style={[styles.biometricText, { color: t.primaryButtonText }]}>
                      {transferMutation.isPending
                        ? 'Processando...'
                        : authMethod === 'biometric'
                          ? 'Confirmar com biometria'
                          : authMethod === 'device_credential'
                            ? 'Confirmar com senha'
                            : 'Confirmar transferencia'}
                    </Text>
                  </XStack>
                </Pressable>

                <Pressable
                  onPress={() => setStep('amount')}
                  style={[styles.outlineButton, { borderColor: t.outlineButtonBorder }]}
                >
                  <Text style={[styles.outlineText, { color: t.outlineButtonText }]}>Voltar</Text>
                </Pressable>
              </YStack>
            </YStack>
          )}

          {/* Step: Receipt */}
          {step === 'receipt' && transferResult && (
            <TransferReceipt
              result={transferResult}
              message={message || undefined}
              onClose={() => router.dismissTo('/wallet' as any)}
            />
          )}
        </YStack>

        {/* Celebration Overlay */}
        <CelebrationOverlay />
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
  // Step Dots
  dotRow: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  // Confirm Step
  confirmIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmAmount: {
    fontSize: 42,
    fontWeight: '800',
    textAlign: 'center',
  },
  confirmRecipient: {
    fontSize: 16,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
  },
  biometricButton: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '700',
  },
  outlineButton: {
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  outlineText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
