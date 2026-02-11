import { useState, useCallback } from 'react';
import {
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Avatar } from '@ahub/ui';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearchUsers } from '@/features/points/hooks/useRecipientSearch';
import { useCreateConversation } from '../hooks/useConversations';
import type { UserSearchResult } from '@ahub/shared/types';

export function NewConversationScreen() {
  const [search, setSearch] = useState('');
  const createConversation = useCreateConversation();
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(search);

  const handleSelectUser = useCallback(
    (userId: string) => {
      createConversation.mutate(
        {
          type: 'DIRECT',
          participantIds: [userId],
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
    },
    [createConversation]
  );

  const handleCreateGroup = useCallback(() => {
    router.push('/messages/create-group');
  }, []);

  const renderUser = useCallback(
    ({ item }: { item: UserSearchResult }) => (
      <Pressable
        onPress={() => handleSelectUser(item.userId)}
        disabled={createConversation.isPending}
      >
        <XStack
          alignItems="center"
          gap="$2.5"
          padding="$3"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Avatar src={item.avatar} name={item.name} size="sm" />
          <YStack flex={1}>
            <Text weight="medium" size="sm">
              {item.name}
            </Text>
          </YStack>
        </XStack>
      </Pressable>
    ),
    [handleSelectUser, createConversation.isPending]
  );

  const results = searchResults ?? [];

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
            Nova conversa
          </Text>
        </XStack>

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
              autoFocus
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Create Group option */}
        <Pressable onPress={handleCreateGroup}>
          <XStack
            alignItems="center"
            gap="$2.5"
            padding="$3"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
          >
            <View
              width={40}
              height={40}
              borderRadius="$full"
              backgroundColor="$primary"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="white" weight="bold" size="sm">
                G
              </Text>
            </View>
            <Text weight="semibold" size="sm">
              Criar grupo
            </Text>
          </XStack>
        </Pressable>

        {/* Search Results */}
        {isSearching && search.length >= 2 ? (
          <YStack padding="$4" alignItems="center">
            <ActivityIndicator color="#8B5CF6" />
          </YStack>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.userId}
            renderItem={renderUser}
            ListEmptyComponent={
              search.length >= 2 ? (
                <YStack padding="$4" alignItems="center">
                  <Text color="secondary" size="sm">
                    Nenhum usuário encontrado
                  </Text>
                </YStack>
              ) : search.length > 0 ? (
                <YStack padding="$4" alignItems="center">
                  <Text color="secondary" size="xs">
                    Digite ao menos 2 caracteres
                  </Text>
                </YStack>
              ) : null
            }
          />
        )}

        {/* Loading overlay for conversation creation */}
        {createConversation.isPending && (
          <View
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="rgba(0,0,0,0.3)"
            alignItems="center"
            justifyContent="center"
          >
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
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
});
