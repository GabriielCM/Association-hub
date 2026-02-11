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
      backgroundColor={isOnline ? '#22C55E' : '#9CA3AF'}
      borderWidth={2}
      borderColor="$background"
    />
  );
}
