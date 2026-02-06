import { YStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, Heading, Card, Avatar, Badge } from '@ahub/ui';
import { useAuthContext } from '@/providers/AuthProvider';

export default function CarteirinhaScreen() {
  const { user } = useAuthContext();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} padding="$4" gap="$4">
        <Heading level={3}>Carteirinha Digital</Heading>

        {/* Card Preview */}
        <Card
          variant="elevated"
          padding="$4"
          backgroundColor="$primary"
        >
          <YStack gap="$3">
            {/* Header */}
            <Text color="primary" size="lg" weight="bold" style={{ color: '#fff' }}>
              A-hub
            </Text>

            {/* User Info */}
            <YStack alignItems="center" gap="$2" paddingVertical="$2">
              <Avatar
                src={user?.avatarUrl}
                name={user?.name}
                size="xl"
                bordered
              />
              <Text weight="bold" size="lg" style={{ color: '#fff' }}>
                {user?.name || 'Membro'}
              </Text>
              <Badge variant="secondary">
                {user?.role === 'ADMIN' ? 'Administrador' : 'Membro'}
              </Badge>
            </YStack>

            {/* QR Code Placeholder */}
            <View
              backgroundColor="$surface"
              borderRadius="$lg"
              padding="$4"
              alignItems="center"
              justifyContent="center"
              height={200}
            >
              <Text color="secondary" align="center">
                QR Code será exibido aqui
              </Text>
              <Text color="secondary" size="sm" align="center" marginTop="$2">
                Use para check-in em eventos
              </Text>
            </View>

            {/* Member ID */}
            <Text align="center" size="sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              ID: {user?.memberId || user?.id?.slice(0, 8) || '---'}
            </Text>
          </YStack>
        </Card>

        {/* Instructions */}
        <Card variant="flat">
          <YStack gap="$2">
            <Text weight="semibold">Como usar</Text>
            <Text color="secondary" size="sm">
              1. Apresente o QR Code para o organizador do evento
            </Text>
            <Text color="secondary" size="sm">
              2. Aguarde a confirmação do check-in
            </Text>
            <Text color="secondary" size="sm">
              3. Pronto! Seus pontos serão creditados automaticamente
            </Text>
          </YStack>
        </Card>
      </YStack>
    </SafeAreaView>
  );
}
