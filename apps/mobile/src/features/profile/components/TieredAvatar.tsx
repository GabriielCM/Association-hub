import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Avatar } from '@ahub/ui';

interface TieredAvatarProps {
  avatarUrl?: string | undefined;
  name: string;
  size?: number;
  subscriptionColor?: string | null | undefined;
  isOnline: boolean;
}

const RING_WIDTH = 3;
const ONLINE_DOT_SIZE = 14;

export function TieredAvatar({
  avatarUrl,
  name,
  size = 120,
  subscriptionColor,
  isOnline,
}: TieredAvatarProps) {
  const ringColor = subscriptionColor || '#9CA3AF';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderWidth: RING_WIDTH,
          borderColor: ringColor,
          borderRadius: (size + RING_WIDTH * 2) / 2,
        },
      ]}
    >
      <Avatar
        src={avatarUrl}
        name={name}
        size="2xl"
      />

      {/* Online status dot */}
      <View
        style={[
          styles.onlineDot,
          { backgroundColor: isOnline ? '#22C55E' : '#9CA3AF' },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: ONLINE_DOT_SIZE,
    height: ONLINE_DOT_SIZE,
    borderRadius: ONLINE_DOT_SIZE / 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
