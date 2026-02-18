import { useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { Camera } from '@ahub/ui/src/icons';
import Flashlight from 'phosphor-react-native/src/icons/Flashlight';
import Lightbulb from 'phosphor-react-native/src/icons/Lightbulb';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { useWalletStore, useScanHistory } from '@/stores/wallet.store';
import { GlassPanel } from './GlassPanel';
import { useWalletTheme } from '../hooks/useWalletTheme';

interface QrScannerProps {
  onScan: (data: string) => void;
  isProcessing: boolean;
  detected?: boolean;
}

export function QrScanner({ onScan, isProcessing, detected = false }: QrScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const flashEnabled = useWalletStore((s) => s.flashEnabled);
  const toggleFlash = useWalletStore((s) => s.toggleFlash);
  const scanHistory = useScanHistory();
  const scanLock = useRef(false);
  const t = useWalletTheme();

  // Scan line animation
  const scanLineY = useSharedValue(0);
  useEffect(() => {
    scanLineY.value = withRepeat(
      withTiming(220, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(scanLineY);
  }, [scanLineY]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  // Glow animation on detection
  const glowOpacity = useSharedValue(0);
  useEffect(() => {
    glowOpacity.value = detected
      ? withSpring(1, { damping: 15 })
      : withTiming(0, { duration: 200 });
    return () => cancelAnimation(glowOpacity);
  }, [detected, glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Reset lock when parent allows scanning again
  useEffect(() => {
    if (!isProcessing) {
      scanLock.current = false;
    }
  }, [isProcessing]);

  const handleBarCodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (scanLock.current || isProcessing) return;
      scanLock.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onScan(result.data);
    },
    [onScan, isProcessing],
  );

  // Permissions loading
  if (!permission) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: t.scannerBg }]}>
        <Text style={[styles.permissionText, { color: t.textSecondary }]}>Carregando camera...</Text>
      </View>
    );
  }

  // Permission not granted
  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: t.scannerBg }]}>
        <Camera size={48} color={t.textTertiary} weight="duotone" />
        <Text style={[styles.permissionText, { color: t.textSecondary }]}>
          Permissao de camera necessaria para escanear QR Codes.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={[styles.permissionButton, { borderColor: t.accentBorder, backgroundColor: t.accentBg }]}
        >
          <Text style={[styles.permissionButtonText, { color: t.accent }]}>Permitir camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.scannerBg }]}>
      {isProcessing ? (
        <View style={[styles.processingOverlay, { backgroundColor: t.overlayBg }]}>
          <GlassPanel padding={24} borderRadius={16} blurTint={t.glassBlurTint} intensity={t.glassBlurIntensity}>
            <YStack alignItems="center" gap={12}>
              <Animated.View style={[styles.processingDot, { backgroundColor: t.accent }]} />
              <Text style={[styles.processingText, { color: t.textPrimary }]}>Processando...</Text>
            </YStack>
          </GlassPanel>
        </View>
      ) : (
        <>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarCodeScanned}
            enableTorch={flashEnabled}
          />

          {/* Dark overlay around viewfinder */}
          <View style={styles.overlay}>
            <View style={styles.viewfinder}>
              {/* Glow border on detection */}
              <Animated.View style={[styles.glowBorder, { borderColor: t.scannerGlow, shadowColor: t.scannerGlow }, glowStyle]} />

              {/* Corner brackets */}
              <View style={[styles.corner, styles.cornerTL, { borderColor: t.scannerCorner }, detected && { borderColor: t.scannerCornerDetected }]} />
              <View style={[styles.corner, styles.cornerTR, { borderColor: t.scannerCorner }, detected && { borderColor: t.scannerCornerDetected }]} />
              <View style={[styles.corner, styles.cornerBL, { borderColor: t.scannerCorner }, detected && { borderColor: t.scannerCornerDetected }]} />
              <View style={[styles.corner, styles.cornerBR, { borderColor: t.scannerCorner }, detected && { borderColor: t.scannerCornerDetected }]} />

              {/* Animated scan line */}
              {!detected && (
                <Animated.View style={[styles.scanLineContainer, scanLineStyle]}>
                  <View style={[styles.scanLineSolid, { backgroundColor: `${t.accent}80` }]} />
                </Animated.View>
              )}
            </View>
          </View>

          {/* Flash Toggle */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleFlash();
            }}
            style={[
              styles.flashButton,
              { backgroundColor: t.pressedBg, borderColor: t.inputBorder },
              flashEnabled && { backgroundColor: t.accentBg, borderColor: t.accentBorder },
            ]}
          >
            {flashEnabled
              ? <Flashlight size={22} color="#fff" weight="fill" />
              : <Lightbulb size={22} color="#fff" />
            }
          </Pressable>

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={[styles.historyTitle, { color: t.textTertiary }]}>Ultimos scans</Text>
              <XStack gap={6} flexWrap="wrap">
                {scanHistory.map((item, i) => (
                  <View key={i} style={[styles.historyPill, { backgroundColor: t.pressedBg }]}>
                    <Text style={[styles.historyText, { color: t.textTertiary }]} numberOfLines={1}>
                      {item.substring(0, 20)}...
                    </Text>
                  </View>
                ))}
              </XStack>
            </View>
          )}
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  permissionText: {
    fontSize: 15,
    textAlign: 'center',
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  permissionButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 4,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLineContainer: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 2,
  },
  scanLineSolid: {
    height: 2,
    borderRadius: 1,
    marginHorizontal: 20,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    opacity: 0.6,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  flashButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    gap: 8,
  },
  historyTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    maxWidth: 160,
  },
  historyText: {
    fontSize: 10,
  },
});
