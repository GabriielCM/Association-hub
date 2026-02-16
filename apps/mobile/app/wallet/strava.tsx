import { Alert } from 'react-native';
import { router } from 'expo-router';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spinner, ScreenHeader } from '@ahub/ui';
import {
  useStravaStatus,
  useStravaConnect,
  useStravaSync,
  useStravaDisconnect,
} from '@/features/wallet/hooks/useStrava';
import { StravaConnectScreen } from '@/features/wallet/components/StravaConnectScreen';
import { StravaConnectedView } from '@/features/wallet/components/StravaConnectedView';

export default function StravaScreen() {
  const { data: strava, isLoading } = useStravaStatus();
  const connectMutation = useStravaConnect();
  const syncMutation = useStravaSync();
  const disconnectMutation = useStravaDisconnect();

  const handleConnect = async () => {
    // In production, use expo-auth-session for OAuth flow
    // For now, simulate the auth code exchange
    try {
      connectMutation.mutate('strava-auth-code', {
        onError: (error) => {
          Alert.alert('Erro', error.message ?? 'Não foi possível conectar.');
        },
      });
    } catch {
      Alert.alert('Erro', 'Falha na autenticação com Strava.');
    }
  };

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (result) => {
        Alert.alert(
          'Sincronizado!',
          `${result.activitiesSynced} atividades sincronizadas. +${result.pointsEarned} pontos!`
        );
      },
      onError: (error) => {
        Alert.alert('Erro', error.message ?? 'Falha na sincronização.');
      },
    });
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Desconectar Strava',
      'Tem certeza que deseja desconectar? Você não ganhará mais pontos por atividades.',
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
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <ScreenHeader title="Strava" headingLevel={3} onBack={() => router.back()} />
      <YStack flex={1} padding="$4" gap="$4">
        {/* Content */}
        {isLoading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Spinner size="lg" />
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
  );
}
