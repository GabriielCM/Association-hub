import { Pressable, StyleSheet, View } from 'react-native';
import { XStack } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import type { PhosphorIcon } from '@ahub/ui';
import { WALLET_ICONS } from '@ahub/ui/src/icons';

interface QuickActionsProps {
  onTransfer: () => void;
  onScanner: () => void;
  onHistory: () => void;
}

export function QuickActions({ onTransfer, onScanner, onHistory }: QuickActionsProps) {
  return (
    <XStack justifyContent="space-around" paddingVertical="$2">
      <ActionButton icon={WALLET_ICONS.transfer} label="Transferir" onPress={onTransfer} />
      <ActionButton icon={WALLET_ICONS.scanner} label="Scanner" onPress={onScanner} />
      <ActionButton icon={WALLET_ICONS.history} label="Histórico" onPress={onHistory} />
    </XStack>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: PhosphorIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.iconContainer}>
        <Icon icon={icon} size="lg" color="primary" />
      </View>
      <Text size="xs" weight="medium" align="center">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    gap: 6,
    minWidth: 80,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
