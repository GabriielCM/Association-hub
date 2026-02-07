import { useEffect, useRef } from 'react';
import * as Brightness from 'expo-brightness';

export function useBrightness(maxOnMount = true) {
  const originalBrightness = useRef<number | null>(null);

  useEffect(() => {
    if (!maxOnMount) return;

    let mounted = true;

    (async () => {
      try {
        const current = await Brightness.getBrightnessAsync();
        if (mounted) {
          originalBrightness.current = current;
          await Brightness.setBrightnessAsync(1);
        }
      } catch (error) {
        // Brightness control may not be available on all devices
        console.warn('Brightness control unavailable:', error);
      }
    })();

    return () => {
      mounted = false;
      if (originalBrightness.current !== null) {
        Brightness.setBrightnessAsync(originalBrightness.current).catch(
          () => {}
        );
      }
    };
  }, [maxOnMount]);
}
