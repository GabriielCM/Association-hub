import { Alert } from 'react-native';
import { XStack } from 'tamagui';
import { router } from 'expo-router';
import { Button } from '@ahub/ui';
import { useCreateConversation } from '@/features/messages/hooks/useConversations';

interface ProfileActionsProps {
  isMe: boolean;
  userId: string;
}

export function ProfileActions({ isMe, userId }: ProfileActionsProps) {
  const createConversation = useCreateConversation();

  if (isMe) {
    return (
      <XStack gap="$2" paddingHorizontal="$4">
        <Button
          variant="outline"
          size="md"
          flex={1}
          onPress={() => router.push('/profile/edit')}
        >
          Editar perfil
        </Button>
        <Button
          variant="outline"
          size="md"
          flex={1}
          onPress={() => router.push('/profile/badges')}
        >
          Badges
        </Button>
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
