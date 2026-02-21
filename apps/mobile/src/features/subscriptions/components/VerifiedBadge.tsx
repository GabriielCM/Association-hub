import { View } from 'react-native';

import { useBenefits } from '../hooks/useMySubscription';
import { SealCheck } from 'phosphor-react-native';
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
      accessibilityLabel="Membro verificado"
      accessibilityRole="image"
    >
      <SealCheck size={dimension} color="#FFD700" weight="fill" />
    </View>
  );
}
