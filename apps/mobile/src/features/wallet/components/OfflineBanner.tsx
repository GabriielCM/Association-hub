import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { useWalletTheme } from '../hooks/useWalletTheme';
import { WifiSlash } from 'phosphor-react-native';
interface OfflineBannerProps {
  visible: boolean;
}

/**
 * Subtle offline indicator banner for the wallet.
 * Slides down when offline, slides up when back online.
 */
export function OfflineBanner({ visible }: OfflineBannerProps) {
  const t = useWalletTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(visible ? 36 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    }),
    opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: t.offlineBg, borderColor: t.offlineBorder },
        animatedStyle,
      ]}
    >
      <XStack alignItems="center" justifyContent="center" gap={6} flex={1}>
        <WifiSlash size={14} color="rgba(248, 113, 113, 0.9)" />
        <Text style={styles.text}>Modo offline — exibindo ultimo saldo salvo</Text>
      </XStack>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  text: {
    color: 'rgba(248, 113, 113, 0.9)',
    fontSize: 11,
    fontWeight: '500',
  },
});
