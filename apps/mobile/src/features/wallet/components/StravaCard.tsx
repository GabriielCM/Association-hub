import { Pressable, StyleSheet, View } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { PersonSimpleRun, CaretRight } from '@ahub/ui/src/icons';
import type { StravaStatus } from '@ahub/shared/types';
import { GlassPanel } from './GlassPanel';
import { CircularProgressRing } from './CircularProgressRing';
import { useWalletTheme } from '../hooks/useWalletTheme';

interface StravaCardProps {
  strava: StravaStatus;
  onConnect: () => void;
  onDetails: () => void;
}

export function StravaCard({ strava, onConnect, onDetails }: StravaCardProps) {
  const t = useWalletTheme();

  if (!strava.connected) {
    return (
      <Pressable
        onPress={onConnect}
        style={({ pressed }) => pressed && { opacity: 0.8 }}
      >
        <GlassPanel
          borderColor={t.stravaBorder}
          borderRadius={20}
          blurTint={t.glassBlurTint}
          intensity={t.glassBlurIntensity}
        >
          <XStack alignItems="center" gap={14}>
            <View style={[styles.stravaIcon, { backgroundColor: t.stravaBg }]}>
              <PersonSimpleRun size={24} color={t.strava} weight="fill" />
            </View>
            <YStack flex={1}>
              <Text style={[styles.connectTitle, { color: t.textPrimary }]}>
                Conectar Strava
              </Text>
              <Text style={[styles.connectSub, { color: t.textSecondary }]}>
                Ganhe pontos com suas atividades fisicas
              </Text>
            </YStack>
            <CaretRight size={18} color={t.strava} />
          </XStack>
        </GlassPanel>
      </Pressable>
    );
  }

  const totalKm = strava.kmUsedToday + strava.kmRemainingToday;
  const progress = totalKm > 0 ? strava.kmUsedToday / totalKm : 0;

  return (
    <Pressable
      onPress={onDetails}
      style={({ pressed }) => pressed && { opacity: 0.8 }}
    >
      <GlassPanel
        borderColor={t.isDark ? 'rgba(252, 76, 2, 0.20)' : 'rgba(252, 76, 2, 0.15)'}
        borderRadius={20}
        blurTint={t.glassBlurTint}
        intensity={t.glassBlurIntensity}
      >
        <XStack alignItems="center" gap={16}>
          <CircularProgressRing
            progress={progress}
            size={72}
            color={t.strava}
            strokeWidth={5}
            trackColor={t.ringTrack}
          >
            <YStack alignItems="center">
              <Text style={[styles.ringValue, { color: t.strava }]}>
                {strava.kmUsedToday.toFixed(1)}
              </Text>
              <Text style={[styles.ringUnit, { color: t.textTertiary }]}>km</Text>
            </YStack>
          </CircularProgressRing>

          <YStack flex={1} gap={4}>
            <XStack alignItems="center" gap={6}>
              <PersonSimpleRun size={16} color={t.strava} weight="fill" />
              <Text style={[styles.stravaTitle, { color: t.textPrimary }]}>Strava</Text>
              <View style={styles.connectedBadge}>
                <Text style={styles.connectedText}>Conectado</Text>
              </View>
            </XStack>
            {strava.athleteName && (
              <Text style={[styles.athleteName, { color: t.textSecondary }]}>
                {strava.athleteName}
              </Text>
            )}
            <Text style={[styles.remaining, { color: t.strava }]}>
              {strava.kmRemainingToday.toFixed(1)} km restantes hoje
            </Text>
          </YStack>

          <CaretRight size={18} color={t.textTertiary} />
        </XStack>
      </GlassPanel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stravaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  connectSub: {
    fontSize: 12,
    marginTop: 2,
  },
  ringValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  ringUnit: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: -2,
  },
  stravaTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  connectedBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.20)',
  },
  connectedText: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: '600',
  },
  athleteName: {
    fontSize: 12,
  },
  remaining: {
    fontSize: 11,
    fontWeight: '500',
  },
});
