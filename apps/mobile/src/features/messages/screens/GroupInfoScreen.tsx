import { useCallback, useState } from 'react';
import { ScrollView, Pressable, Alert, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { YStack, XStack, View } from 'tamagui';
import { Text, Avatar, Card } from '@ahub/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';
import { useGroupInfo, useLeaveConversation } from '../hooks/useConversations';
import { ParticipantsList } from '../components/ParticipantsList';
import {
  addParticipants,
  removeParticipant,
  promoteToAdmin,
  uploadMedia,
  updateGroup,
} from '../api/messages.api';
import { useQueryClient } from '@tanstack/react-query';
import { messageKeys } from '../hooks/useConversations';

export function GroupInfoScreen() {
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: groupInfo } = useGroupInfo(conversationId ?? '');
  const leaveConversation = useLeaveConversation();

  const isAdmin = groupInfo?.admins?.some((a) => a.id === user?.id) ?? false;
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleChangeGroupImage = useCallback(async () => {
    if (!conversationId) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para alterar a foto do grupo.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    try {
      setIsUploadingImage(true);
      const { url } = await uploadMedia(result.assets[0].uri);
      await updateGroup(conversationId, { imageUrl: url });
      queryClient.invalidateQueries({
        queryKey: messageKeys.group(conversationId),
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a imagem do grupo.');
    } finally {
      setIsUploadingImage(false);
    }
  }, [conversationId, queryClient]);

  const handleRemoveParticipant = useCallback(
    (userId: string) => {
      if (!conversationId) return;
      Alert.alert(
        'Remover participante',
        'Tem certeza que deseja remover este participante?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: async () => {
              await removeParticipant(conversationId, userId);
              queryClient.invalidateQueries({
                queryKey: messageKeys.group(conversationId),
              });
            },
          },
        ]
      );
    },
    [conversationId, queryClient]
  );

  const handlePromoteToAdmin = useCallback(
    async (userId: string) => {
      if (!conversationId) return;
      await promoteToAdmin(conversationId, userId);
      queryClient.invalidateQueries({
        queryKey: messageKeys.group(conversationId),
      });
    },
    [conversationId, queryClient]
  );

  const handleLeaveGroup = useCallback(() => {
    if (!conversationId) return;
    Alert.alert('Sair do grupo', 'Tem certeza que deseja sair deste grupo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          leaveConversation.mutate(conversationId, {
            onSuccess: () => {
              router.replace('/messages');
            },
          });
        },
      },
    ]);
  }, [conversationId, leaveConversation]);

  if (!groupInfo) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack
          alignItems="center"
          gap="$2"
          paddingHorizontal="$3"
          paddingVertical="$2"
        >
          <Pressable onPress={() => router.back()}>
            <Text size="lg">←</Text>
          </Pressable>
          <Text weight="bold" size="xl">
            Info do grupo
          </Text>
        </XStack>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Group Avatar & Name */}
          <YStack alignItems="center" gap="$2" paddingVertical="$3">
            <Pressable
              onPress={isAdmin ? handleChangeGroupImage : undefined}
              disabled={!isAdmin || isUploadingImage}
            >
              <View style={styles.imagePickerContainer}>
                {groupInfo.imageUrl ? (
                  <Avatar src={groupInfo.imageUrl} name={groupInfo.name} size="xl" />
                ) : (
                  <View
                    width={80}
                    height={80}
                    borderRadius="$full"
                    backgroundColor="$primary"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" size="2xl" weight="bold">
                      {groupInfo.name.charAt(0)}
                    </Text>
                  </View>
                )}
                {isAdmin && (
                  <View style={styles.cameraOverlay}>
                    <Text style={{ fontSize: 14, color: '#fff' }}>
                      {isUploadingImage ? '...' : '📷'}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
            <Text weight="bold" size="xl">
              {groupInfo.name}
            </Text>
            {groupInfo.description && (
              <Text color="secondary" size="sm" align="center">
                {groupInfo.description}
              </Text>
            )}
            <Text color="secondary" size="xs">
              Grupo · {groupInfo.participantsCount} participantes
            </Text>
          </YStack>

          {/* Media count */}
          {groupInfo.mediaCount > 0 && (
            <Card variant="flat">
              <XStack
                alignItems="center"
                justifyContent="space-between"
                padding="$3"
              >
                <Text size="sm">Mídia compartilhada</Text>
                <Text color="primary" size="sm" weight="semibold">
                  {groupInfo.mediaCount}
                </Text>
              </XStack>
            </Card>
          )}

          {/* Participants */}
          <YStack gap="$1" marginTop="$3">
            <XStack
              alignItems="center"
              justifyContent="space-between"
              paddingHorizontal="$3"
            >
              <Text weight="semibold" size="sm">
                Participantes ({groupInfo.participantsCount})
              </Text>
              {isAdmin && (
                <Pressable>
                  <Text color="primary" size="xs" weight="semibold">
                    Adicionar
                  </Text>
                </Pressable>
              )}
            </XStack>

            <ParticipantsList
              participants={groupInfo.participants}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              onRemove={handleRemoveParticipant}
              onPromote={handlePromoteToAdmin}
              onParticipantPress={(userId) =>
                router.push({
                  pathname: '/profile/[userId]',
                  params: { userId },
                } as never)
              }
            />
          </YStack>

          {/* Leave group */}
          <YStack marginTop="$4" paddingHorizontal="$3">
            <Pressable onPress={handleLeaveGroup}>
              <XStack
                alignItems="center"
                justifyContent="center"
                padding="$3"
                borderRadius="$lg"
                backgroundColor="rgba(239, 68, 68, 0.1)"
              >
                <Text color="error" weight="semibold" size="sm">
                  Sair do grupo
                </Text>
              </XStack>
            </Pressable>
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
  imagePickerContainer: {
    position: 'relative' as const,
  },
  cameraOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
