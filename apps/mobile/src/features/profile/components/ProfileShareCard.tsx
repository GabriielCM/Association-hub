import { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import { YStack } from 'tamagui';
import { Text, Avatar } from '@ahub/ui';
import type { UserProfile } from '@ahub/shared/types';

interface ProfileShareCardProps {
  profile: UserProfile;
}

function formatPoints(value: number): string {
  if (value >= 10000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toLocaleString('pt-BR');
}

export const ProfileShareCard = forwardRef<ViewShot, ProfileShareCardProps>(
  function ProfileShareCard({ profile }, ref) {
    return (
      <View style={styles.offscreen}>
        <ViewShot ref={ref} options={{ format: 'png', quality: 1 }}>
          <LinearGradient
            colors={['#8B5CF6', '#06B6D4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <YStack alignItems="center" gap="$3" padding="$4">
              <Avatar src={profile.avatarUrl} name={profile.name} size="xl" />
              <Text weight="bold" size="xl" style={{ color: '#FFFFFF' }}>
                {profile.name}
              </Text>
              {profile.username && (
                <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  @{profile.username}
                </Text>
              )}
              <Text size="base" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {formatPoints(profile.stats.points)} pontos
              </Text>
              <Text size="xs" style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
                A-hub
              </Text>
            </YStack>
          </LinearGradient>
        </ViewShot>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    top: -9999,
    left: -9999,
  },
  card: {
    width: 340,
    borderRadius: 24,
    overflow: 'hidden',
  },
});
