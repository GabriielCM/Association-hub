import { useState } from 'react';
import { ScrollView, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, Heading, Card } from '@ahub/ui';
import { useAuthContext } from '@/providers/AuthProvider';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileStats } from '@/features/profile/components/ProfileStats';
import { ProfileActions } from '@/features/profile/components/ProfileActions';
import { ProfileTabs } from '@/features/profile/components/ProfileTabs';

export default function PerfilScreen() {
  const { user } = useAuthContext();
  const userId = user?.id || '';
  const { data: profile, isLoading, refetch } = useProfile(userId);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <YStack padding="$4" gap="$4">
          {/* Header row with title and settings icon */}
          <XStack justifyContent="space-between" alignItems="center">
            <Heading level={3}>Perfil</Heading>
            <XStack gap="$2" alignItems="center">
              <Pressable
                onPress={() => router.push('/messages')}
                style={styles.settingsButton}
              >
                <Text style={styles.settingsIcon}>💬</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/profile/settings')}
                style={styles.settingsButton}
              >
                <Text style={styles.settingsIcon}>⚙️</Text>
              </Pressable>
            </XStack>
          </XStack>

          {/* Profile Card */}
          {profile ? (
            <Card variant="elevated">
              <ProfileHeader
                profile={profile}
                onAvatarPress={() => router.push('/profile/edit')}
              />
              <ProfileStats profile={profile} />
            </Card>
          ) : (
            <Card variant="elevated">
              <YStack alignItems="center" gap="$3" paddingVertical="$4">
                <Text color="secondary">Carregando perfil...</Text>
              </YStack>
            </Card>
          )}

          {/* Actions */}
          <ProfileActions isMe={true} userId={userId} />

          {/* Tabs: Posts, Badges, Rankings */}
          <ProfileTabs userId={userId} isMe={true} />
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 22,
  },
});
