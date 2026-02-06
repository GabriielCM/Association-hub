import { ScrollView } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, Heading, Card, Avatar, Badge } from '@ahub/ui';
import { useAuthContext } from '@/providers/AuthProvider';
import { formatPoints } from '@ahub/shared/utils';

export default function HomeScreen() {
  const { user } = useAuthContext();

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
            <Avatar
              src={user?.avatarUrl}
              name={user?.name}
              size="lg"
              status="online"
              showStatus
            />
          </XStack>

          {/* Points Card */}
          <Card variant="elevated" pressable>
            <XStack alignItems="center" justifyContent="space-between">
              <YStack>
                <Text color="secondary" size="sm">
                  Seus pontos
                </Text>
                <Heading level={2} color="accent">
                  {formatPoints(0)}
                </Heading>
              </YStack>
              <Badge variant="primary">Ver histórico</Badge>
            </XStack>
          </Card>

          {/* Quick Actions */}
          <YStack gap="$2">
            <Text weight="semibold" size="lg">
              Acesso rápido
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              <QuickActionCard
                icon="📅"
                title="Eventos"
                subtitle="3 próximos"
              />
              <QuickActionCard
                icon="🛍️"
                title="Loja"
                subtitle="Novidades"
              />
              <QuickActionCard
                icon="💳"
                title="Carteirinha"
                subtitle="QR Code"
              />
              <QuickActionCard
                icon="🏆"
                title="Rankings"
                subtitle="Top 10"
              />
            </XStack>
          </YStack>

          {/* Recent Activity */}
          <YStack gap="$2">
            <Text weight="semibold" size="lg">
              Atividade recente
            </Text>
            <Card variant="flat">
              <YStack gap="$2" alignItems="center" paddingVertical="$4">
                <Text color="secondary">Nenhuma atividade recente</Text>
                <Text color="secondary" size="sm">
                  Participe de eventos para ganhar pontos!
                </Text>
              </YStack>
            </Card>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickActionCard({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Card
      variant="elevated"
      size="sm"
      pressable
      width="47%"
      marginBottom="$2"
    >
      <YStack gap="$1">
        <Text size="2xl">{icon}</Text>
        <Text weight="semibold">{title}</Text>
        <Text color="secondary" size="xs">
          {subtitle}
        </Text>
      </YStack>
    </Card>
  );
}
