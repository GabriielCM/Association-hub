import { useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';

const PROTECTION_KEY = 'carteirinha';

interface UseScreenCaptureProtectionOptions {
  enabled: boolean;
}

interface UseScreenCaptureProtectionReturn {
  /**
   * Wraps an async function with temporarily disabled protection.
   * On Android FLAG_SECURE blocks ViewShot, so we briefly lift it.
   * On iOS this is a no-op since ViewShot is unaffected.
   */
  withProtectionDisabled: <T>(fn: () => Promise<T>) => Promise<T>;
}

export function useScreenCaptureProtection({
  enabled,
}: UseScreenCaptureProtectionOptions): UseScreenCaptureProtectionReturn {
  const protectionActiveRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      if (protectionActiveRef.current) {
        ScreenCapture.allowScreenCaptureAsync(PROTECTION_KEY).catch(() => {});
        protectionActiveRef.current = false;
      }
      return;
    }

    ScreenCapture.preventScreenCaptureAsync(PROTECTION_KEY).catch(() => {});
    protectionActiveRef.current = true;

    // iOS: haptic feedback when screenshot is detected
    let subscription: { remove: () => void } | null = null;
    if (Platform.OS === 'ios') {
      subscription = ScreenCapture.addScreenshotListener(() => {
        import('expo-haptics').then((Haptics) =>
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
        );
      });
    }

    return () => {
      ScreenCapture.allowScreenCaptureAsync(PROTECTION_KEY).catch(() => {});
      protectionActiveRef.current = false;
      subscription?.remove();
    };
  }, [enabled]);

  const withProtectionDisabled = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      if (Platform.OS === 'ios' || !protectionActiveRef.current) {
        return fn();
      }

      // Android: temporarily lift FLAG_SECURE for ViewShot
      await ScreenCapture.allowScreenCaptureAsync(PROTECTION_KEY);
      try {
        return await fn();
      } finally {
        await ScreenCapture.preventScreenCaptureAsync(PROTECTION_KEY);
      }
    },
    [],
  );

  return { withProtectionDisabled };
}
