import { View, StyleSheet } from 'react-native';
import { Text } from '@ahub/ui';
import { Lock, Medal } from 'phosphor-react-native';
import type { LockedBadge } from '@ahub/shared/types';
import { useProfileTheme } from '../hooks/useProfileTheme';

interface LockedBadgeCardProps {
  badge: LockedBadge;
}

export function LockedBadgeCard({ badge }: LockedBadgeCardProps) {
  const pt = useProfileTheme();

  return (
    <View style={[styles.container, { backgroundColor: pt.lockedBg }]}>
      <View style={[styles.iconContainer, { backgroundColor: pt.lockedIconBg }]}>
        {badge.iconUrl ? (
          <Text style={styles.emoji}>{badge.iconUrl}</Text>
        ) : (
          <Medal size={24} color={pt.lockedIconColor} weight="regular" />
        )}
        <View style={[styles.lockOverlay, { backgroundColor: pt.lockOverlayBg, borderColor: pt.lockOverlayBorder }]}>
          <Lock size={12} color={pt.lockColor} weight="fill" />
        </View>
      </View>
      <Text
        size="xs"
        color="tertiary"
        align="center"
        numberOfLines={2}
        style={[styles.name, { color: pt.textTertiary }]}
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
    borderRadius: 12,
    minWidth: 100,
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  name: {
    marginTop: 8,
  },
});
