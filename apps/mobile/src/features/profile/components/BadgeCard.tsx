import { Pressable, View, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Medal, Check } from '@ahub/ui/src/icons';
import type { UserBadge } from '@ahub/shared/types';
import { useProfileTheme } from '../hooks/useProfileTheme';

interface BadgeCardProps {
  badge: UserBadge;
  isSelected?: boolean;
  onPress?: (badge: UserBadge) => void;
}

export function BadgeCard({ badge, isSelected, onPress }: BadgeCardProps) {
  const pt = useProfileTheme();
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('pt-BR');

  return (
    <Pressable
      onPress={() => onPress?.(badge)}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: pt.accentBgSubtle },
        isSelected && [styles.selected, { backgroundColor: pt.accentBg, borderColor: pt.accent }],
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: pt.accentBg }]}>
        <Icon icon={Medal} size="lg" color="primary" />
      </View>
      <YStack alignItems="center" gap="$0.5" flex={1}>
        <Text weight="medium" size="xs" align="center" numberOfLines={2} style={{ color: pt.textPrimary }}>
          {badge.name}
        </Text>
        <Text color="secondary" size="xs" style={{ color: pt.textSecondary }}>
          {formatDate(badge.earnedAt)}
        </Text>
      </YStack>
      {isSelected && (
        <View style={[styles.checkmark, { backgroundColor: pt.accent }]}>
          <Check size={10} color="#fff" weight="bold" />
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
    gap: 8,
    minWidth: 100,
  },
  selected: {
    borderWidth: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
