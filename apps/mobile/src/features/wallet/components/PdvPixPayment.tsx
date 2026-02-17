import { useEffect, useState, useCallback } from 'react';
import { Alert, Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Heading, Button, Spinner, Card, Icon } from '@ahub/ui';
import { PixIcon } from '@ahub/ui/src/icons';
import { DeviceMobile } from '@ahub/ui/src/icons';
import {
  useInitiatePixPayment,
  usePixStatus,
} from '../hooks/usePdvPayment';
import type { PdvPixPaymentResult } from '@ahub/shared/types';

interface PdvPixPaymentProps {
  checkoutCode: string;
  totalMoney: number;
  pdvName: string;
  onSuccess: (cashbackEarned: number, newBalance: number) => void;
  onCancel: () => void;
  displayHasQr?: boolean;
}

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
  const [copied, setCopied] = useState(false);

  const initiatePix = useInitiatePixPayment();
  const { data: pixStatus } = usePixStatus(
    checkoutCode,
    !!pixData // Only poll when PIX is initiated
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

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.floor(
          (new Date(pixData.pix.expiresAt).getTime() - Date.now()) / 1000
        )
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
      onSuccess(pixStatus.cashbackEarned ?? 0, pixStatus.newBalance ?? 0);
    }
  }, [pixStatus?.status]);

  const handleCopyCode = useCallback(async () => {
    if (!pixData?.pix?.copyPaste) return;
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(pixData.pix.copyPaste);
    } catch {
      Alert.alert('Código PIX', pixData.pix.copyPaste);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pixData?.pix?.copyPaste]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (initiatePix.isPending || !pixData) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" gap="$3">
        <Spinner size="lg" />
        <Text color="secondary">Gerando PIX...</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} gap="$4">
      {/* Header */}
      <YStack alignItems="center" gap="$1">
        <PixIcon size={40} />
        <Heading level={4}>Pagamento PIX</Heading>
        <Text color="secondary" size="sm">{pdvName}</Text>
      </YStack>

      {/* Amount */}
      <Card variant="flat" style={{ borderWidth: 1, borderColor: '#7C3AED' }}>
        <YStack alignItems="center" gap="$1">
          <Text color="secondary" size="sm">Valor</Text>
          <Heading level={2}>R$ {totalMoney.toFixed(2)}</Heading>
        </YStack>
      </Card>

      {/* QR Code Area */}
      {displayHasQr ? (
        <Card variant="flat">
          <YStack alignItems="center" gap="$3" padding="$4">
            <Icon icon={DeviceMobile} size="xl" color="primary" weight="duotone" />
            <Heading level={4} align="center">
              QR Code PIX no display
            </Heading>
            <Text color="secondary" size="sm" align="center">
              Escaneie o QR Code PIX exibido na tela do PDV{'\n'}com o app do seu banco
            </Text>
          </YStack>
        </Card>
      ) : (
        <Card variant="flat">
          <YStack alignItems="center" gap="$3" padding="$2">
            {pixData.pix.qrCodeBase64 ? (
              <YStack
                width={200}
                height={200}
                backgroundColor="white"
                borderRadius={8}
                justifyContent="center"
                alignItems="center"
                overflow="hidden"
              >
                {/* Base64 QR code would be rendered as an Image */}
                <Text size="xs" color="secondary" align="center">
                  Escaneie o QR Code{'\n'}no app do seu banco
                </Text>
              </YStack>
            ) : (
              <YStack
                width={200}
                height={200}
                backgroundColor="$gray3"
                borderRadius={8}
                justifyContent="center"
                alignItems="center"
              >
                <Text size="xs" color="secondary" align="center">
                  Copie o codigo PIX abaixo{'\n'}e cole no app do seu banco
                </Text>
              </YStack>
            )}

            {/* Copy & Paste Button */}
            <Pressable onPress={handleCopyCode} style={{ width: '100%' }}>
              <YStack
                backgroundColor="$gray3"
                borderRadius={8}
                padding="$3"
                alignItems="center"
              >
                <Text size="xs" color="secondary" numberOfLines={1}>
                  {pixData.pix.copyPaste?.substring(0, 40)}...
                </Text>
                <Text
                  size="sm"
                  weight="semibold"
                  color={copied ? 'success' : 'primary'}
                  marginTop="$1"
                >
                  {copied ? 'Copiado!' : 'Toque para copiar'}
                </Text>
              </YStack>
            </Pressable>
          </YStack>
        </Card>
      )}

      {/* Timer */}
      <YStack alignItems="center" gap="$1">
        <Text color="secondary" size="sm">Expira em</Text>
        <Text
          weight="bold"
          size="lg"
          color={countdown < 60 ? 'error' : undefined}
        >
          {formatTime(countdown)}
        </Text>
      </YStack>

      {/* Status */}
      <YStack alignItems="center" gap="$2">
        <XStack gap="$2" alignItems="center">
          <Spinner size="sm" />
          <Text color="secondary" size="sm">
            Aguardando pagamento...
          </Text>
        </XStack>
      </YStack>

      {/* Cashback preview */}
      {pixData.cashbackPreview > 0 && (
        <Card variant="flat">
          <XStack justifyContent="space-between" alignItems="center">
            <Text size="sm" color="secondary">Cashback</Text>
            <Text size="sm" weight="semibold" color="success">
              +{pixData.cashbackPreview} pts
            </Text>
          </XStack>
        </Card>
      )}

      {/* Cancel */}
      <YStack marginTop="auto">
        <Button variant="outline" onPress={onCancel}>
          Cancelar
        </Button>
      </YStack>
    </YStack>
  );
}
