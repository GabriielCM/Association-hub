import { ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button, Card, Spinner } from '@ahub/ui';
import { useProfile, useUserRankings } from '@/features/profile/hooks/useProfile';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileStats } from '@/features/profile/components/ProfileStats';
import { ProfileActions } from '@/features/profile/components/ProfileActions';
import { RankingRow } from '@/features/profile/components/RankingRow';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const { data: profile, isLoading, error } = useProfile(userId || '');
  const { data: rankingsData } = useUserRankings(userId || '');

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" />
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

  const rankings = rankingsData?.data || [];

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

          {/* Subscription */}
          {profile.subscription && (
            <Card variant="flat" marginHorizontal="$4">
              <YStack alignItems="center" gap="$1" paddingVertical="$2">
                <Text color="secondary" size="sm">
                  Plano atual
                </Text>
                <Text weight="bold" color="primary">
                  {profile.subscription}
                </Text>
              </YStack>
            </Card>
          )}

          {/* Rankings */}
          {rankings.length > 0 && (
            <YStack paddingHorizontal="$4" gap="$3">
              <Text weight="semibold" size="lg">
                Rankings
              </Text>
              <YStack gap="$2">
                {rankings.map((ranking) => (
                  <RankingRow key={ranking.type} ranking={ranking} />
                ))}
              </YStack>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
