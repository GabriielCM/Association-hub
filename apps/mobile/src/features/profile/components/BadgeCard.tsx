import { Pressable, View, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import type { UserBadge } from '@ahub/shared/types';

interface BadgeCardProps {
  badge: UserBadge;
  isSelected?: boolean;
  onPress?: (badge: UserBadge) => void;
}

export function BadgeCard({ badge, isSelected, onPress }: BadgeCardProps) {
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('pt-BR');

  return (
    <Pressable
      onPress={() => onPress?.(badge)}
      style={({ pressed }) => [
        styles.container,
        isSelected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{badge.iconUrl || '🏆'}</Text>
      </View>
      <YStack alignItems="center" gap="$0.5" flex={1}>
        <Text weight="medium" size="xs" align="center" numberOfLines={2}>
          {badge.name}
        </Text>
        <Text color="secondary" size="xs">
          {formatDate(badge.earnedAt)}
        </Text>
      </YStack>
      {isSelected && (
        <View style={styles.checkmark}>
          <Text style={{ fontSize: 10, color: '#fff' }}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    gap: 8,
    minWidth: 100,
  },
  selected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
