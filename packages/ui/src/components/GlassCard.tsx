import React from 'react';
import { Platform, useColorScheme } from 'react-native';
import type { ViewStyle } from 'react-native';
import { YStack } from 'tamagui';

type GlassIntensity = 'subtle' | 'medium' | 'strong';
type GlassTint = 'light' | 'dark' | 'default';

export interface GlassCardProps {
  children: React.ReactNode;
  intensity?: GlassIntensity;
  /** @deprecated No longer used — kept for API compatibility */
  tint?: GlassTint;
  padding?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const SHADOW_MAP = {
  subtle: {
    light: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 },
    dark: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.20, shadowRadius: 6 },
  },
  medium: {
    light: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
    dark: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.30, shadowRadius: 8 },
  },
  strong: {
    light: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 14 },
    dark: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.40, shadowRadius: 14 },
  },
} as const;

export function GlassCard({
  children,
  intensity = 'medium',
  padding = 16,
  borderRadius = 16,
  style,
}: GlassCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const shadow = isDark ? SHADOW_MAP[intensity].dark : SHADOW_MAP[intensity].light;
  const backgroundColor = isDark ? '#1E1E2E' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <YStack
      style={[
        {
          borderRadius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor,
          backgroundColor,
          ...shadow,
          ...(Platform.OS === 'android' ? { elevation: intensity === 'strong' ? 4 : intensity === 'medium' ? 2 : 1 } : {}),
        },
        style,
      ]}
    >
      <YStack style={{ padding }}>
        {children}
      </YStack>
    </YStack>
  );
}
