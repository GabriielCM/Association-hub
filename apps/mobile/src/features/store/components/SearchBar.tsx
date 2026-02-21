import { useState, useCallback } from 'react';
import { TextInput, StyleSheet, Pressable } from 'react-native';
import { XStack, View } from 'tamagui';
import { Icon } from '@ahub/ui';
import { MagnifyingGlass, X } from '@ahub/ui/src/icons';
import { useStoreTheme } from '../hooks/useStoreTheme';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Buscar produtos...',
}: SearchBarProps) {
  const st = useStoreTheme();
  const [text, setText] = useState('');

  const handleSubmit = useCallback(() => {
    onSearch(text.trim());
  }, [text, onSearch]);

  const handleClear = useCallback(() => {
    setText('');
    onSearch('');
  }, [onSearch]);

  return (
    <XStack
      alignItems="center"
      gap="$2"
      paddingHorizontal="$3"
      style={[styles.container, { backgroundColor: st.searchBg }]}
    >
      <Icon icon={MagnifyingGlass} size={18} color={st.iconColor} />
      <TextInput
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSubmit}
        placeholder={placeholder}
        placeholderTextColor={st.inputPlaceholder}
        returnKeyType="search"
        style={[styles.input, { color: st.inputText }]}
      />
      {text.length > 0 && (
        <Pressable onPress={handleClear} hitSlop={8}>
          <View style={[styles.clearButton, { backgroundColor: st.clearBtnBg }]}>
            <Icon icon={X} size={14} color={st.iconColor} />
          </View>
        </Pressable>
      )}
    </XStack>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
