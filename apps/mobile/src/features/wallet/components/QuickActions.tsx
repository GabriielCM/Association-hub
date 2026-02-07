import { Pressable, StyleSheet, View } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text } from '@ahub/ui';

interface QuickActionsProps {
  onTransfer: () => void;
  onScanner: () => void;
  onHistory: () => void;
}

export function QuickActions({ onTransfer, onScanner, onHistory }: QuickActionsProps) {
  return (
    <XStack justifyContent="space-around" paddingVertical="$2">
      <ActionButton icon="📤" label="Transferir" onPress={onTransfer} />
      <ActionButton icon="📷" label="Scanner" onPress={onScanner} />
      <ActionButton icon="📋" label="Histórico" onPress={onHistory} />
    </XStack>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.iconContainer}>
        <Text style={{ fontSize: 24 }}>{icon}</Text>
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
