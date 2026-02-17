import { View, StyleSheet } from 'react-native';
import { Text } from '@ahub/ui';
import { Lock, Medal } from 'phosphor-react-native';
import type { LockedBadge } from '@ahub/shared/types';

interface LockedBadgeCardProps {
  badge: LockedBadge;
}

export function LockedBadgeCard({ badge }: LockedBadgeCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {badge.iconUrl ? (
          <Text style={styles.emoji}>{badge.iconUrl}</Text>
        ) : (
          <Medal size={24} color="#9CA3AF" weight="regular" />
        )}
        <View style={styles.lockOverlay}>
          <Lock size={12} color="#6B7280" weight="fill" />
        </View>
      </View>
      <Text
        size="xs"
        color="tertiary"
        align="center"
        numberOfLines={2}
        style={styles.name}
      >
        {badge.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(156, 163, 175, 0.08)',
    borderRadius: 12,
    minWidth: 100,
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(156, 163, 175, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emoji: {
    fontSize: 20,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  name: {
    marginTop: 8,
  },
});
