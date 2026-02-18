import { Alert, useColorScheme } from 'react-native';
import { ScrollView, StyleSheet } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Heading, Avatar, Card, Button, ScreenHeader, Icon } from '@ahub/ui';
import { SpeakerSlash, Bell, Warning } from '@ahub/ui/src/icons';
import Prohibit from 'phosphor-react-native/src/icons/Prohibit';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';
import { useConversation, useUpdateConversationSettings } from '@/features/messages/hooks/useConversations';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { OnlineStatus } from '@/features/messages/components/OnlineStatus';
import { colors } from '@ahub/ui/themes';

export default function ContactDetailScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const user = useAuthStore((s) => s.user);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  // Dark mode glass card overrides
  const darkCardProps = isDark ? {
    backgroundColor: 'rgba(255,255,255,0.07)' as const,
    borderColor: 'rgba(255,255,255,0.06)' as const,
  } : {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0D0520' : colors.background }]} edges={['top', 'bottom']}>
      <YStack flex={1} backgroundColor={isDark ? '#0D0520' : '$background'}>
        {/* Header */}
        <ScreenHeader headingLevel={4} onBack={() => router.back()}>
          <Heading level={4} numberOfLines={1} {...(isDark ? { style: { color: '#FFFFFF' } } : {})}>
            Detalhes do Contato
          </Heading>
        </ScreenHeader>

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

            <Text
              weight="bold"
              size="xl"
              {...(isDark ? { style: { color: '#FFFFFF' } } : {})}
            >
              {otherParticipant.name}
            </Text>

            <Text
              size="sm"
              {...(isDark
                ? { style: { color: isOnline ? '#86EFAC' : 'rgba(255,255,255,0.6)' } }
                : { color: isOnline ? 'success' : 'secondary' }
              )}
            >
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
                size="sm"
                align="center"
                style={{ maxWidth: 280, ...(isDark ? { color: 'rgba(255,255,255,0.6)' } : {}) }}
                {...(!isDark ? { color: 'secondary' } : {})}
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
              {...(isDark ? { backgroundColor: '#06B6D4' } : {})}
            >
              Ver Perfil Completo
            </Button>
          </YStack>

          {/* Actions */}
          <YStack paddingHorizontal="$4" gap="$2">
            {/* Mute */}
            <Card variant="flat" pressable onPress={handleToggleMute} {...darkCardProps}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text weight="medium" {...(isDark ? { style: { color: '#FFFFFF' } } : {})}>
                  Silenciar conversa
                </Text>
                <Icon icon={isMuted ? SpeakerSlash : Bell} size="md" color={isDark ? 'rgba(255,255,255,0.4)' : 'secondary'} />
              </XStack>
            </Card>

            {/* Block */}
            <Card variant="flat" pressable onPress={handleBlock} {...darkCardProps}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text weight="medium" {...(isDark ? { style: { color: '#FFFFFF' } } : { color: 'error' })}>
                  Bloquear
                </Text>
                <Icon icon={Prohibit} size="md" color={isDark ? 'rgba(255,255,255,0.4)' : 'error'} />
              </XStack>
            </Card>

            {/* Report */}
            <Card variant="flat" pressable onPress={handleReport} {...darkCardProps}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text weight="medium" {...(isDark ? { style: { color: '#FFFFFF' } } : { color: 'error' })}>
                  Denunciar
                </Text>
                <Icon icon={Warning} size="md" color={isDark ? 'rgba(255,255,255,0.4)' : 'error'} />
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
