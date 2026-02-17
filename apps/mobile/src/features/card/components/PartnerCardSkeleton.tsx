import { View, StyleSheet, useColorScheme } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Skeleton } from '@ahub/ui';

export function PartnerCardSkeleton() {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Banner skeleton */}
      <Skeleton width="100%" height={0} style={styles.banner} />

      {/* Info skeleton */}
      <YStack padding={14} gap={8}>
        <Skeleton variant="text" width="60%" height={18} />
        <Skeleton variant="text" width="90%" height={14} />
        <XStack gap={8}>
          <Skeleton variant="text" width={60} height={12} />
          <Skeleton variant="text" width={40} height={12} />
        </XStack>
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  containerDark: {
    backgroundColor: '#1F1F1F',
  },
  banner: {
    aspectRatio: 16 / 9,
  },
});
