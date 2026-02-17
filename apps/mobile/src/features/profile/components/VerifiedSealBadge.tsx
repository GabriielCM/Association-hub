import { View, StyleSheet } from 'react-native';
import { SealCheck } from 'phosphor-react-native';

interface VerifiedSealBadgeProps {
  isVerified: boolean;
  size?: number;
}

export function VerifiedSealBadge({ isVerified, size = 24 }: VerifiedSealBadgeProps) {
  if (!isVerified) return null;

  return (
    <View style={styles.container}>
      <SealCheck size={size} color="#3B82F6" weight="fill" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});
