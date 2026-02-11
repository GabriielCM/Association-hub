import { ScrollView, Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Text, Heading, Card, Avatar, Badge, Spinner } from '@ahub/ui';
import { useAuthContext } from '@/providers/AuthProvider';
import { formatPoints, formatRelativeDate } from '@ahub/shared/utils';
import { useBalance } from '@/features/points/hooks/usePoints';
import { usePointsHistory } from '@/features/points/hooks/usePointsHistory';
import { TransactionItem } from '@/features/points/components/TransactionItem';
import { CelebrationOverlay } from '@/features/points/components/CelebrationOverlay';
import { usePointsSocket } from '@/features/points/hooks/usePointsSocket';
import { NotificationBadge } from '@/features/notifications/components/NotificationBadge';
import { useNotificationWebSocket } from '@/features/notifications/hooks/useNotificationWebSocket';

export default function HomeScreen() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: historyData } = usePointsHistory({ limit: 3 });

  usePointsSocket();
  useNotificationWebSocket();

  const recentTransactions = historyData?.pages?.[0]?.data ?? [];
  const displayBalance = balance?.balance ?? 0;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView>
        <YStack padding="$4" gap="$4">
          {/* Header with user greeting */}
          <XStack alignItems="center" justifyContent="space-between">
            <YStack>
              <Text color="secondary" size="sm">
                Bem-vindo,
              </Text>
              <Heading level={4}>{user?.name || 'Membro'}</Heading>
            </YStack>
            <XStack alignItems="center" gap="$3">
              <NotificationBadge />
              <Avatar
                src={user?.avatarUrl}
                name={user?.name}
                size="lg"
                status="online"
                showStatus
              />
            </XStack>
          </XStack>

          {/* Points Card */}
          <Pressable onPress={() => router.push('/points')}>
            <Card variant="elevated">
              <XStack alignItems="center" justifyContent="space-between">
                <YStack>
                  <Text color="secondary" size="sm">
                    Seus pontos
                  </Text>
                  {balanceLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <Heading level={2} color="accent">
                      {formatPoints(displayBalance)}
                    </Heading>
                  )}
                </YStack>
                <Badge variant="primary">Ver historico</Badge>
              </XStack>
            </Card>
          </Pressable>

          {/* Quick Actions */}
          <YStack gap="$2">
            <Text weight="semibold" size="lg">
              Acesso rapido
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              <QuickActionCard
                icon="📅"
                title="Eventos"
                subtitle="Proximos"
                onPress={() => router.push('/(tabs)/eventos')}
              />
              <QuickActionCard
                icon="💸"
                title="Transferir"
                subtitle="Enviar pontos"
                onPress={() => router.push('/points/transfer')}
              />
              <QuickActionCard
                icon="🏆"
                title="Rankings"
                subtitle="Top 10"
                onPress={() => router.push('/points/rankings')}
              />
              <QuickActionCard
                icon="💳"
                title="Carteira"
                subtitle="Saldo e QR"
                onPress={() => router.push('/wallet')}
              />
              <QuickActionCard
                icon="⭐"
                title="Assinaturas"
                subtitle="Planos"
                onPress={() => router.push('/subscriptions')}
              />
            </XStack>
          </YStack>

          {/* Recent Activity */}
          <YStack gap="$2">
            <XStack alignItems="center" justifyContent="space-between">
              <Text weight="semibold" size="lg">
                Atividade recente
              </Text>
              {recentTransactions.length > 0 && (
                <Pressable onPress={() => router.push('/points')}>
                  <Text color="accent" size="sm">Ver tudo</Text>
                </Pressable>
              )}
            </XStack>
            {recentTransactions.length > 0 ? (
              <Card variant="flat">
                {recentTransactions.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    onPress={() => router.push('/points')}
                  />
                ))}
              </Card>
            ) : (
              <Card variant="flat">
                <YStack gap="$2" alignItems="center" paddingVertical="$4">
                  <Text color="secondary">Nenhuma atividade recente</Text>
                  <Text color="secondary" size="sm">
                    Participe de eventos para ganhar pontos!
                  </Text>
                </YStack>
              </Card>
            )}
          </YStack>
        </YStack>
      </ScrollView>

      <CelebrationOverlay />
    </SafeAreaView>
  );
}

function QuickActionCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ width: '47%', marginBottom: 8 }}>
      <Card variant="elevated" size="sm">
        <YStack gap="$1">
          <Text size="2xl">{icon}</Text>
          <Text weight="semibold">{title}</Text>
          <Text color="secondary" size="xs">
            {subtitle}
          </Text>
        </YStack>
      </Card>
    </Pressable>
  );
}
