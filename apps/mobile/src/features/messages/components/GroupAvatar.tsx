import { View, StyleSheet } from 'react-native';
import { Avatar } from '@ahub/ui';
import { Image } from 'react-native';
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
  // If group has a custom image, use it
  if (imageUrl) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.fullImage, { borderRadius: size / 2 }]}
        />
      </View>
    );
  }

  // Show up to 4 participant avatars in a grid
  const shown = participants.slice(0, 4);
  const miniSize = size * 0.55;

  if (shown.length <= 2) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={styles.row}>
          {shown.map((p) => (
            <Avatar key={p.id} src={p.avatarUrl} name={p.name} size="xs" />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.grid}>
        {shown.map((p) => (
          <View
            key={p.id}
            style={[styles.gridItem, { width: miniSize, height: miniSize }]}
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
    backgroundColor: '#E5E7EB',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItem: {
    borderRadius: 999,
    overflow: 'hidden',
  },
});
