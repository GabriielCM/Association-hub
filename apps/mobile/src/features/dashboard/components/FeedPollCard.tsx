import { memo } from 'react';
import { Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';

import { Text, Card, Avatar, Icon } from '@ahub/ui';
import { ChartBar } from '@ahub/ui/src/icons';
import SealCheck from 'phosphor-react-native/src/icons/SealCheck';
import CheckSquare from 'phosphor-react-native/src/icons/CheckSquare';
import Square from 'phosphor-react-native/src/icons/Square';
import { useVotePoll } from '../hooks/useFeedMutations';
import { useDashboardTheme } from '../hooks/useDashboardTheme';
import type { FeedPost } from '@ahub/shared/types';

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `ha ${diffMin}min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `ha ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  return `ha ${diffDays}d`;
}

interface FeedPollCardProps {
  post: FeedPost;
}

export const FeedPollCard = memo(function FeedPollCard({ post }: FeedPollCardProps) {
  const { mutate: vote } = useVotePoll();
  const dt = useDashboardTheme();

  const { author, created_at, content } = post;
  const poll = (content as any).poll;
  const isVerified = (author as any).is_verified;

  if (!poll) return null;

  const hasVoted = poll.user_voted;
  const totalVotes = poll.total_votes || 0;

  const handleVote = (optionIndex: number) => {
    if (hasVoted || poll.ended) return;
    vote({
      pollId: poll.id,
      data: { option_index: optionIndex },
    });
  };

  return (
    <Card variant="flat" {...(dt.cardBg ? { backgroundColor: dt.cardBg, borderWidth: 1, borderColor: dt.cardBorder, shadowOpacity: 0 } : {})}>
      <YStack gap="$3">
        {/* Author header */}
        <XStack alignItems="center" gap="$2">
          <Avatar
            src={author.avatar_url}
            name={author.name}
            size="sm"
          />
          <YStack>
            <XStack alignItems="center" gap="$1">
              <Text weight="semibold" size="sm" style={{ color: dt.textPrimary }}>
                {author.name}
              </Text>
              {isVerified && <Icon icon={SealCheck} size="sm" color="#FFD700" weight="fill" />}
            </XStack>
            <Text size="xs" style={{ color: dt.textSecondary }}>
              {timeAgo(created_at)}
            </Text>
          </YStack>
        </XStack>

        {/* Question */}
        <XStack alignItems="center" gap="$2">
          <Icon icon={ChartBar} size="lg" color={dt.accent} />
          <Text weight="semibold" style={{ color: dt.textPrimary }}>{poll.question}</Text>
        </XStack>

        {/* Options */}
        <YStack gap="$2">
          {poll.options?.map((option: any, index: number) => {
            const percentage =
              totalVotes > 0
                ? Math.round(
                    ((option.votes_count || 0) / totalVotes) * 100,
                  )
                : 0;

            const isSelected = poll.user_vote_option === option.id;

            return (
              <Pressable
                key={index}
                onPress={() => handleVote(index)}
                disabled={hasVoted || poll.ended}
              >
                <YStack
                  borderWidth={1}
                  borderColor={isSelected ? '$accent' : '$borderColor'}
                  borderRadius="$3"
                  padding="$2"
                  overflow="hidden"
                  position="relative"
                >
                  {/* Progress bar background */}
                  {hasVoted && (
                    <YStack
                      position="absolute"
                      left={0}
                      top={0}
                      bottom={0}
                      width={`${percentage}%`}
                      backgroundColor="$accent"
                      opacity={0.1}
                      borderRadius="$3"
                    />
                  )}
                  <XStack
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <XStack alignItems="center" gap="$2">
                      {isSelected ? <Icon icon={CheckSquare} size="sm" color={dt.accent} weight="fill" /> : <Icon icon={Square} size="sm" color={dt.textSecondary} />}
                      <Text size="sm" style={{ color: dt.textPrimary }}>{option.text}</Text>
                    </XStack>
                    {hasVoted && (
                      <Text size="sm" style={{ color: dt.textSecondary }}>
                        {percentage}%
                      </Text>
                    )}
                  </XStack>
                </YStack>
              </Pressable>
            );
          })}
        </YStack>

        {/* Footer */}
        <XStack alignItems="center" gap="$2">
          <Text size="xs" style={{ color: dt.textSecondary }}>
            {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
          </Text>
          {poll.ends_at && !poll.ended && (
            <Text size="xs" style={{ color: dt.textSecondary }}>
              • Encerra em breve
            </Text>
          )}
          {poll.ended && (
            <Text size="xs" style={{ color: dt.textSecondary }}>
              • Enquete encerrada
            </Text>
          )}
        </XStack>
      </YStack>
    </Card>
  );
});
