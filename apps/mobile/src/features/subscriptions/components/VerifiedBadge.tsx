import { View } from 'react-native';
import { Text } from '@ahub/ui';
import { useBenefits } from '../hooks/useMySubscription';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md';
  isVerified?: boolean;
}

export function VerifiedBadge({ size = 'sm', isVerified }: VerifiedBadgeProps) {
  const { data: benefits } = useBenefits();

  const showBadge = isVerified ?? benefits?.hasVerifiedBadge ?? false;

  if (!showBadge) return null;

  const dimension = size === 'sm' ? 16 : 20;

  return (
    <View
      style={{
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      accessibilityLabel="Membro verificado"
      accessibilityRole="image"
    >
      <Text
        style={{
          fontSize: dimension * 0.6,
          color: '#FFFFFF',
          fontWeight: '700',
          lineHeight: dimension,
          textAlign: 'center',
        }}
      >
        ✓
      </Text>
    </View>
  );
}
