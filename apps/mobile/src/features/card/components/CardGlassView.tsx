import { type ReactNode } from 'react';
import { View, Platform, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface CardGlassViewProps {
  children: ReactNode;
  intensity?: number;
  style?: ViewStyle;
  borderRadius?: number;
  tint?: 'light' | 'dark';
}

/**
 * Glassmorphism container for card overlay elements.
 * Uses BlurView on iOS, semi-transparent fallback on Android.
 */
export function CardGlassView({
  children,
  intensity = 20,
  style,
  borderRadius = 12,
  tint = 'light',
}: CardGlassViewProps) {
  const borderColor = tint === 'light'
    ? 'rgba(255, 255, 255, 0.20)'
    : 'rgba(255, 255, 255, 0.10)';

  const bgColor = tint === 'light'
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(0, 0, 0, 0.15)';

  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          {
            backgroundColor: bgColor,
            borderRadius,
            borderWidth: 1,
            borderColor,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[
        {
          borderRadius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor,
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
}
