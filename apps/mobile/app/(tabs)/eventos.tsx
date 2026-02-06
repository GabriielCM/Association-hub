import { ScrollView } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, Heading, Card, Badge, Button } from '@ahub/ui';

export default function EventosScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView>
        <YStack padding="$4" gap="$4">
          <Heading level={3}>Eventos</Heading>

          {/* Filter tabs */}
          <XStack gap="$2">
            <Badge variant="primary">Próximos</Badge>
            <Badge variant="ghost">Confirmados</Badge>
            <Badge variant="ghost">Passados</Badge>
          </XStack>

          {/* Empty state */}
          <Card variant="flat">
            <YStack
              gap="$3"
              alignItems="center"
              justifyContent="center"
              paddingVertical="$6"
            >
              <Text size="2xl">📅</Text>
              <Text weight="semibold">Nenhum evento disponível</Text>
              <Text color="secondary" size="sm" align="center">
                Novos eventos serão exibidos aqui quando disponíveis
              </Text>
            </YStack>
          </Card>

          {/* Example Event Card (for UI preview) */}
          <Card variant="elevated" pressable>
            <YStack gap="$2">
              {/* Event Image Placeholder */}
              <View
                backgroundColor="$backgroundHover"
                borderRadius="$md"
                height={120}
                alignItems="center"
                justifyContent="center"
              >
                <Text color="secondary">Imagem do evento</Text>
              </View>

              {/* Event Info */}
              <XStack justifyContent="space-between" alignItems="flex-start">
                <YStack flex={1} gap="$1">
                  <Text weight="bold" size="lg">
                    Evento de Exemplo
                  </Text>
                  <Text color="secondary" size="sm">
                    📍 Local do Evento
                  </Text>
                  <Text color="secondary" size="sm">
                    📅 25 Jan 2026, 19:00
                  </Text>
                </YStack>
                <Badge variant="success">+50 pts</Badge>
              </XStack>

              {/* Action */}
              <Button variant="primary" size="md" fullWidth marginTop="$2">
                Confirmar presença
              </Button>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
