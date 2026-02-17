import { useState, useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Gear, Bell } from '@ahub/ui/src/icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications, useUnreadCount } from '../hooks/useNotifications';
import {
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearReadNotifications,
} from '../hooks/useNotificationMutations';
import { useNotificationWebSocket } from '../hooks/useNotificationWebSocket';
import { NotificationItem } from '../components/NotificationItem';
import { CategoryFilter } from '../components/CategoryFilter';
import type { Notification, NotificationCategory } from '@ahub/shared/types';

type FilterValue = NotificationCategory | 'ALL';

function getDateSection(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  if (date >= today) return 'Hoje';
  if (date >= yesterday) return 'Ontem';
  if (date >= weekAgo) return 'Esta semana';
  return 'Anteriores';
}

export function NotificationsScreen() {
  const [filter, setFilter] = useState<FilterValue>('ALL');

  const queryParams = useMemo(
    () => ({
      category: filter === 'ALL' ? undefined : filter,
      perPage: 30,
    }),
    [filter]
  );

  const {
    data: notificationsData,
    isLoading,
    refetch,
    isRefetching,
  } = useNotifications(queryParams);
  const { data: unreadData } = useUnreadCount();

  // WebSocket for real-time updates
  useNotificationWebSocket();

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const clearRead = useClearReadNotifications();

  const notifications = notificationsData?.data ?? [];

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead.mutate(id);
    },
    [markAsRead]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteNotification.mutate(id);
    },
    [deleteNotification]
  );

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const handleClearRead = useCallback(() => {
    clearRead.mutate();
  }, [clearRead]);

  // Group notifications by date section
  const sectioned = useMemo(() => {
    const sections: { title: string; data: Notification[] }[] = [];
    const sectionMap = new Map<string, Notification[]>();

    for (const n of notifications) {
      const section = getDateSection(n.createdAt);
      if (!sectionMap.has(section)) {
        sectionMap.set(section, []);
      }
      sectionMap.get(section)!.push(n);
    }

    for (const [title, data] of sectionMap) {
      sections.push({ title, data });
    }

    return sections;
  }, [notifications]);

  const flatData = useMemo(() => {
    const items: Array<
      | { type: 'header'; title: string; key: string }
      | { type: 'notification'; notification: Notification; key: string }
    > = [];

    for (const section of sectioned) {
      items.push({
        type: 'header' as const,
        title: section.title,
        key: `header_${section.title}`,
      });
      for (const n of section.data) {
        items.push({
          type: 'notification' as const,
          notification: n,
          key: n.id,
        });
      }
    }

    return items;
  }, [sectioned]);

  const renderItem = useCallback(
    ({
      item,
    }: {
      item: (typeof flatData)[number];
    }) => {
      if (item.type === 'header') {
        return (
          <XStack
            padding="$2"
            paddingHorizontal="$3"
            backgroundColor="$background"
          >
            <Text color="secondary" size="xs" weight="bold">
              {item.title.toUpperCase()}
            </Text>
          </XStack>
        );
      }

      return (
        <NotificationItem
          notification={item.notification}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
        />
      );
    },
    [handleMarkAsRead, handleDelete]
  );

  const hasUnread = (unreadData?.total ?? 0) > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
              Notificações
            </Text>
          </XStack>

          <XStack gap="$3">
            {hasUnread && (
              <Pressable onPress={handleMarkAllRead}>
                <Text color="primary" size="xs" weight="semibold">
                  Ler todas
                </Text>
              </Pressable>
            )}
            <Pressable onPress={handleClearRead}>
              <Text color="secondary" size="xs" weight="semibold">
                Limpar
              </Text>
            </Pressable>
            <Pressable onPress={() => router.push('/notifications/settings')}>
              <Icon icon={Gear} size="lg" color="secondary" />
            </Pressable>
          </XStack>
        </XStack>

        {/* Category Filter */}
        <CategoryFilter
          selected={filter}
          onSelect={setFilter}
          unreadByCategory={unreadData?.byCategory}
        />

        {/* Notifications List */}
        <FlatList
          data={flatData}
          keyExtractor={(item) => item.key}
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
                <Icon icon={Bell} size="xl" color="muted" />
                <Text color="secondary" size="sm" align="center">
                  {filter === 'ALL'
                    ? 'Nenhuma notificação ainda'
                    : 'Nenhuma notificação nesta categoria'}
                </Text>
              </YStack>
            ) : null
          }
          contentContainerStyle={
            flatData.length === 0 ? styles.emptyList : undefined
          }
        />
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
  },
});
