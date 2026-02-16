import { useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';
import { useConversations } from '../hooks/useConversations';
import { usePresence } from '../hooks/usePresence';
import { ConversationItem } from '../components/ConversationItem';
import type { Conversation } from '@ahub/shared/types';

export function ConversationsScreen() {
  const [search, setSearch] = useState('');
  const user = useAuthStore((s) => s.user);

  const {
    data: conversationsData,
    isLoading,
    refetch,
    isRefetching,
  } = useConversations();

  const { presenceMap, typingMap, recordingMap } = usePresence();

  const conversations = conversationsData?.data ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      if (c.type === 'GROUP' && c.group) {
        return c.group.name.toLowerCase().includes(q);
      }
      return c.participants.some(
        (p) => p.id !== user?.id && p.name.toLowerCase().includes(q)
      );
    });
  }, [conversations, search, user?.id]);

  const handleNewConversation = useCallback(() => {
    router.push('/messages/new');
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationItem
        conversation={item}
        {...(user?.id != null ? { currentUserId: user.id } : {})}
        presenceMap={presenceMap}
        {...(typingMap.has(item.id) ? { typingUsers: typingMap.get(item.id) } : {})}
        {...(recordingMap.has(item.id) ? { recordingUsers: recordingMap.get(item.id) } : {})}
      />
    ),
    [user?.id, presenceMap, typingMap, recordingMap]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$3"
          paddingVertical="$2"
        >
          <XStack alignItems="center" gap="$2">
            <Pressable onPress={() => router.back()}>
              <Text size="lg">←</Text>
            </Pressable>
            <Text weight="bold" size="xl">
              Mensagens
            </Text>
          </XStack>
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
              placeholder="Buscar conversa..."
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Conversations List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            !isLoading ? (
              <YStack
                flex={1}
                alignItems="center"
                justifyContent="center"
                padding="$6"
                gap="$2"
              >
                <Text size="2xl">💬</Text>
                <Text color="secondary" size="sm" align="center">
                  {search
                    ? 'Nenhuma conversa encontrada'
                    : 'Nenhuma conversa ainda'}
                </Text>
                {!search && (
                  <Pressable onPress={handleNewConversation}>
                    <Text color="primary" size="sm" weight="semibold">
                      Iniciar conversa
                    </Text>
                  </Pressable>
                )}
              </YStack>
            ) : null
          }
          contentContainerStyle={
            filtered.length === 0 ? styles.emptyList : undefined
          }
        />

        {/* FAB: New conversation */}
        <Pressable
          onPress={handleNewConversation}
          style={styles.fab}
        >
          <View
            width={56}
            height={56}
            borderRadius="$full"
            backgroundColor="$primary"
            alignItems="center"
            justifyContent="center"
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
          >
            <Text color="white" size="xl" weight="bold">
              +
            </Text>
          </View>
        </Pressable>
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
  emptyList: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
});
