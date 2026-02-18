import { useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { ChatCircle, MagnifyingGlass, Plus } from '@ahub/ui/src/icons';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@ahub/ui/themes';
import { useConversations } from '../hooks/useConversations';
import { usePresence } from '../hooks/usePresence';
import { ConversationItem } from '../components/ConversationItem';
import { ConversationFilters, type ConversationFilter } from '../components/ConversationFilters';
import type { Conversation } from '@ahub/shared/types';

export function ConversationsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>('all');
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
    let result = conversations;

    // Apply filter
    if (activeFilter === 'unread') {
      result = result.filter((c) => c.unreadCount > 0);
    } else if (activeFilter === 'groups') {
      result = result.filter((c) => c.type === 'GROUP');
    } else if (activeFilter === 'direct') {
      result = result.filter((c) => c.type === 'DIRECT');
    }

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => {
        if (c.type === 'GROUP' && c.group) {
          return c.group.name.toLowerCase().includes(q);
        }
        return c.participants.some(
          (p) => p.id !== user?.id && p.name.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [conversations, search, user?.id, activeFilter]);

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
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0D0520' : colors.background }]} edges={['top']}>
      <YStack flex={1} backgroundColor={isDark ? '#0D0520' : '$background'}>
        {/* Header - Telegram style large title */}
        <YStack paddingHorizontal="$3" paddingTop="$2" paddingBottom="$1">
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$2">
              <Pressable onPress={() => router.back()}>
                <Text size="lg" {...(isDark ? { style: { color: '#FFFFFF' } } : {})}>&#8592;</Text>
              </Pressable>
              <Text weight="bold" size="xl" {...(isDark ? { style: { color: '#FFFFFF' } } : {})}>
                Mensagens
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* Search */}
        <View paddingHorizontal="$3" paddingBottom="$1.5">
          <XStack
            borderRadius="$full"
            backgroundColor={isDark ? 'rgba(255,255,255,0.07)' : '$backgroundHover'}
            paddingHorizontal="$3"
            paddingVertical="$1.5"
            alignItems="center"
            gap="$1.5"
          >
            <Icon icon={MagnifyingGlass} size="sm" color="secondary" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar conversa..."
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF'}
              style={[
                styles.searchInput,
                { color: isDark ? '#F9FAFB' : '#1F2937' },
              ]}
            />
          </XStack>
        </View>

        {/* Filter chips */}
        <ConversationFilters
          active={activeFilter}
          onFilterChange={setActiveFilter}
        />

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
                <Icon icon={ChatCircle} size="xl" color="muted" weight="duotone" />
                <Text color="secondary" size="sm" align="center">
                  {search || activeFilter !== 'all'
                    ? 'Nenhuma conversa encontrada'
                    : 'Nenhuma conversa ainda'}
                </Text>
                {!search && activeFilter === 'all' && (
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
            filtered.length === 0
              ? [styles.emptyList, { paddingBottom: 80 + insets.bottom }]
              : { paddingBottom: 80 + insets.bottom }
          }
          maxToRenderPerBatch={15}
          windowSize={11}
          removeClippedSubviews={Platform.OS === 'android'}
        />

        {/* FAB: New conversation */}
        <Pressable
          onPress={handleNewConversation}
          style={[styles.fab, { bottom: 24 + insets.bottom }]}
        >
          <View
            width={56}
            height={56}
            borderRadius="$full"
            backgroundColor={isDark ? '#06B6D4' : '$primary'}
            alignItems="center"
            justifyContent="center"
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
          >
            <Icon icon={Plus} size="lg" color="#FFFFFF" weight="bold" />
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
    flex: 1,
    paddingVertical: 0,
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
