import { Alert } from 'react-native';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Card, Badge, Button } from '@ahub/ui';
import { useAuthContext } from '@/providers/AuthProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useBiometrics, getBiometricLabel } from '@/hooks/useBiometrics';
import { useProfile } from '@/features/profile/hooks/useProfile';

export default function SettingsScreen() {
  const { user } = useAuthContext();
  const { theme, themeMode, toggleTheme } = useThemeContext();
  const { logout, isLoading: logoutLoading } = useAuth();
  const { isAvailable, isEnabled, biometricType, enableBiometrics, disableBiometrics } =
    useBiometrics();

  const userId = user?.id || '';
  const { data: profile } = useProfile(userId);

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleBiometricsToggle = async () => {
    if (isEnabled) {
      await disableBiometrics();
    } else {
      await enableBiometrics();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <ScrollView>
        <YStack padding="$4" gap="$4">
          {/* Header */}
          <XStack alignItems="center" gap="$2">
            <Button variant="ghost" size="sm" onPress={() => router.back()}>
              ←
            </Button>
            <Heading level={3}>Configurações</Heading>
          </XStack>

          {/* Settings */}
          <YStack gap="$2">
            {/* Subscription */}
            <Card variant="flat" pressable onPress={() => router.push('/subscriptions/my-subscription')}>
              <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                  <Text weight="medium">Minha Assinatura</Text>
                  <Text color="secondary" size="sm">
                    {profile?.subscription || 'Gerencie seu plano'}
                  </Text>
                </YStack>
                <Text>⭐</Text>
              </XStack>
            </Card>

            {/* Theme */}
            <Card variant="flat" pressable onPress={toggleTheme}>
              <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                  <Text weight="medium">Tema</Text>
                  <Text color="secondary" size="sm">
                    {themeMode === 'system'
                      ? 'Automático (sistema)'
                      : themeMode === 'light'
                      ? 'Claro'
                      : 'Escuro'}
                  </Text>
                </YStack>
                <Text>{theme === 'dark' ? '🌙' : '☀️'}</Text>
              </XStack>
            </Card>

            {/* Biometrics */}
            {isAvailable && biometricType && (
              <Card variant="flat" pressable onPress={handleBiometricsToggle}>
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack>
                    <Text weight="medium">
                      {getBiometricLabel(biometricType)}
                    </Text>
                    <Text color="secondary" size="sm">
                      Login rápido com biometria
                    </Text>
                  </YStack>
                  <Badge variant={isEnabled ? 'success' : 'ghost'}>
                    {isEnabled ? 'Ativado' : 'Desativado'}
                  </Badge>
                </XStack>
              </Card>
            )}

            {/* Notifications */}
            <Card variant="flat" pressable onPress={() => router.push('/notifications/settings')}>
              <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                  <Text weight="medium">Notificações</Text>
                  <Text color="secondary" size="sm">
                    Gerenciar preferências
                  </Text>
                </YStack>
                <Text>🔔</Text>
              </XStack>
            </Card>

          </YStack>

          {/* Support */}
          <YStack gap="$2">
            <Text weight="semibold" size="lg">
              Suporte
            </Text>

            <Card variant="flat" pressable>
              <XStack justifyContent="space-between" alignItems="center">
                <Text weight="medium">Central de Ajuda</Text>
                <Text>❓</Text>
              </XStack>
            </Card>

            <Card variant="flat" pressable>
              <XStack justifyContent="space-between" alignItems="center">
                <Text weight="medium">Termos de Uso</Text>
                <Text>📄</Text>
              </XStack>
            </Card>

            <Card variant="flat" pressable>
              <XStack justifyContent="space-between" alignItems="center">
                <Text weight="medium">Política de Privacidade</Text>
                <Text>🔒</Text>
              </XStack>
            </Card>
          </YStack>

          {/* Logout */}
          <Button
            variant="danger"
            size="lg"
            fullWidth
            onPress={handleLogout}
            loading={logoutLoading}
            marginTop="$4"
          >
            Sair da conta
          </Button>

          {/* App version */}
          <Text color="secondary" size="xs" align="center" marginTop="$2">
            A-hub v0.1.0
          </Text>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
