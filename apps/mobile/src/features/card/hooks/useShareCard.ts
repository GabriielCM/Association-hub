import { useRef, useCallback } from 'react';
import type ViewShot from 'react-native-view-shot';

interface UseShareCardOptions {
  withProtectionDisabled?: <T>(fn: () => Promise<T>) => Promise<T>;
}

/**
 * Hook for sharing the card as a stylized image (without QR code).
 * Uses lazy imports to avoid loading view-shot until needed.
 */
export function useShareCard(options?: UseShareCardOptions) {
  const viewShotRef = useRef<ViewShot>(null);

  const shareCard = useCallback(async () => {
    const captureAndShare = async () => {
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) return;

      const Sharing = await import('expo-sharing');
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartilhar Carteirinha',
      });
    };

    try {
      if (options?.withProtectionDisabled) {
        await options.withProtectionDisabled(captureAndShare);
      } else {
        await captureAndShare();
      }
    } catch (error) {
      console.warn('Share failed:', error);
    }
  }, [options?.withProtectionDisabled]);

  return { viewShotRef, shareCard };
}
