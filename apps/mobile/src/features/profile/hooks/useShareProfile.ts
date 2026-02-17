import { useRef, useCallback } from 'react';
import type ViewShot from 'react-native-view-shot';

export function useShareProfile() {
  const viewShotRef = useRef<ViewShot>(null);

  const shareProfile = useCallback(async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) return;

      const Sharing = await import('expo-sharing');
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartilhar Perfil',
      });
    } catch (error) {
      console.warn('Share profile failed:', error);
    }
  }, []);

  return { viewShotRef, shareProfile };
}
