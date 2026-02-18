import { useCallback, useState, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@ahub/ui';
import { CaretLeft } from '@ahub/ui/src/icons';
import { QrScanner } from '@/features/wallet/components/QrScanner';
import { ScanResultModal } from '@/features/wallet/components/ScanResultModal';
import { useScanQr } from '@/features/wallet/hooks/useScanner';
import { useWalletStore } from '@/stores/wallet.store';
import { useWalletTheme } from '@/features/wallet/hooks/useWalletTheme';
import type { QrScanResult } from '@ahub/shared/types';

export default function ScannerScreen() {
  const [showResult, setShowResult] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [detected, setDetected] = useState(false);
  const scanMutation = useScanQr();
  const lastScanResult = useWalletStore((s) => s.lastScanResult);
  const isProcessing = useWalletStore((s) => s.isProcessing);
  const resetScanner = useWalletStore((s) => s.resetScanner);
  const addScanHistory = useWalletStore((s) => s.addScanHistory);
  const scanLockRef = useRef(false);
  const t = useWalletTheme();

  const handleScan = useCallback(
    (data: string) => {
      if (scanLockRef.current) return;
      scanLockRef.current = true;
      setScanned(true);
      setDetected(true);
      addScanHistory(data);

      let qrCodeData = data;
      let qrCodeHash = '';

      try {
        const parsed = JSON.parse(data);
        if (parsed.data && typeof parsed.data === 'string') {
          qrCodeData = parsed.data;
          qrCodeHash = parsed.hash ?? '';
        } else {
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
        },
      );
    },
    [scanMutation, addScanHistory],
  );

  const handleAction = useCallback(
    (result: QrScanResult) => {
      setShowResult(false);
      setScanned(false);
      setDetected(false);
      scanLockRef.current = false;
      resetScanner();

      switch (result.type) {
        case 'pdv_payment': {
          const code = (result.data as Record<string, string>)?.code;
          if (code) router.push(`/wallet/pdv-checkout?code=${code}`);
          break;
        }
        case 'member_card': {
          const mcData = result.data as Record<string, unknown> | undefined;
          const user = mcData?.user as Record<string, string> | undefined;
          if (user?.id) {
            router.push(
              `/wallet/transfer?recipientId=${user.id}&recipientName=${encodeURIComponent(user.name ?? '')}`,
            );
          }
          break;
        }
        case 'user_transfer': {
          const trData = result.data as Record<string, unknown> | undefined;
          const recipient = trData?.recipient as Record<string, string> | undefined;
          if (recipient?.id) {
            router.push(
              `/wallet/transfer?recipientId=${recipient.id}&recipientName=${encodeURIComponent(recipient.name ?? '')}`,
            );
          } else {
            router.push('/wallet/transfer');
          }
          break;
        }
        case 'event_checkin':
          break;
        default:
          break;
      }
    },
    [resetScanner],
  );

  const handleClose = useCallback(() => {
    setShowResult(false);
    setScanned(false);
    setDetected(false);
    scanLockRef.current = false;
    resetScanner();
  }, [resetScanner]);

  return (
    <View style={[styles.root, { backgroundColor: t.scannerBg }]}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Overlay Header - semi-transparent over camera */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.backButton}
          >
            <CaretLeft size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Scanner</Text>
          <View style={{ width: 34 }} />
        </View>

        {/* Scanner */}
        <QrScanner
          onScan={handleScan}
          isProcessing={isProcessing || scanned}
          detected={detected}
        />

        {/* Hint */}
        {!scanned && (
          <YStack
            position="absolute"
            bottom={80}
            left={0}
            right={0}
            alignItems="center"
          >
            <View style={styles.hintPill}>
              <Text style={styles.hintText}>
                Aponte para um QR Code
              </Text>
            </View>
          </YStack>
        )}

        {/* Result Modal */}
        <ScanResultModal
          result={lastScanResult}
          visible={showResult}
          onClose={handleClose}
          onAction={handleAction}
        />
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  // Scanner header stays dark/semi-transparent since it overlays camera
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  hintPill: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
});
