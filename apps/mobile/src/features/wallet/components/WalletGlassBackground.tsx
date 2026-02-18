import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WalletGlassBackgroundProps {
  colors?: readonly [string, string];
}

/**
 * Full-screen gradient background for all wallet screens.
 * Place as the first child (absoluteFill) inside the screen root.
 */
export function WalletGlassBackground({
  colors = ['#1E0A3C', '#0D0520'],
}: WalletGlassBackgroundProps) {
  return (
    <LinearGradient
      colors={colors as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={StyleSheet.absoluteFillObject}
    />
  );
}
