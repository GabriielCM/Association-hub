import { useState, useEffect } from 'react';
import { XStack } from 'tamagui';
import { Platform } from 'react-native';

import { Text } from '@ahub/ui';

let NetInfo: any = null;

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Dynamically import NetInfo to avoid crashes if not installed
    async function checkConnectivity() {
      try {
        if (Platform.OS === 'web') return;
        const netInfoModule = await import(
          '@react-native-community/netinfo'
        ).catch(() => null);
        if (!netInfoModule) return;

        NetInfo = netInfoModule.default;
        const unsubscribe = NetInfo.addEventListener(
          (state: { isConnected: boolean | null }) => {
            setIsOffline(state.isConnected === false);
          }
        );
        return () => unsubscribe();
      } catch {
        // NetInfo not available
      }
    }
    checkConnectivity();
  }, []);

  if (!isOffline) return null;

  return (
    <XStack
      backgroundColor="$warning"
      paddingVertical="$1"
      paddingHorizontal="$4"
      alignItems="center"
      justifyContent="center"
    >
      <Text size="xs" style={{ color: '#000' }} weight="semibold">
        Voce esta offline - dados podem estar desatualizados
      </Text>
    </XStack>
  );
}
