import { Pressable, StyleSheet, View } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Card } from '@ahub/ui';
import type { StravaStatus } from '@ahub/shared/types';

interface StravaCardProps {
  strava: StravaStatus;
  onConnect: () => void;
  onDetails: () => void;
}

export function StravaCard({ strava, onConnect, onDetails }: StravaCardProps) {
  if (!strava.connected) {
    return (
      <Pressable onPress={onConnect}>
        <Card variant="flat" style={styles.connectCard}>
          <XStack alignItems="center" gap="$3">
            <View style={styles.stravaIcon}>
              <Text style={{ fontSize: 24 }}>🏃</Text>
            </View>
            <YStack flex={1}>
              <Text weight="semibold">Conectar Strava</Text>
              <Text color="secondary" size="xs">
                Ganhe pontos com suas atividades físicas
              </Text>
            </YStack>
            <Text color="primary" weight="semibold" size="sm">→</Text>
          </XStack>
        </Card>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onDetails}>
      <Card variant="flat">
        <YStack gap="$2">
          <XStack alignItems="center" gap="$2">
            <Text style={{ fontSize: 20 }}>🏃</Text>
            <Text weight="semibold" flex={1}>Strava</Text>
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedText}>Conectado</Text>
            </View>
          </XStack>

          {strava.athleteName && (
            <Text color="secondary" size="sm">{strava.athleteName}</Text>
          )}

          {/* Daily Progress */}
          <StravaProgressBar
            used={strava.kmUsedToday}
            remaining={strava.kmRemainingToday}
          />
        </YStack>
      </Card>
    </Pressable>
  );
}

function StravaProgressBar({
  used,
  remaining,
}: {
  used: number;
  remaining: number;
}) {
  const total = used + remaining;
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return (
    <YStack gap={4}>
      <XStack justifyContent="space-between">
        <Text color="secondary" size="xs">
          {used.toFixed(1)} km hoje
        </Text>
        <Text color="secondary" size="xs">
          {remaining.toFixed(1)} km restantes
        </Text>
      </XStack>
      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]}
        />
      </View>
    </YStack>
  );
}

const styles = StyleSheet.create({
  connectCard: {
    borderWidth: 1,
    borderColor: '#FC4C02',
    borderStyle: 'dashed',
  },
  stravaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(252, 76, 2, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  connectedText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FC4C02',
    borderRadius: 3,
  },
});
