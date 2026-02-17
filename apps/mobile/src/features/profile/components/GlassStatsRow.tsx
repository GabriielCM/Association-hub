import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import { XStack, YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { CardGlassView } from '@/features/card/components/CardGlassView';
import type { UserProfile } from '@ahub/shared/types';

interface GlassStatsRowProps {
  profile: UserProfile;
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

function formatPoints(value: number): string {
  if (value >= 10000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toLocaleString('pt-BR');
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric',
  });
}

export function GlassStatsRow({ profile, animatedStyle }: GlassStatsRowProps) {
  const stats = [
    { label: 'Pontos', value: formatPoints(profile.stats.points) },
    { label: 'Total ganho', value: formatPoints(profile.stats.lifetimePoints) },
    { label: 'Membro desde', value: formatDate(profile.memberSince) },
  ];

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <XStack gap="$2" justifyContent="center">
        {stats.map((stat) => (
          <CardGlassView
            key={stat.label}
            intensity={16}
            borderRadius={16}
            tint="light"
            style={styles.card}
          >
            <YStack alignItems="center" padding="$2.5" gap={2}>
              <Text weight="bold" size="lg">
                {stat.value}
              </Text>
              <Text color="secondary" size="xs">
                {stat.label}
              </Text>
            </YStack>
          </CardGlassView>
        ))}
      </XStack>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  card: {
    flex: 1,
  },
});
