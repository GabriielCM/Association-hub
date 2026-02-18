import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@ahub/ui';
import { CaretLeft } from '@ahub/ui/src/icons';
import {
  useStravaStatus,
  useStravaConnect,
  useStravaSync,
  useStravaDisconnect,
} from '@/features/wallet/hooks/useStrava';
import { StravaConnectScreen } from '@/features/wallet/components/StravaConnectScreen';
import { StravaConnectedView } from '@/features/wallet/components/StravaConnectedView';
import { WalletGlassBackground } from '@/features/wallet/components/WalletGlassBackground';
import { ShimmerGlassSkeleton } from '@/features/wallet/components/ShimmerGlassSkeleton';

export default function StravaScreen() {
  const { data: strava, isLoading } = useStravaStatus();
  const connectMutation = useStravaConnect();
  const syncMutation = useStravaSync();
  const disconnectMutation = useStravaDisconnect();

  const handleConnect = async () => {
    try {
      connectMutation.mutate('strava-auth-code', {
        onError: (error) => {
          Alert.alert('Erro', error.message ?? 'Nao foi possivel conectar.');
        },
      });
    } catch {
      Alert.alert('Erro', 'Falha na autenticacao com Strava.');
    }
  };

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (result) => {
        Alert.alert(
          'Sincronizado!',
          `${result.activitiesSynced} atividades sincronizadas. +${result.pointsEarned} pontos!`,
        );
      },
      onError: (error) => {
        Alert.alert('Erro', error.message ?? 'Falha na sincronizacao.');
      },
    });
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Desconectar Strava',
      'Tem certeza que deseja desconectar? Voce nao ganhara mais pontos por atividades.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: () => {
            disconnectMutation.mutate(undefined, {
              onSuccess: () => router.back(),
              onError: (error) => {
                Alert.alert('Erro', error.message ?? 'Falha ao desconectar.');
              },
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <WalletGlassBackground />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <CaretLeft size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Strava</Text>
          <View style={{ width: 34 }} />
        </View>

        {/* Content */}
        <YStack flex={1} paddingHorizontal={20}>
          {isLoading ? (
            <YStack flex={1} justifyContent="center" alignItems="center" gap={16}>
              <ShimmerGlassSkeleton width={88} height={88} borderRadius={44} />
              <ShimmerGlassSkeleton width={160} height={24} borderRadius={8} />
              <ShimmerGlassSkeleton width={100} height={20} borderRadius={10} />
              <ShimmerGlassSkeleton width="100%" height={200} borderRadius={20} />
              <ShimmerGlassSkeleton width="100%" height={50} borderRadius={14} />
            </YStack>
          ) : strava?.connected ? (
            <StravaConnectedView
              strava={strava}
              isSyncing={syncMutation.isPending}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
            />
          ) : (
            <StravaConnectScreen
              onConnect={handleConnect}
              isConnecting={connectMutation.isPending}
            />
          )}
        </YStack>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D0520',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
