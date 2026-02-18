import { useEffect, useState, useCallback } from 'react';
import { Alert, Pressable, StyleSheet, View, Image } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { CopySimple, DeviceMobile, Coin } from '@ahub/ui/src/icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  useInitiatePixPayment,
  usePixStatus,
} from '../hooks/usePdvPayment';
import type { PdvPixPaymentResult } from '@ahub/shared/types';
import { GlassPanel } from './GlassPanel';
import { CircularProgressRing } from './CircularProgressRing';
import { ShimmerGlassSkeleton } from './ShimmerGlassSkeleton';
import { useWalletTheme } from '../hooks/useWalletTheme';

interface PdvPixPaymentProps {
  checkoutCode: string;
  totalMoney: number;
  pdvName: string;
  onSuccess: (cashbackEarned: number, newBalance: number) => void;
  onCancel: () => void;
  displayHasQr?: boolean;
}

const PIX_TIMEOUT_SECONDS = 300; // 5 minutes

export function PdvPixPayment({
  checkoutCode,
  totalMoney,
  pdvName,
  onSuccess,
  onCancel,
  displayHasQr = false,
}: PdvPixPaymentProps) {
  const [pixData, setPixData] = useState<PdvPixPaymentResult | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [totalTime, setTotalTime] = useState(PIX_TIMEOUT_SECONDS);
  const [copied, setCopied] = useState(false);
  const t = useWalletTheme();

  const initiatePix = useInitiatePixPayment();
  const { data: pixStatus } = usePixStatus(
    checkoutCode,
    !!pixData,
  );

  // Initiate PIX payment on mount
  useEffect(() => {
    initiatePix.mutate(checkoutCode, {
      onSuccess: (data) => {
        setPixData(data);
      },
      onError: (err) => {
        Alert.alert('Erro', err.message || 'Falha ao iniciar pagamento PIX.');
        onCancel();
      },
    });
  }, [checkoutCode]);

  // Countdown timer
  useEffect(() => {
    if (!pixData?.pix?.expiresAt) return;

    const expiresAt = new Date(pixData.pix.expiresAt).getTime();
    const totalSeconds = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    setTotalTime(totalSeconds);

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.floor((expiresAt - Date.now()) / 1000),
      );
      setCountdown(remaining);

      if (remaining <= 0) {
        Alert.alert('Expirado', 'O tempo para pagamento PIX expirou.');
        onCancel();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [pixData?.pix?.expiresAt]);

  // Handle PIX status updates
  useEffect(() => {
    if (pixStatus?.status === 'PAID') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess(pixStatus.cashbackEarned ?? 0, pixStatus.newBalance ?? 0);
    }
  }, [pixStatus?.status]);

  const handleCopyCode = useCallback(async () => {
    if (!pixData?.pix?.copyPaste) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(pixData.pix.copyPaste);
    } catch {
      Alert.alert('Codigo PIX', pixData.pix.copyPaste);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pixData?.pix?.copyPaste]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const countdownProgress = totalTime > 0 ? countdown / totalTime : 0;

  // Loading state
  if (initiatePix.isPending || !pixData) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" gap={16}>
        <ShimmerGlassSkeleton width={200} height={200} borderRadius={16} />
        <ShimmerGlassSkeleton width={160} height={24} borderRadius={8} />
        <ShimmerGlassSkeleton width={120} height={16} borderRadius={6} />
      </YStack>
    );
  }

  return (
    <YStack flex={1} gap={20}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)}>
        <YStack alignItems="center" gap={6}>
          <Text style={[styles.title, { color: t.textPrimary }]}>Pagamento PIX</Text>
          <Text style={[styles.subtitle, { color: t.textTertiary }]}>{pdvName}</Text>
        </YStack>
      </Animated.View>

      {/* Amount */}
      <Animated.View entering={FadeIn.delay(100).duration(300)}>
        <GlassPanel
          padding={16}
          borderRadius={16}
          borderColor={t.accentBorder}
          blurTint={t.glassBlurTint}
          intensity={t.glassBlurIntensity}
        >
          <YStack alignItems="center" gap={4}>
            <Text style={[styles.amountLabel, { color: t.textTertiary }]}>Valor</Text>
            <Text style={[styles.amountValue, { color: t.accent }]}>R$ {totalMoney.toFixed(2)}</Text>
          </YStack>
        </GlassPanel>
      </Animated.View>

      {/* QR Code Area */}
      <Animated.View entering={FadeIn.delay(200).duration(300)}>
        {displayHasQr ? (
          <GlassPanel
            padding={24}
            borderRadius={16}
            blurTint={t.glassBlurTint}
            intensity={t.glassBlurIntensity}
            borderColor={t.glassBorder}
          >
            <YStack alignItems="center" gap={12}>
              <DeviceMobile size={36} color={t.accent} weight="duotone" />
              <Text style={[styles.displayTitle, { color: t.textPrimary }]}>QR Code PIX no display</Text>
              <Text style={[styles.displaySubtitle, { color: t.textTertiary }]}>
                Escaneie o QR Code PIX exibido na tela do PDV{'\n'}com o app do seu banco
              </Text>
            </YStack>
          </GlassPanel>
        ) : (
          <GlassPanel
            padding={16}
            borderRadius={16}
            blurTint={t.glassBlurTint}
            intensity={t.glassBlurIntensity}
            borderColor={t.glassBorder}
          >
            <YStack alignItems="center" gap={14}>
              {/* QR Code Image - always white bg for readability */}
              {pixData.pix.qrCodeBase64 ? (
                <View style={styles.qrContainer}>
                  <Image
                    source={{ uri: `data:image/png;base64,${pixData.pix.qrCodeBase64}` }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={[styles.qrPlaceholder, { backgroundColor: t.inputBg, borderColor: t.inputBorder }]}>
                  <Text style={[styles.qrPlaceholderText, { color: t.textTertiary }]}>
                    Copie o codigo PIX abaixo{'\n'}e cole no app do seu banco
                  </Text>
                </View>
              )}

              {/* Copy & Paste */}
              <Pressable
                onPress={handleCopyCode}
                style={({ pressed }) => [
                  styles.copyButton,
                  { backgroundColor: t.accentBg, borderColor: t.accentBorder },
                  pressed && { opacity: 0.8 },
                  copied && { borderColor: t.successBorder, backgroundColor: t.successBg },
                ]}
              >
                <XStack alignItems="center" gap={8}>
                  <CopySimple size={16} color={copied ? t.success : t.accent} />
                  <YStack flex={1}>
                    <Text style={[styles.copyCode, { color: t.textSecondary }]} numberOfLines={1}>
                      {pixData.pix.copyPaste?.substring(0, 40)}...
                    </Text>
                    <Text style={[styles.copyLabel, { color: copied ? t.success : t.accent }]}>
                      {copied ? 'Copiado!' : 'Toque para copiar'}
                    </Text>
                  </YStack>
                </XStack>
              </Pressable>
            </YStack>
          </GlassPanel>
        )}
      </Animated.View>

      {/* Countdown Timer - Circular */}
      <Animated.View entering={FadeIn.delay(300).duration(300)}>
        <YStack alignItems="center" gap={8}>
          <CircularProgressRing
            progress={countdownProgress}
            size={72}
            strokeWidth={5}
            color={countdown < 60 ? t.error : t.accent}
            trackColor={t.ringTrack}
            duration={0}
          >
            <YStack alignItems="center">
              <Text style={[styles.timerValue, { color: countdown < 60 ? t.error : t.accent }]}>
                {formatTime(countdown)}
              </Text>
            </YStack>
          </CircularProgressRing>
          <Text style={[styles.timerLabel, { color: t.textTertiary }]}>Aguardando pagamento...</Text>
        </YStack>
      </Animated.View>

      {/* Cashback Preview */}
      {pixData.cashbackPreview > 0 && (
        <Animated.View entering={FadeIn.delay(400).duration(300)}>
          <GlassPanel
            padding={14}
            borderRadius={14}
            borderColor={t.successBorder}
            blurTint={t.glassBlurTint}
            intensity={t.glassBlurIntensity}
          >
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" gap={8}>
                <Coin size={18} color={t.success} weight="duotone" />
                <Text style={[styles.cashbackLabel, { color: t.textSecondary }]}>Cashback</Text>
              </XStack>
              <Text style={[styles.cashbackValue, { color: t.success }]}>+{pixData.cashbackPreview} pts</Text>
            </XStack>
          </GlassPanel>
        </Animated.View>
      )}

      {/* Cancel */}
      <YStack marginTop="auto">
        <Pressable onPress={onCancel} style={[styles.cancelButton, { borderColor: t.outlineButtonBorder }]}>
          <Text style={[styles.cancelText, { color: t.outlineButtonText }]}>Cancelar</Text>
        </Pressable>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  displayTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  displaySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  // QR Code - always white bg for readability
  qrContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  qrPlaceholderText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Copy Button
  copyButton: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  copyCode: {
    fontSize: 11,
  },
  copyLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  // Timer
  timerValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  timerLabel: {
    fontSize: 13,
  },
  // Cashback
  cashbackLabel: {
    fontSize: 13,
  },
  cashbackValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  // Cancel
  cancelButton: {
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
