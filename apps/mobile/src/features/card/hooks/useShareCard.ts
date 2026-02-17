import { useRef, useCallback } from 'react';
import type ViewShot from 'react-native-view-shot';

/**
 * Hook for sharing the card as a stylized image (without QR code).
 * Uses lazy imports to avoid loading view-shot until needed.
 */
export function useShareCard() {
  const viewShotRef = useRef<ViewShot>(null);

  const shareCard = useCallback(async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) return;

      const Sharing = await import('expo-sharing');
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartilhar Carteirinha',
      });
    } catch (error) {
      console.warn('Share failed:', error);
    }
  }, []);

  return { viewShotRef, shareCard };
}
