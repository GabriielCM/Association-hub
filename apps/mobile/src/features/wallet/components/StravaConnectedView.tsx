import { StyleSheet, View } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Heading, Button, Spinner } from '@ahub/ui';
import type { StravaStatus } from '@ahub/shared/types';

interface StravaConnectedViewProps {
  strava: StravaStatus;
  isSyncing: boolean;
  onSync: () => void;
  onDisconnect: () => void;
}

export function StravaConnectedView({
  strava,
  isSyncing,
  onSync,
  onDisconnect,
}: StravaConnectedViewProps) {
  return (
    <YStack gap="$4">
      {/* Status Header */}
      <YStack alignItems="center" gap="$2">
        <View style={styles.iconContainer}>
          <Text style={{ fontSize: 40 }}>🏃</Text>
        </View>
        <Heading level={4}>{strava.athleteName ?? 'Atleta'}</Heading>
        <View style={styles.connectedBadge}>
          <Text style={styles.connectedText}>Conectado</Text>
        </View>
      </YStack>

      {/* Daily Progress */}
      <YStack
        gap="$2"
        padding="$4"
        borderRadius={12}
        backgroundColor="$backgroundSecondary"
      >
        <Text weight="semibold">Progresso do dia</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  (strava.kmUsedToday / (strava.kmUsedToday + strava.kmRemainingToday)) * 100,
                  100
                )}%`,
              },
            ]}
          />
        </View>
        <XStack justifyContent="space-between">
          <Text color="secondary" size="xs">
            {strava.kmUsedToday.toFixed(1)} km usados
          </Text>
          <Text color="secondary" size="xs">
            Limite: {(strava.kmUsedToday + strava.kmRemainingToday).toFixed(0)} km
          </Text>
        </XStack>
      </YStack>

      {/* Last Sync */}
      {strava.lastSyncAt && (
        <Text color="secondary" size="xs" align="center">
          Última sincronização:{' '}
          {new Date(strava.lastSyncAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      )}

      {/* Actions */}
      <YStack gap="$2">
        <Button onPress={onSync} disabled={isSyncing}>
          {isSyncing ? (
            <XStack gap="$2" alignItems="center">
              <Spinner size="sm" />
              <Text style={{ color: '#fff' }}>Sincronizando...</Text>
            </XStack>
          ) : (
            'Sincronizar agora'
          )}
        </Button>
        <Button
          variant="ghost"
          onPress={onDisconnect}
          disabled={isSyncing}
        >
          <Text color="error" size="sm">
            Desconectar Strava
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(252, 76, 2, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  connectedText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FC4C02',
    borderRadius: 4,
  },
});
