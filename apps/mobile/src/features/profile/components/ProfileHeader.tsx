import { Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Heading, Avatar } from '@ahub/ui';
import { VerifiedBadge } from '@/features/subscriptions/components/VerifiedBadge';
import { BadgeRow } from './BadgeRow';
import type { UserProfile } from '@ahub/shared/types';

interface ProfileHeaderProps {
  profile: UserProfile;
  onAvatarPress?: () => void;
}

export function ProfileHeader({ profile, onAvatarPress }: ProfileHeaderProps) {
  return (
    <YStack alignItems="center" gap="$3" paddingVertical="$4">
      <Pressable onPress={onAvatarPress} disabled={!onAvatarPress}>
        <Avatar
          src={profile.avatarUrl}
          name={profile.name}
          size="2xl"
        />
      </Pressable>

      <YStack alignItems="center" gap="$1">
        <XStack alignItems="center" gap="$1.5">
          <Heading level={4}>{profile.name}</Heading>
          <VerifiedBadge size="md" isVerified={profile.isVerified} />
        </XStack>

        {profile.username && (
          <Text color="secondary" size="sm">
            @{profile.username}
          </Text>
        )}

        {profile.bio && (
          <Text
            color="secondary"
            size="sm"
            align="center"
            style={{ maxWidth: 280 }}
            numberOfLines={3}
          >
            {profile.bio}
          </Text>
        )}
      </YStack>

      {profile.badges.length > 0 && (
        <BadgeRow badges={profile.badges} />
      )}
    </YStack>
  );
}
