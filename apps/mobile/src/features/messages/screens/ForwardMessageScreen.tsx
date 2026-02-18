import { useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Avatar, Icon, ScreenHeader } from '@ahub/ui';
import { Check, MagnifyingGlass } from '@ahub/ui/src/icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';
import { useConversations } from '../hooks/useConversations';
import { useForwardMessage } from '../hooks/useForwardMessage';
import type { Conversation } from '@ahub/shared/types';

export function ForwardMessageScreen() {
  const { messageId } = useLocalSearchParams<{ messageId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const user = useAuthStore((s) => s.user);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: conversationsData } = useConversations();
  const forwardMessage = useForwardMessage();

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

  const toggleSelection = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleForward = useCallback(() => {
    if (!messageId || selected.size === 0) return;

    forwardMessage.mutate(
      { messageId, conversationIds: Array.from(selected) },
      {
        onSuccess: () => {
          Alert.alert('Encaminhado', `Mensagem encaminhada para ${selected.size} conversa(s).`);
          router.back();
        },
        onError: () => {
          Alert.alert('Erro', 'Nao foi possivel encaminhar a mensagem.');
        },
      }
    );
  }, [messageId, selected, forwardMessage]);

  const getConversationName = useCallback(
    (conv: Conversation) => {
      if (conv.type === 'GROUP' && conv.group) return conv.group.name;
      const other = conv.participants.find((p) => p.id !== user?.id);
      return other?.name ?? 'Chat';
    },
    [user?.id]
  );

  const getConversationAvatar = useCallback(
    (conv: Conversation) => {
      if (conv.type === 'GROUP') {
        return { src: conv.group?.imageUrl, name: conv.group?.name ?? '' };
      }
      const other = conv.participants.find((p) => p.id !== user?.id);
      return { src: other?.avatarUrl, name: other?.name ?? '' };
    },
    [user?.id]
  );

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => {
      const isSelected = selected.has(item.id);
      const avatar = getConversationAvatar(item);
      const name = getConversationName(item);

      return (
        <Pressable onPress={() => toggleSelection(item.id)}>
          <XStack
            alignItems="center"
            paddingHorizontal="$3"
            paddingVertical="$2.5"
            gap="$3"
            backgroundColor={isSelected ? (isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.06)') : undefined}
          >
            <Avatar src={avatar.src} name={avatar.name} size="md" />
            <YStack flex={1}>
              <Text size="sm" weight="medium" numberOfLines={1}>
                {name}
              </Text>
              {item.type === 'GROUP' && (
                <Text size="xs" color="secondary">
                  {item.participants.length} participantes
                </Text>
              )}
            </YStack>
            <View
              width={24}
              height={24}
              borderRadius="$full"
              borderWidth={2}
              borderColor={isSelected ? '$primary' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}
              backgroundColor={isSelected ? '$primary' : 'transparent'}
              alignItems="center"
              justifyContent="center"
            >
              {isSelected && <Icon icon={Check} size={14} color="#FFFFFF" weight="bold" />}
            </View>
          </XStack>
        </Pressable>
      );
    },
    [selected, isDark, getConversationAvatar, getConversationName, toggleSelection]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <YStack flex={1} backgroundColor="$background">
        <ScreenHeader onBack={() => router.back()} borderBottom>
          <YStack flex={1}>
            <Text weight="semibold" size="sm">
              Encaminhar para
            </Text>
            {selected.size > 0 && (
              <Text color="primary" size="xs">
                {selected.size} selecionada(s)
              </Text>
            )}
          </YStack>
        </ScreenHeader>

        {/* Search */}
        <View paddingHorizontal="$3" paddingVertical="$2">
          <XStack
            borderRadius="$full"
            backgroundColor={isDark ? 'rgba(255,255,255,0.08)' : '$backgroundHover'}
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
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              style={[
                styles.searchInput,
                { color: isDark ? '#F9FAFB' : '#1F2937' },
              ]}
            />
          </XStack>
        </View>

        {/* Conversation list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        {/* Forward button */}
        {selected.size > 0 && (
          <View
            position="absolute"
            bottom={32}
            left="$4"
            right="$4"
          >
            <Pressable onPress={handleForward}>
              <View
                backgroundColor="$primary"
                borderRadius="$full"
                paddingVertical="$3"
                alignItems="center"
              >
                <Text weight="semibold" style={{ color: '#FFFFFF' }}>
                  Encaminhar ({selected.size})
                </Text>
              </View>
            </Pressable>
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
    flex: 1,
    paddingVertical: 0,
  },
});
