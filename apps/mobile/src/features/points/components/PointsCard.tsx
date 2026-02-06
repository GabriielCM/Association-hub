import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { useRouter } from 'expo-router';

import { Card, Text, Heading, Spinner } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import { useBalance } from '../hooks/usePoints';
import { useCachedBalance } from '@/stores/points.store';

export function PointsCard() {
  const router = useRouter();
  const { data: balance, isLoading, isError, isStale } = useBalance();
  const cachedBalance = useCachedBalance();

  const displayBalance = balance?.balance ?? cachedBalance ?? 0;
  const isOffline = !balance && cachedBalance !== null;

  return (
    <Pressable onPress={() => router.push('/points')}>
      <Card variant="elevated" size="lg">
        <YStack gap="$2">
          <XStack alignItems="center" justifyContent="space-between">
            <Text color="secondary" size="sm">
              Seus pontos
            </Text>
            {isOffline && (
              <Text color="warning" size="xs">
                Offline
              </Text>
            )}
            {isStale && !isOffline && (
              <Text color="secondary" size="xs">
                Atualizando...
              </Text>
            )}
          </XStack>

          {isLoading && !cachedBalance ? (
            <Spinner size="sm" />
          ) : (
            <Heading level={2} color="accent">
              {formatPoints(displayBalance)}
            </Heading>
          )}

          {balance && (
            <XStack gap="$4">
              <YStack>
                <Text color="secondary" size="xs">
                  Recebidos
                </Text>
                <Text color="success" size="sm" weight="semibold">
                  +{formatPoints(balance.lifetimeEarned)}
                </Text>
              </YStack>
              <YStack>
                <Text color="secondary" size="xs">
                  Gastos
                </Text>
                <Text color="error" size="sm" weight="semibold">
                  -{formatPoints(balance.lifetimeSpent)}
                </Text>
              </YStack>
            </XStack>
          )}

          {isError && !cachedBalance && (
            <Text color="error" size="sm">
              Erro ao carregar saldo
            </Text>
          )}
        </YStack>
      </Card>
    </Pressable>
  );
}
