import { Alert } from 'react-native';
import { XStack } from 'tamagui';
import { router } from 'expo-router';
import { Button } from '@ahub/ui';

interface ProfileActionsProps {
  isMe: boolean;
  userId: string;
}

export function ProfileActions({ isMe, userId }: ProfileActionsProps) {
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
        onPress={() => {
          // TODO: Navigate to messages (Phase 4)
          Alert.alert('Em breve', 'Mensagens serão implementadas na Fase 4.');
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
