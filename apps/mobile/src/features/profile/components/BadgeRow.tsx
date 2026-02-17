import { Pressable, View, StyleSheet } from 'react-native';
import { XStack } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Medal } from '@ahub/ui/src/icons';
import type { ProfileBadge } from '@ahub/shared/types';

interface BadgeRowProps {
  badges: ProfileBadge[];
  maxVisible?: number;
  onPress?: () => void;
}

export function BadgeRow({
  badges,
  maxVisible = 3,
  onPress,
}: BadgeRowProps) {
  const visible = badges.slice(0, maxVisible);
  const remaining = badges.length - maxVisible;

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <XStack gap="$2" alignItems="center">
        {visible.map((badge) => (
          <View key={badge.id} style={styles.badgeIcon}>
            {badge.iconUrl ? (
              <Text style={styles.badgeEmoji}>{badge.iconUrl}</Text>
            ) : (
              <Icon icon={Medal} size="sm" color="primary" />
            )}
          </View>
        ))}
        {remaining > 0 && (
          <View style={styles.moreContainer}>
            <Text size="xs" color="secondary" weight="medium">
              +{remaining}
            </Text>
          </View>
        )}
      </XStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 16,
  },
  moreContainer: {
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
