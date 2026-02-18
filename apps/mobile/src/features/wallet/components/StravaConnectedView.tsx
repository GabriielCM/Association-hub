import { StyleSheet, View, Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { PersonSimpleRun, ArrowCounterClockwise } from '@ahub/ui/src/icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { StravaStatus } from '@ahub/shared/types';
import { GlassPanel } from './GlassPanel';
import { CircularProgressRing } from './CircularProgressRing';

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
  const totalKm = strava.kmUsedToday + strava.kmRemainingToday;
  const progress = totalKm > 0 ? Math.min(strava.kmUsedToday / totalKm, 1) : 0;

  const handleSync = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSync();
  };

  const handleDisconnect = () => {
    Haptics.selectionAsync();
    onDisconnect();
  };

  return (
    <YStack gap={20}>
      {/* Profile Header */}
      <Animated.View entering={FadeIn.duration(400)}>
        <YStack alignItems="center" gap={12}>
          <View style={styles.iconCircle}>
            <LinearGradient
              colors={['rgba(252, 76, 2, 0.25)', 'rgba(252, 76, 2, 0.08)']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <PersonSimpleRun size={36} color="#FC4C02" weight="duotone" />
          </View>
          <Text style={styles.athleteName}>{strava.athleteName ?? 'Atleta'}</Text>
          <View style={styles.connectedBadge}>
            <View style={styles.connectedDot} />
            <Text style={styles.connectedText}>Conectado</Text>
          </View>
        </YStack>
      </Animated.View>

      {/* Progress Ring */}
      <Animated.View entering={FadeIn.delay(150).duration(400)}>
        <GlassPanel padding={24} borderRadius={20} borderColor="rgba(252, 76, 2, 0.15)">
          <YStack alignItems="center" gap={16}>
            <Text style={styles.sectionTitle}>Progresso do dia</Text>
            <CircularProgressRing
              progress={progress}
              size={120}
              strokeWidth={10}
              color="#FC4C02"
              trackColor="rgba(252, 76, 2, 0.12)"
              duration={1000}
            >
              <YStack alignItems="center">
                <Text style={styles.ringValue}>{strava.kmUsedToday.toFixed(1)}</Text>
                <Text style={styles.ringLabel}>km</Text>
              </YStack>
            </CircularProgressRing>
            <XStack justifyContent="space-between" width="100%">
              <YStack alignItems="center" flex={1}>
                <Text style={styles.statValue}>{strava.kmUsedToday.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Usados</Text>
              </YStack>
              <View style={styles.statDivider} />
              <YStack alignItems="center" flex={1}>
                <Text style={styles.statValue}>{strava.kmRemainingToday.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Restantes</Text>
              </YStack>
              <View style={styles.statDivider} />
              <YStack alignItems="center" flex={1}>
                <Text style={styles.statValue}>{totalKm.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Limite</Text>
              </YStack>
            </XStack>
          </YStack>
        </GlassPanel>
      </Animated.View>

      {/* Last Sync */}
      {strava.lastSyncAt && (
        <Animated.View entering={FadeIn.delay(250).duration(300)}>
          <Text style={styles.lastSync}>
            Ultima sincronizacao:{' '}
            {new Date(strava.lastSyncAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Animated.View>
      )}

      {/* Actions */}
      <Animated.View entering={FadeIn.delay(300).duration(300)}>
        <YStack gap={10}>
          {/* Sync Button */}
          <Pressable
            onPress={handleSync}
            disabled={isSyncing}
            style={({ pressed }) => [
              styles.syncButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              isSyncing && { opacity: 0.6 },
            ]}
          >
            <LinearGradient
              colors={['#FC4C02', '#E8430A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFillObject, { borderRadius: 14 }]}
            />
            <XStack alignItems="center" gap={8}>
              <ArrowCounterClockwise size={18} color="#fff" />
              <Text style={styles.syncText}>
                {isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}
              </Text>
            </XStack>
          </Pressable>

          {/* Disconnect */}
          <Pressable
            onPress={handleDisconnect}
            disabled={isSyncing}
            style={({ pressed }) => [
              styles.disconnectButton,
              pressed && { opacity: 0.7 },
              isSyncing && { opacity: 0.4 },
            ]}
          >
            <Text style={styles.disconnectText}>Desconectar Strava</Text>
          </Pressable>
        </YStack>
      </Animated.View>
    </YStack>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(252, 76, 2, 0.20)',
  },
  athleteName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(74, 222, 128, 0.10)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.20)',
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  connectedText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ringValue: {
    color: '#FC4C02',
    fontSize: 28,
    fontWeight: '700',
  },
  ringLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  lastSync: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    textAlign: 'center',
  },
  syncButton: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  syncText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  disconnectButton: {
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.20)',
    backgroundColor: 'rgba(248, 113, 113, 0.06)',
  },
  disconnectText: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: '500',
  },
});
