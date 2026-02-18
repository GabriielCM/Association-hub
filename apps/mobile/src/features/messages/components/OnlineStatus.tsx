import type { ReactNode } from 'react';
import { View } from 'tamagui';

interface OnlineStatusProps {
  isOnline: boolean;
  size?: number;
}

export function OnlineStatus({ isOnline, size = 10 }: OnlineStatusProps) {
  return (
    <View
      width={size}
      height={size}
      borderRadius="$full"
      backgroundColor={isOnline ? '$success' : '$colorTertiary'}
      borderWidth={2}
      borderColor="$background"
    />
  );
}

interface StatusRingProps {
  isOnline: boolean;
  children: ReactNode;
  size?: number;
  ringWidth?: number;
}

/**
 * Wraps an avatar with a colored ring indicating online status.
 * Green ring = online, transparent = offline.
 */
export function StatusRing({
  isOnline,
  children,
  size = 48,
  ringWidth = 2,
}: StatusRingProps) {
  return (
    <View
      width={size + ringWidth * 2 + 2}
      height={size + ringWidth * 2 + 2}
      borderRadius="$full"
      borderWidth={ringWidth}
      borderColor={isOnline ? '$success' : 'transparent'}
      alignItems="center"
      justifyContent="center"
    >
      {children}
    </View>
  );
}
