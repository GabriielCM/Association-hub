import { Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import Svg, { Polyline } from 'react-native-svg';

import { Text, Heading, Card, Spinner, Icon } from '@ahub/ui';
import { Star, ArrowUpRight, ArrowDownLeft } from '@ahub/ui/src/icons';
import { formatPoints } from '@ahub/shared/utils';
import { useDashboardTheme } from '../hooks/useDashboardTheme';
import type { UserSummary } from '@ahub/shared/types';

interface PointsBalanceCardProps {
  user?: UserSummary;
  isLoading: boolean;
}

function MiniChart({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;

  const width = 80;
  const height = 30;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke="#F59E0B"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PointsBalanceCard({ user, isLoading }: PointsBalanceCardProps) {
  const router = useRouter();
  const dt = useDashboardTheme();

  const pointsToday = user?.points_today ?? 0;
  const isPositive = pointsToday >= 0;

  return (
    <Pressable onPress={() => router.push('/points')}>
      <Card
        variant="elevated"
        {...(dt.cardBg ? { backgroundColor: dt.cardBg, borderWidth: 1, borderColor: dt.cardBorder, shadowOpacity: 0 } : {})}
      >
        <YStack gap="$2">
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$2">
              <Icon icon={Star} size="lg" color="warning" weight="fill" />
              <Text weight="semibold" style={{ color: dt.textSecondary }}>
                Seus Pontos
              </Text>
            </XStack>
            <Text size="sm" style={{ color: dt.textSecondary }}>
              →
            </Text>
          </XStack>

          <XStack alignItems="flex-end" justifyContent="space-between">
            <YStack>
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <Heading level={3} style={{ color: dt.accent }}>
                  {formatPoints(user?.points ?? 0)}
                </Heading>
              )}
              {!isLoading && (
                <XStack alignItems="center" gap="$1">
                  <Icon icon={isPositive ? ArrowUpRight : ArrowDownLeft} size="sm" color={isPositive ? 'success' : 'error'} />
                  <Text size="sm" style={{ color: isPositive ? '#22C55E' : '#EF4444' }}>
                    {isPositive ? '+' : ''}{pointsToday} hoje
                  </Text>
                </XStack>
              )}
            </YStack>

            {!isLoading && user?.points_chart && (
              <YStack>
                <Text size="xs" style={{ color: dt.textSecondary }}>
                  Ultimos 7 dias
                </Text>
                <MiniChart data={user.points_chart} />
              </YStack>
            )}
          </XStack>
        </YStack>
      </Card>
    </Pressable>
  );
}
