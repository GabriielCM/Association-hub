import { useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { YStack } from 'tamagui';
import { Text, Button, Spinner } from '@ahub/ui';
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

  const handleBarCodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (isProcessing) return;
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
        <Text style={{ fontSize: 48 }}>📷</Text>
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
      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={isProcessing ? undefined : handleBarCodeScanned}
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

      {/* Processing Indicator */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <Spinner size="large" />
          <Text style={styles.processingText}>Processando...</Text>
        </View>
      )}

      {/* Flash Toggle */}
      <Pressable
        onPress={toggleFlash}
        style={[styles.flashButton, flashEnabled && styles.flashActive]}
      >
        <Text style={{ fontSize: 20 }}>{flashEnabled ? '🔦' : '💡'}</Text>
      </Pressable>
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
