import { useCallback, useState } from 'react';
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
  const scanMutation = useScanQr();
  const lastScanResult = useWalletStore((s) => s.lastScanResult);
  const isProcessing = useWalletStore((s) => s.isProcessing);
  const resetScanner = useWalletStore((s) => s.resetScanner);

  const handleScan = useCallback(
    (data: string) => {
      try {
        const parsed = JSON.parse(data);
        scanMutation.mutate(
          { qrCodeData: data, qrCodeHash: parsed.hash ?? '' },
          {
            onSuccess: () => setShowResult(true),
            onError: () => setShowResult(true),
          }
        );
      } catch {
        // Not valid JSON, try raw
        scanMutation.mutate(
          { qrCodeData: data, qrCodeHash: '' },
          {
            onSuccess: () => setShowResult(true),
            onError: () => setShowResult(true),
          }
        );
      }
    },
    [scanMutation]
  );

  const handleAction = useCallback(
    (result: QrScanResult) => {
      setShowResult(false);
      resetScanner();

      switch (result.type) {
        case 'pdv_payment': {
          const code = (result.data as Record<string, string>)?.code;
          if (code) router.push(`/wallet/pdv-checkout?code=${code}`);
          break;
        }
        case 'user_transfer':
          router.push('/wallet/transfer');
          break;
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
      <QrScanner onScan={handleScan} isProcessing={isProcessing} />

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
