import { useCallback, useState, useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Text, Button, Spinner, ScreenHeader } from '@ahub/ui';
import { useEvent } from '@/features/events/hooks/useEvents';
import { useCheckin } from '@/features/events/hooks/useEventMutations';
import { useEventsStore, useCheckinCelebration } from '@/stores/events.store';
import { CelebrationOverlay } from '@/features/events/components/CelebrationOverlay';
import type { CheckinResponse } from '@ahub/shared/types';

export default function CheckInScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  const scanLockRef = useRef(false);

  const { data: event } = useEvent(eventId);
  const checkinMutation = useCheckin(eventId);
  const showCelebration = useEventsStore((s) => s.showCheckinCelebration);
  const celebration = useCheckinCelebration();
  const wasVisible = useRef(false);

  // Auto-close camera screen after celebration overlay dismisses
  useEffect(() => {
    if (celebration.visible) {
      wasVisible.current = true;
    } else if (wasVisible.current) {
      wasVisible.current = false;
      router.back();
    }
  }, [celebration.visible]);

  const handleBarCodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (scanLockRef.current || scanned) return;
      scanLockRef.current = true;
      setScanned(true);
      setError(null);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(result.data);
      } catch {
        setError('QR Code nao reconhecido');
        scanLockRef.current = false;
        setScanned(false);
        return;
      }

      if (parsed.type !== 'event_checkin') {
        setError('QR Code nao e de check-in de evento');
        scanLockRef.current = false;
        setScanned(false);
        return;
      }

      checkinMutation.mutate(
        {
          eventId: eventId,
          checkinNumber: parsed.checkin_number as number,
          securityToken: parsed.security_token as string,
          timestamp: parsed.timestamp as number,
        },
        {
          onSuccess: (data: CheckinResponse) => {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
            showCelebration(data);
          },
          onError: (err: Error) => {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Error
            );
            setError(err.message ?? 'Erro ao realizar check-in');
            scanLockRef.current = false;
            setScanned(false);
          },
        }
      );
    },
    [scanned, checkinMutation, showCelebration]
  );

  const handleRetry = useCallback(() => {
    setError(null);
    setScanned(false);
    scanLockRef.current = false;
  }, []);

  const currentCheckin = event?.currentCheckinNumber ?? 1;
  const pointsPerCheckin = event
    ? Math.floor(event.pointsTotal / event.checkinsCount)
    : 0;

  // Permission states
  if (!permission) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner />
        </YStack>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$4"
          gap="$4"
        >
          <Text style={{ fontSize: 48 }}>📷</Text>
          <Text align="center">
            Permissao de camera necessaria para escanear QR Codes.
          </Text>
          <Button variant="primary" onPress={requestPermission}>
            Permitir camera
          </Button>
          <Button variant="ghost" onPress={() => router.back()}>
            Voltar
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {/* Header */}
      <ScreenHeader title="Check-in" variant="overlay" onBack={() => router.back()} />

      {/* Camera */}
      <View style={styles.container}>
        {checkinMutation.isPending ? (
          <View style={styles.processingOverlay}>
            <Spinner size="lg" />
            <Text style={styles.processingText}>
              Processando check-in...
            </Text>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarCodeScanned}
          />
        )}

        {/* Viewfinder */}
        <View style={styles.overlay}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>
      </View>

      {/* Bottom Info */}
      <YStack
        position="absolute"
        bottom={40}
        left={0}
        right={0}
        alignItems="center"
        gap="$2"
        padding="$4"
      >
        {error ? (
          <YStack
            backgroundColor="rgba(220,38,38,0.9)"
            borderRadius="$md"
            padding="$3"
            alignItems="center"
            gap="$2"
          >
            <Text style={{ color: '#fff' }} weight="semibold">
              {error}
            </Text>
            <Button variant="ghost" size="sm" onPress={handleRetry}>
              <Text style={{ color: '#fff' }}>Tentar novamente</Text>
            </Button>
          </YStack>
        ) : (
          <YStack
            backgroundColor="rgba(0,0,0,0.7)"
            borderRadius="$md"
            padding="$3"
            alignItems="center"
            gap="$1"
          >
            <Text style={{ color: 'rgba(255,255,255,0.8)' }} size="sm">
              Aponte para o QR Code no display
            </Text>
            <Text style={{ color: '#fff' }} weight="bold">
              CHECK-IN {currentCheckin} de {event?.checkinsCount ?? '?'}
            </Text>
            <Text style={{ color: '#7C3AED' }} weight="semibold">
              +{pointsPerCheckin} pontos
            </Text>
          </YStack>
        )}
      </YStack>

      {/* Celebration Overlay */}
      <CelebrationOverlay />
    </SafeAreaView>
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
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
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
});
