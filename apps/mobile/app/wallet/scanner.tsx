import { useCallback, useState, useRef } from 'react';
import { router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button } from '@ahub/ui';
import { QrScanner } from '@/features/wallet/components/QrScanner';
import { ScanResultModal } from '@/features/wallet/components/ScanResultModal';
import { useScanQr } from '@/features/wallet/hooks/useScanner';
import { useWalletStore } from '@/stores/wallet.store';
import type { QrScanResult } from '@ahub/shared/types';

export default function ScannerScreen() {
  const [showResult, setShowResult] = useState(false);
  const [scanned, setScanned] = useState(false);
  const scanMutation = useScanQr();
  const lastScanResult = useWalletStore((s) => s.lastScanResult);
  const isProcessing = useWalletStore((s) => s.isProcessing);
  const resetScanner = useWalletStore((s) => s.resetScanner);
  const scanLockRef = useRef(false);

  const handleScan = useCallback(
    (data: string) => {
      if (scanLockRef.current) return;
      scanLockRef.current = true;
      setScanned(true);

      let qrCodeData = data;
      let qrCodeHash = '';

      try {
        const parsed = JSON.parse(data);
        if (parsed.data && typeof parsed.data === 'string') {
          // Envelope format: { data: "...", hash: "..." }
          qrCodeData = parsed.data;
          qrCodeHash = parsed.hash ?? '';
        } else {
          // Legacy format: hash field in the data itself
          qrCodeHash = parsed.hash ?? '';
        }
      } catch {
        // Not valid JSON, use raw data
      }

      scanMutation.mutate(
        { qrCodeData, qrCodeHash },
        {
          onSuccess: () => setShowResult(true),
          onError: (error) => {
            const errorResult: QrScanResult = {
              type: 'user_transfer',
              valid: false,
              error: error.message ?? 'Erro ao processar QR Code.',
            };
            useWalletStore.getState().setLastScanResult(errorResult);
            setShowResult(true);
          },
        }
      );
    },
    [scanMutation]
  );

  const handleAction = useCallback(
    (result: QrScanResult) => {
      setShowResult(false);
      setScanned(false);
      scanLockRef.current = false;
      resetScanner();

      switch (result.type) {
        case 'pdv_payment': {
          const code = (result.data as Record<string, string>)?.code;
          if (code) router.push(`/wallet/pdv-checkout?code=${code}`);
          break;
        }
        case 'user_transfer': {
          const data = result.data as Record<string, unknown> | undefined;
          const recipient = data?.recipient as Record<string, string> | undefined;
          if (recipient?.id) {
            router.push(
              `/wallet/transfer?recipientId=${recipient.id}&recipientName=${encodeURIComponent(recipient.name ?? '')}`
            );
          } else {
            router.push('/wallet/transfer');
          }
          break;
        }
        case 'event_checkin':
          // Navigate to event check-in flow
          break;
        default:
          break;
      }
    },
    [resetScanner]
  );

  const handleClose = useCallback(() => {
    setShowResult(false);
    setScanned(false);
    scanLockRef.current = false;
    resetScanner();
  }, [resetScanner]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {/* Header */}
      <XStack
        alignItems="center"
        gap="$2"
        padding="$4"
        position="absolute"
        top={50}
        left={0}
        right={0}
        zIndex={10}
      >
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          ←
        </Button>
        <Heading level={4} style={{ color: '#fff' }}>Scanner</Heading>
      </XStack>

      {/* Scanner */}
      <QrScanner onScan={handleScan} isProcessing={isProcessing || scanned} />

      {/* Hint */}
      <YStack
        position="absolute"
        bottom={60}
        left={0}
        right={0}
        alignItems="center"
      >
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
          Aponte para um QR Code
        </Text>
      </YStack>

      {/* Result Modal */}
      <ScanResultModal
        result={lastScanResult}
        visible={showResult}
        onClose={handleClose}
        onAction={handleAction}
      />
    </SafeAreaView>
  );
}
