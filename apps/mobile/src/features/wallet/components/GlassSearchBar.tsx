import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import { XStack } from 'tamagui';
import { MagnifyingGlass, X } from '@ahub/ui/src/icons';

interface GlassSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function GlassSearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar...',
}: GlassSearchBarProps) {
  return (
    <View style={styles.container}>
      <XStack alignItems="center" gap={10} flex={1}>
        <MagnifyingGlass size={18} color="rgba(255, 255, 255, 0.40)" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.30)"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <X size={16} color="rgba(255, 255, 255, 0.40)" />
          </Pressable>
        )}
      </XStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    padding: 0,
  },
});
