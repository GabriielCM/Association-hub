import { View, StyleSheet, Image, useColorScheme } from 'react-native';
import { Avatar } from '@ahub/ui';
import type { ConversationParticipant } from '@ahub/shared/types';

interface GroupAvatarProps {
  participants: ConversationParticipant[];
  imageUrl?: string | undefined;
  size?: number;
}

export function GroupAvatar({
  participants,
  imageUrl,
  size = 48,
}: GroupAvatarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const containerBg = isDark ? '#374151' : '#E5E7EB';
  const borderColor = isDark ? '#1A1A2E' : '#FFFFFF';

  // If group has a custom image, use it
  if (imageUrl) {
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor: containerBg }]}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.fullImage, { borderRadius: size / 2 }]}
        />
      </View>
    );
  }

  // Show up to 3 overlapping circular avatars
  const shown = participants.slice(0, 3);
  const miniSize = size * 0.6;
  const overlap = -8;

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor: containerBg }]}>
      <View style={styles.stackRow}>
        {shown.map((p, i) => (
          <View
            key={p.id}
            style={[
              styles.stackItem,
              {
                width: miniSize,
                height: miniSize,
                marginLeft: i === 0 ? 0 : overlap,
                zIndex: shown.length - i,
                borderColor,
              },
            ]}
          >
            <Avatar src={p.avatarUrl} name={p.name} size="xs" />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  stackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackItem: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
  },
});
