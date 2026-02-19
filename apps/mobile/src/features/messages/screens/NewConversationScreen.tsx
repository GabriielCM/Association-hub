import { useState, useCallback } from 'react';
import {
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Heading, Avatar, ScreenHeader } from '@ahub/ui';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearchUsers } from '@/features/points/hooks/useRecipientSearch';
import { useCreateConversation } from '../hooks/useConversations';
import type { UserSearchResult } from '@ahub/shared/types';
import { colors } from '@ahub/ui/themes';

export function NewConversationScreen() {
  const [search, setSearch] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const createConversation = useCreateConversation();
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(search);

  const spinnerColor = isDark ? '#06B6D4' : '#8B5CF6';

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
          borderBottomColor={isDark ? 'rgba(255,255,255,0.06)' : '$borderColor'}
        >
          <Avatar src={item.avatar} name={item.name} size="sm" />
          <YStack flex={1}>
            <Text weight="medium" size="sm" {...(isDark ? { style: { color: '#FFFFFF' } } : {})}>
              {item.name}
            </Text>
          </YStack>
        </XStack>
      </Pressable>
    ),
    [handleSelectUser, createConversation.isPending, isDark]
  );

  const results = searchResults ?? [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0D0520' : colors.background }]} edges={['top', 'bottom']}>
      <YStack flex={1} backgroundColor={isDark ? '#0D0520' : '$background'}>
        {/* Header */}
        <ScreenHeader headingLevel={4} onBack={() => router.back()}>
          <Heading level={4} numberOfLines={1} {...(isDark ? { style: { color: '#FFFFFF' } } : {})}>
            Nova conversa
          </Heading>
        </ScreenHeader>

        {/* Search */}
        <View paddingHorizontal="$3" paddingBottom="$2">
          <View
            borderRadius="$xl"
            backgroundColor={isDark ? 'rgba(255,255,255,0.07)' : '$backgroundHover'}
            paddingHorizontal="$3"
            paddingVertical="$1.5"
          >
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nome..."
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF'}
              autoFocus
              style={[styles.searchInput, { color: isDark ? '#F9FAFB' : '#1F2937' }]}
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
            borderBottomColor={isDark ? 'rgba(255,255,255,0.06)' : '$borderColor'}
          >
            <View
              width={40}
              height={40}
              borderRadius="$full"
              backgroundColor={isDark ? '#06B6D4' : '$primary'}
              alignItems="center"
              justifyContent="center"
            >
              <Text color="white" weight="bold" size="sm">
                G
              </Text>
            </View>
            <Text weight="semibold" size="sm" {...(isDark ? { style: { color: '#FFFFFF' } } : {})}>
              Criar grupo
            </Text>
          </XStack>
        </Pressable>

        {/* Search Results */}
        {isSearching && search.length >= 2 ? (
          <YStack padding="$4" alignItems="center">
            <ActivityIndicator color={spinnerColor} />
          </YStack>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.userId}
            renderItem={renderUser}
            ListEmptyComponent={
              search.length >= 2 ? (
                <YStack padding="$4" alignItems="center">
                  <Text size="sm" {...(isDark ? { style: { color: 'rgba(255,255,255,0.6)' } } : { color: 'secondary' })}>
                    Nenhum usuário encontrado
                  </Text>
                </YStack>
              ) : search.length > 0 ? (
                <YStack padding="$4" alignItems="center">
                  <Text size="xs" {...(isDark ? { style: { color: 'rgba(255,255,255,0.6)' } } : { color: 'secondary' })}>
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
            <ActivityIndicator size="large" color={spinnerColor} />
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
    paddingVertical: 0,
  },
});
