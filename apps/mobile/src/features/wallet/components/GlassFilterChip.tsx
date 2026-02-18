import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@ahub/ui';
import * as Haptics from 'expo-haptics';

interface GlassFilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function GlassFilterChip({ label, active, onPress }: GlassFilterChipProps) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.text, active && styles.textActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'transparent',
  },
  chipActive: {
    borderColor: 'rgba(34, 211, 238, 0.35)',
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
  },
  text: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 13,
    fontWeight: '500',
  },
  textActive: {
    color: '#22D3EE',
    fontWeight: '600',
  },
});
