import { Alert } from 'react-native';
import { ScrollView, StyleSheet } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Avatar, Card, Button, ScreenHeader } from '@ahub/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';
import { useConversation, useUpdateConversationSettings } from '@/features/messages/hooks/useConversations';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { OnlineStatus } from '@/features/messages/components/OnlineStatus';

export default function ContactDetailScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const user = useAuthStore((s) => s.user);

  const { data: conversation } = useConversation(conversationId ?? '');
  const updateSettings = useUpdateConversationSettings();

  const otherParticipant = conversation?.participants.find(
    (p) => p.id !== user?.id
  );

  const { data: profile } = useProfile(otherParticipant?.id ?? '');

  const isMuted = conversation?.settings?.isMuted ?? false;

  const handleToggleMute = () => {
    if (!conversationId) return;
    updateSettings.mutate({
      id: conversationId,
      data: { isMuted: !isMuted },
    });
  };

  const handleViewProfile = () => {
    if (!otherParticipant) return;
    router.push({
      pathname: '/profile/[userId]',
      params: { userId: otherParticipant.id },
    } as never);
  };

  const handleBlock = () => {
    Alert.alert(
      'Bloquear usuário',
      `Deseja bloquear ${otherParticipant?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Bloquear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Em breve', 'Funcionalidade será implementada.');
          },
        },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Denunciar usuário',
      `Deseja denunciar ${otherParticipant?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Denunciar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Denúncia enviada', 'Obrigado pelo feedback.');
          },
        },
      ]
    );
  };

  if (!otherParticipant) return null;

  const isOnline = otherParticipant.isOnline ?? false;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <ScreenHeader title="Detalhes do Contato" headingLevel={4} onBack={() => router.back()} />

        <ScrollView contentContainerStyle={styles.content}>
          {/* Avatar & Info */}
          <YStack alignItems="center" gap="$2" paddingVertical="$4">
            <View position="relative">
              <Avatar
                src={otherParticipant.avatarUrl}
                name={otherParticipant.name}
                size="2xl"
              />
              <View position="absolute" bottom={4} right={4}>
                <OnlineStatus isOnline={isOnline} size={14} />
              </View>
            </View>

            <Text weight="bold" size="xl">
              {otherParticipant.name}
            </Text>

            <Text color={isOnline ? 'success' : 'secondary'} size="sm">
              {isOnline
                ? 'Online'
                : otherParticipant.lastSeenAt
                  ? `Visto por último ${new Date(otherParticipant.lastSeenAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : 'Offline'}
            </Text>

            {profile?.bio && (
              <Text
                color="secondary"
                size="sm"
                align="center"
                style={{ maxWidth: 280 }}
                numberOfLines={3}
              >
                {profile.bio}
              </Text>
            )}
          </YStack>

          {/* View Profile Button */}
          <YStack paddingHorizontal="$4" marginBottom="$4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleViewProfile}
            >
              Ver Perfil Completo
            </Button>
          </YStack>

          {/* Actions */}
          <YStack paddingHorizontal="$4" gap="$2">
            {/* Mute */}
            <Card variant="flat" pressable onPress={handleToggleMute}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text weight="medium">Silenciar conversa</Text>
                <Text>{isMuted ? '🔇' : '🔔'}</Text>
              </XStack>
            </Card>

            {/* Block */}
            <Card variant="flat" pressable onPress={handleBlock}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text weight="medium" color="error">
                  Bloquear
                </Text>
                <Text>🚫</Text>
              </XStack>
            </Card>

            {/* Report */}
            <Card variant="flat" pressable onPress={handleReport}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text weight="medium" color="error">
                  Denunciar
                </Text>
                <Text>⚠️</Text>
              </XStack>
            </Card>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
});
