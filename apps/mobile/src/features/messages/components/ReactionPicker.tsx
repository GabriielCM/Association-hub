import { Pressable, StyleSheet } from 'react-native';
import { XStack, View } from 'tamagui';
import { Text } from '@ahub/ui';

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function ReactionPicker({ onSelect, onClose }: ReactionPickerProps) {
  return (
    <View>
      <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
      <XStack
        backgroundColor="$surface"
        borderRadius="$full"
        padding="$1.5"
        gap="$1"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.15}
        shadowRadius={12}
        elevation={8}
      >
        {QUICK_REACTIONS.map((emoji) => (
          <Pressable
            key={emoji}
            onPress={() => onSelect(emoji)}
            style={styles.emojiBtn}
          >
            <Text style={{ fontSize: 24 }}>{emoji}</Text>
          </Pressable>
        ))}
      </XStack>
    </View>
  );
}

const styles = StyleSheet.create({
  emojiBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
