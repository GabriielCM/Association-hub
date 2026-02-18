import { type ReactNode } from 'react';
import { View, Platform, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassPanelProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: number;
  borderRadius?: number;
  intensity?: number;
  borderColor?: string;
  backgroundColor?: string;
  blurTint?: 'dark' | 'light';
}

/**
 * Glassmorphism panel for the wallet module.
 * Supports dark (default) and light variants via props.
 * iOS: BlurView with tint. Android: solid background fallback.
 */
export function GlassPanel({
  children,
  style,
  padding = 16,
  borderRadius = 20,
  intensity = 18,
  borderColor = 'rgba(34, 211, 238, 0.15)',
  backgroundColor,
  blurTint = 'dark',
}: GlassPanelProps) {
  const content = (
    <View style={{ padding }}>
      {children}
    </View>
  );

  const androidBg = backgroundColor ?? (blurTint === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.07)');

  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          {
            backgroundColor: androidBg,
            borderRadius,
            borderWidth: 1,
            borderColor,
            overflow: 'hidden',
          },
          blurTint === 'light' && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          },
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={blurTint}
      style={[
        {
          borderRadius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor,
        },
        blurTint === 'light' && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        style,
      ]}
    >
      {content}
    </BlurView>
  );
}
