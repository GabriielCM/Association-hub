import { Alert, Pressable, StyleSheet } from 'react-native';
import { XStack } from 'tamagui';
import { router } from 'expo-router';
import { Button } from '@ahub/ui';
import { PencilSimple, ShareNetwork } from 'phosphor-react-native';
import { useCreateConversation } from '@/features/messages/hooks/useConversations';
import * as Haptics from 'expo-haptics';
import { useProfileTheme } from '../hooks/useProfileTheme';

interface ProfileActionsProps {
  isMe: boolean;
  userId: string;
  onSharePress?: () => void;
}

export function ProfileActions({ isMe, userId, onSharePress }: ProfileActionsProps) {
  const createConversation = useCreateConversation();
  const pt = useProfileTheme();

  if (isMe) {
    return (
      <XStack gap="$3" justifyContent="center" paddingHorizontal="$4">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/profile/edit');
          }}
          style={[styles.iconButton, { borderColor: pt.borderColor }]}
        >
          <PencilSimple size={20} color={pt.iconColor} weight="regular" />
        </Pressable>
        {onSharePress && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSharePress();
            }}
            style={[styles.iconButton, { borderColor: pt.borderColor }]}
          >
            <ShareNetwork size={20} color={pt.iconColor} weight="regular" />
          </Pressable>
        )}
      </XStack>
    );
  }

  return (
    <XStack gap="$2" paddingHorizontal="$4">
      <Button
        variant="primary"
        size="md"
        flex={1}
        disabled={createConversation.isPending}
        onPress={() => {
          createConversation.mutate(
            { type: 'DIRECT', participantIds: [userId] },
            {
              onSuccess: (conversation) => {
                router.push({
                  pathname: '/messages/[conversationId]',
                  params: { conversationId: conversation.id },
                } as never);
              },
              onError: () => {
                Alert.alert('Erro', 'Não foi possível iniciar a conversa.');
              },
            }
          );
        }}
      >
        Mensagem
      </Button>
      <Button
        variant="outline"
        size="md"
        onPress={() => {
          Alert.alert('Denunciar', 'Deseja denunciar este perfil?', [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Denunciar',
              style: 'destructive',
              onPress: () => {
                Alert.alert('Denúncia enviada', 'Obrigado pelo feedback.');
              },
            },
          ]);
        }}
      >
        ...
      </Button>
    </XStack>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
