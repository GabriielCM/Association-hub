import { StyleSheet, View } from 'react-native';
import { YStack } from 'tamagui';
import { Text, Heading, Button, Spinner } from '@ahub/ui';

interface StravaConnectScreenProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export function StravaConnectScreen({
  onConnect,
  isConnecting,
}: StravaConnectScreenProps) {
  return (
    <YStack flex={1} justifyContent="center" padding="$6" gap="$6">
      {/* Logo */}
      <YStack alignItems="center" gap="$2">
        <View style={styles.iconContainer}>
          <Text style={{ fontSize: 48 }}>🏃</Text>
        </View>
        <Heading level={3} align="center">Conecte seu Strava</Heading>
        <Text color="secondary" align="center">
          Ganhe pontos automaticamente com suas atividades físicas
        </Text>
      </YStack>

      {/* Benefits */}
      <YStack gap="$3">
        <BenefitItem
          icon="🏃"
          title="Corrida"
          description="Ganhe pontos por km percorrido"
        />
        <BenefitItem
          icon="🚴"
          title="Ciclismo"
          description="Pedale e acumule pontos"
        />
        <BenefitItem
          icon="🚶"
          title="Caminhada"
          description="Cada passo conta"
        />
        <BenefitItem
          icon="🏊"
          title="Natação"
          description="Nade e ganhe recompensas"
        />
      </YStack>

      {/* Limit Info */}
      <View style={styles.infoBox}>
        <Text size="sm" align="center">
          Máximo de <Text weight="semibold">5 km/dia</Text> pontuáveis
        </Text>
      </View>

      {/* Connect Button */}
      <Button onPress={onConnect} disabled={isConnecting}>
        {isConnecting ? (
          <Spinner size="sm" />
        ) : (
          'Conectar com Strava'
        )}
      </Button>
    </YStack>
  );
}

function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.benefitRow}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
      <YStack flex={1}>
        <Text weight="semibold" size="sm">{title}</Text>
        <Text color="secondary" size="xs">{description}</Text>
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(252, 76, 2, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoBox: {
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
});
