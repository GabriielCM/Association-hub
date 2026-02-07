import { useState } from 'react';
import { ScrollView, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, Heading, Card, Badge, Button } from '@ahub/ui';
import { useAuthContext } from '@/providers/AuthProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useBiometrics, getBiometricLabel } from '@/hooks/useBiometrics';
import { useProfile, useUserBadges } from '@/features/profile/hooks/useProfile';
import { useUpdateBadgesDisplay } from '@/features/profile/hooks/useEditProfile';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileStats } from '@/features/profile/components/ProfileStats';
import { ProfileActions } from '@/features/profile/components/ProfileActions';
import { BadgesModal } from '@/features/profile/components/BadgesModal';

export default function PerfilScreen() {
  const { user } = useAuthContext();
  const { theme, themeMode, toggleTheme } = useThemeContext();
  const { logout, isLoading: logoutLoading } = useAuth();
  const { isAvailable, isEnabled, biometricType, enableBiometrics, disableBiometrics } =
    useBiometrics();

  const userId = user?.id || '';
  const { data: profile, isLoading, refetch } = useProfile(userId);
  const { data: badgesData } = useUserBadges(userId);
  const updateBadges = useUpdateBadgesDisplay();

  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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

  const handleSaveBadges = async (selectedIds: string[]) => {
    try {
      await updateBadges.mutateAsync(selectedIds);
      setShowBadgesModal(false);
      Alert.alert('Sucesso', 'Badges atualizados!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar os badges.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <YStack padding="$4" gap="$4">
          <Heading level={3}>Perfil</Heading>

          {/* Profile Card */}
          {profile ? (
            <Card variant="elevated">
              <ProfileHeader
                profile={profile}
                onAvatarPress={() => router.push('/profile/edit')}
              />
              <ProfileStats profile={profile} />
            </Card>
          ) : (
            <Card variant="elevated">
              <YStack alignItems="center" gap="$3" paddingVertical="$4">
                <Text color="secondary">Carregando perfil...</Text>
              </YStack>
            </Card>
          )}

          {/* Actions */}
          <ProfileActions isMe={true} userId={userId} />

          {/* Settings */}
          <YStack gap="$2">
            <Text weight="semibold" size="lg">
              Configurações
            </Text>

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
            <Card variant="flat" pressable>
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

      {/* Badges Modal */}
      <BadgesModal
        visible={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
        badges={badgesData?.data || []}
        onSave={handleSaveBadges}
        isSaving={updateBadges.isPending}
      />
    </SafeAreaView>
  );
}
