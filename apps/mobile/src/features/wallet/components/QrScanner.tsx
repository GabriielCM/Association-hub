import { useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { YStack } from 'tamagui';
import { Text, Button, Spinner, Icon } from '@ahub/ui';
import { Camera } from '@ahub/ui/src/icons';
import Flashlight from 'phosphor-react-native/src/icons/Flashlight';
import Lightbulb from 'phosphor-react-native/src/icons/Lightbulb';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useWalletStore } from '@/stores/wallet.store';

interface QrScannerProps {
  onScan: (data: string) => void;
  isProcessing: boolean;
}

export function QrScanner({ onScan, isProcessing }: QrScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const flashEnabled = useWalletStore((s) => s.flashEnabled);
  const toggleFlash = useWalletStore((s) => s.toggleFlash);
  const scanLock = useRef(false);

  // Reset lock when parent allows scanning again
  useEffect(() => {
    if (!isProcessing) {
      scanLock.current = false;
    }
  }, [isProcessing]);

  const handleBarCodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      // useRef updates synchronously - blocks BEFORE next queued callback
      if (scanLock.current || isProcessing) return;
      scanLock.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onScan(result.data);
    },
    [onScan, isProcessing]
  );

  // Permissions still loading
  if (!permission) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner />
      </YStack>
    );
  }

  // Permission not granted
  if (!permission.granted) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
        <Icon icon={Camera} size={48} color="muted" weight="duotone" />
        <Text align="center">
          Permissão de câmera necessária para escanear QR Codes.
        </Text>
        <Button variant="outline" onPress={requestPermission}>
          Permitir câmera
        </Button>
      </YStack>
    );
  }

  return (
    <View style={styles.container}>
      {isProcessing ? (
        <View style={styles.processingOverlay}>
          <Spinner size="lg" />
          <Text style={styles.processingText}>Processando...</Text>
        </View>
      ) : (
        <>
          {/* Camera - unmounted during processing to stop all barcode events */}
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarCodeScanned}
            enableTorch={flashEnabled}
          />

          {/* Viewfinder Overlay */}
          <View style={styles.overlay}>
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
          </View>

          {/* Flash Toggle */}
          <Pressable
            onPress={toggleFlash}
            style={[styles.flashButton, flashEnabled && styles.flashActive]}
          >
            <Icon icon={flashEnabled ? Flashlight : Lightbulb} size="md" color="#FFFFFF" weight={flashEnabled ? 'fill' : 'regular'} />
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#7C3AED',
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  flashButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.8)',
  },
});
