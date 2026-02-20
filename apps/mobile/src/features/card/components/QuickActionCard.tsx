import { Pressable, StyleSheet } from 'react-native';
import { XStack } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { CaretRight } from '@ahub/ui/src/icons';
import { CardGlassView } from './CardGlassView';
import { useCardTheme } from '../hooks/useCardTheme';
import type { Icon as PhosphorIcon } from 'phosphor-react-native';

interface QuickActionCardProps {
  title: string;
  icon: PhosphorIcon;
  onPress: () => void;
}

/**
 * Quick action card — clean menu item with icon, title, and chevron.
 * Used below the card for Benefits and History navigation.
 */
export function QuickActionCard({
  title,
  icon,
  onPress,
}: QuickActionCardProps) {
  const ct = useCardTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <CardGlassView
        borderRadius={16}
        tint={ct.glassTint}
        intensity={12}
        style={styles.card}
      >
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal={16}
          paddingVertical={14}
        >
          <XStack gap={10} alignItems="center">
            <Icon icon={icon} size="md" color={ct.accent} />
            <Text style={{ fontSize: 15, fontWeight: '600', color: ct.textPrimary }}>
              {title}
            </Text>
          </XStack>
          <Icon icon={CaretRight} size="sm" color={ct.textTertiary} />
        </XStack>
      </CardGlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 52,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
