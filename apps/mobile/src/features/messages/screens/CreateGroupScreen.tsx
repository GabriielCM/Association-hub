import { useState, useCallback } from 'react';
import {
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { YStack, XStack, View } from 'tamagui';
import { Text, Avatar, Button, ScreenHeader } from '@ahub/ui';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearchUsers } from '@/features/points/hooks/useRecipientSearch';
import { useCreateConversation } from '../hooks/useConversations';
import { uploadMedia } from '../api/messages.api';
import type { UserSearchResult } from '@ahub/shared/types';

type Step = 'participants' | 'details';

export function CreateGroupScreen() {
  const [step, setStep] = useState<Step>('participants');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<UserSearchResult[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupImageUri, setGroupImageUri] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: searchResults, isLoading: isSearching } = useSearchUsers(search);
  const createConversation = useCreateConversation();

  const results = searchResults ?? [];

  const toggleUser = useCallback((user: UserSearchResult) => {
    setSelected((prev) => {
      const exists = prev.some((u) => u.userId === user.userId);
      if (exists) {
        return prev.filter((u) => u.userId !== user.userId);
      }
      return [...prev, user];
    });
  }, []);

  const removeUser = useCallback((userId: string) => {
    setSelected((prev) => prev.filter((u) => u.userId !== userId));
  }, []);

  const handleNext = useCallback(() => {
    setStep('details');
  }, []);

  const handleBack = useCallback(() => {
    if (step === 'details') {
      setStep('participants');
    } else {
      router.back();
    }
  }, [step]);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para adicionar uma foto ao grupo.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setGroupImageUri(result.assets[0].uri);
    }
  }, []);

  const handleCreateGroup = useCallback(async () => {
    if (!groupName.trim() || selected.length < 2) return;

    let groupImageUrl: string | undefined;
    if (groupImageUri) {
      try {
        setIsUploadingImage(true);
        const { url } = await uploadMedia(groupImageUri);
        groupImageUrl = url;
      } catch {
        Alert.alert('Erro', 'Não foi possível enviar a imagem do grupo.');
        return;
      } finally {
        setIsUploadingImage(false);
      }
    }

    createConversation.mutate(
      {
        type: 'GROUP',
        participantIds: selected.map((u) => u.userId),
        groupName: groupName.trim(),
        groupDescription: groupDescription.trim() || undefined,
        ...(groupImageUrl != null ? { groupImageUrl } : {}),
      },
      {
        onSuccess: (conversation) => {
          router.replace({
            pathname: '/messages/[conversationId]',
            params: { conversationId: conversation.id },
          } as never);
        },
      }
    );
  }, [groupName, groupDescription, groupImageUri, selected, createConversation]);

  const isUserSelected = useCallback(
    (userId: string) => selected.some((u) => u.userId === userId),
    [selected]
  );

  const renderSearchUser = useCallback(
    ({ item }: { item: UserSearchResult }) => {
      const isSelected = isUserSelected(item.userId);
      return (
        <Pressable onPress={() => toggleUser(item)}>
          <XStack
            alignItems="center"
            gap="$2.5"
            padding="$3"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
            backgroundColor={isSelected ? 'rgba(139, 92, 246, 0.08)' : 'transparent'}
          >
            <Avatar src={item.avatar} name={item.name} size="sm" />
            <Text weight="medium" size="sm" flex={1}>
              {item.name}
            </Text>
            <View
              width={24}
              height={24}
              borderRadius="$full"
              borderWidth={2}
              borderColor={isSelected ? '$primary' : '$borderColor'}
              backgroundColor={isSelected ? '$primary' : 'transparent'}
              alignItems="center"
              justifyContent="center"
            >
              {isSelected && (
                <Text color="white" style={{ fontSize: 12 }} weight="bold">
                  ✓
                </Text>
              )}
            </View>
          </XStack>
        </Pressable>
      );
    },
    [isUserSelected, toggleUser]
  );

  if (step === 'details') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <YStack flex={1} backgroundColor="$background">
          {/* Header */}
          <ScreenHeader title="Detalhes do grupo" headingLevel={4} onBack={handleBack} />

          <ScrollView contentContainerStyle={styles.detailsContent}>
            {/* Group Image Picker */}
            <Pressable onPress={handlePickImage} disabled={isUploadingImage}>
              <YStack alignItems="center" gap="$1.5">
                <View style={styles.imagePickerContainer}>
                  {groupImageUri ? (
                    <Image
                      source={{ uri: groupImageUri }}
                      style={styles.imagePreview}
                    />
                  ) : (
                    <View
                      width={80}
                      height={80}
                      borderRadius="$full"
                      backgroundColor="$backgroundHover"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text style={{ fontSize: 28 }}>
                        {isUploadingImage ? '...' : '📷'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.cameraOverlay}>
                    <Text style={{ fontSize: 14, color: '#fff' }}>
                      {isUploadingImage ? '...' : '📷'}
                    </Text>
                  </View>
                </View>
                <Text color="secondary" size="xs">
                  Foto do grupo (opcional)
                </Text>
              </YStack>
            </Pressable>

            {/* Group Name */}
            <YStack gap="$1">
              <Text weight="semibold" size="sm">
                Nome do grupo *
              </Text>
              <View
                borderRadius="$lg"
                backgroundColor="$backgroundHover"
                paddingHorizontal="$3"
                paddingVertical="$2"
              >
                <TextInput
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="Nome do grupo..."
                  maxLength={100}
                  autoFocus
                  style={styles.input}
                />
              </View>
              <Text color="secondary" size="xs" align="right">
                {groupName.length}/100
              </Text>
            </YStack>

            {/* Description */}
            <YStack gap="$1">
              <Text weight="semibold" size="sm">
                Descrição (opcional)
              </Text>
              <View
                borderRadius="$lg"
                backgroundColor="$backgroundHover"
                paddingHorizontal="$3"
                paddingVertical="$2"
              >
                <TextInput
                  value={groupDescription}
                  onChangeText={setGroupDescription}
                  placeholder="Descrição do grupo..."
                  maxLength={300}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, { minHeight: 60 }]}
                />
              </View>
            </YStack>

            {/* Participants preview */}
            <YStack gap="$2" marginTop="$2">
              <Text weight="semibold" size="sm">
                Participantes ({selected.length})
              </Text>
              {selected.map((user) => (
                <XStack key={user.userId} alignItems="center" gap="$2" paddingVertical="$1">
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <Text size="sm" flex={1}>
                    {user.name}
                  </Text>
                </XStack>
              ))}
            </YStack>

            {/* Create button */}
            <Button
              onPress={handleCreateGroup}
              disabled={!groupName.trim() || createConversation.isPending || isUploadingImage}
              loading={createConversation.isPending || isUploadingImage}
              size="lg"
              fullWidth
              marginTop="$4"
            >
              {isUploadingImage ? 'Enviando imagem...' : 'Criar grupo'}
            </Button>
          </ScrollView>
        </YStack>
      </SafeAreaView>
    );
  }

  // Step: participants
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <ScreenHeader
          title="Criar grupo"
          headingLevel={4}
          onBack={handleBack}
          rightContent={
            <Pressable
              onPress={handleNext}
              disabled={selected.length < 2}
            >
              <Text
                color={selected.length >= 2 ? 'accent' : 'secondary'}
                weight="semibold"
                size="sm"
              >
                Próximo ({selected.length})
              </Text>
            </Pressable>
          }
        />

        {/* Selected chips */}
        {selected.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {selected.map((user) => (
              <Pressable key={user.userId} onPress={() => removeUser(user.userId)}>
                <XStack
                  alignItems="center"
                  gap="$1"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$full"
                  backgroundColor="$primary"
                >
                  <Avatar src={user.avatar} name={user.name} size="xs" />
                  <Text color="white" size="xs" weight="semibold">
                    {user.name.split(' ')[0]}
                  </Text>
                  <Text color="white" size="xs">✕</Text>
                </XStack>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Search */}
        <View paddingHorizontal="$3" paddingBottom="$2">
          <View
            borderRadius="$xl"
            backgroundColor="$backgroundHover"
            paddingHorizontal="$3"
            paddingVertical="$1.5"
          >
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nome..."
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Minimum hint */}
        {selected.length < 2 && (
          <XStack paddingHorizontal="$3" paddingBottom="$1">
            <Text color="secondary" size="xs">
              Selecione ao menos 2 participantes
            </Text>
          </XStack>
        )}

        {/* Search Results */}
        {isSearching && search.length >= 2 ? (
          <YStack padding="$4" alignItems="center">
            <ActivityIndicator color="#8B5CF6" />
          </YStack>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.userId}
            renderItem={renderSearchUser}
            ListEmptyComponent={
              search.length >= 2 ? (
                <YStack padding="$4" alignItems="center">
                  <Text color="secondary" size="sm">
                    Nenhum usuário encontrado
                  </Text>
                </YStack>
              ) : (
                <YStack padding="$4" alignItems="center">
                  <Text color="secondary" size="xs">
                    Busque membros para adicionar ao grupo
                  </Text>
                </YStack>
              )
            }
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    fontSize: 14,
    color: '#1F2937',
  },
  input: {
    fontSize: 14,
    color: '#1F2937',
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  detailsContent: {
    padding: 16,
    gap: 16,
  },
  imagePickerContainer: {
    position: 'relative' as const,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
