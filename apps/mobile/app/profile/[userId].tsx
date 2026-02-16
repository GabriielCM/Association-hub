import { ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card, Spinner } from '@ahub/ui';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileStats } from '@/features/profile/components/ProfileStats';
import { ProfileActions } from '@/features/profile/components/ProfileActions';
import { ProfileTabs } from '@/features/profile/components/ProfileTabs';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const { data: profile, isLoading, error } = useProfile(userId || '');

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" />
        </YStack>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" gap="$4">
          <Text style={{ fontSize: 40 }}>😕</Text>
          <Text color="secondary" align="center">
            {error?.message || 'Perfil não encontrado'}
          </Text>
          <Button variant="outline" onPress={() => router.back()}>
            Voltar
          </Button>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView>
        <YStack gap="$4">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
            alignSelf="flex-start"
            marginLeft="$4"
            marginTop="$2"
          >
            ← Voltar
          </Button>

          {/* Profile Header */}
          <Card variant="elevated" marginHorizontal="$4">
            <ProfileHeader profile={profile} />
            <ProfileStats profile={profile} />
          </Card>

          {/* Actions */}
          <ProfileActions isMe={profile.isMe} userId={profile.id} />

          {/* Tabs: Posts, Badges, Rankings */}
          <ProfileTabs userId={profile.id} isMe={profile.isMe} />
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
