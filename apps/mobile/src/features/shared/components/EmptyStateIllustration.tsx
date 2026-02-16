import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@ahub/ui/themes';

type AnimationType = 'no-spaces' | 'no-bookings' | 'error' | 'no-results';

interface EmptyStateIllustrationProps {
  animation: AnimationType;
  title: string;
  description: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
}

const ANIMATION_MAP: Record<AnimationType, any> = {
  'no-spaces': require('@/assets/animations/empty-spaces.json'),
  'no-bookings': require('@/assets/animations/empty-bookings.json'),
  'error': require('@/assets/animations/error-state.json'),
  'no-results': require('@/assets/animations/empty-bookings.json'),
};

export function EmptyStateIllustration({
  animation,
  title,
  description,
  ctaLabel,
  onCtaPress,
}: EmptyStateIllustrationProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, fadeStyle]}>
      <YStack alignItems="center" gap="$3" padding="$4">
        <LottieView
          source={ANIMATION_MAP[animation]}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text weight="semibold" size="base" style={styles.title}>
          {title}
        </Text>
        <Text size="sm" color="secondary" style={styles.description}>
          {description}
        </Text>
        {ctaLabel && onCtaPress && (
          <Pressable onPress={onCtaPress} style={styles.ctaButton}>
            <Text size="sm" weight="semibold" style={{ color: colors.primary }}>
              {ctaLabel}
            </Text>
          </Pressable>
        )}
      </YStack>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 150,
    height: 150,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 280,
  },
  ctaButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginTop: 8,
  },
});
