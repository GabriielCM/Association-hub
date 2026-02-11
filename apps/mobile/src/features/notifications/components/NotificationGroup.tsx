import { useState, useCallback } from 'react';
import { Pressable } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import type { NotificationGroupItem, NotificationCategory } from '@ahub/shared/types';
import { NotificationItem } from './NotificationItem';

const CATEGORY_ICONS: Record<NotificationCategory, string> = {
  SOCIAL: '💬',
  EVENTS: '🎉',
  POINTS: '⭐',
  RESERVATIONS: '📅',
  SYSTEM: '🔔',
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffH < 24) return `${diffH}h`;
  if (diffD < 7) return `${diffD}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

interface NotificationGroupProps {
  group: NotificationGroupItem;
  onMarkAsRead: (id: string) => void;
  onMarkGroupAsRead: (groupKey: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationGroup({
  group,
  onMarkAsRead,
  onMarkGroupAsRead,
  onDelete,
}: NotificationGroupProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleMarkGroupRead = useCallback(() => {
    onMarkGroupAsRead(group.groupKey);
  }, [group.groupKey, onMarkGroupAsRead]);

  return (
    <YStack borderBottomWidth={1} borderBottomColor="$borderColor">
      {/* Group Header */}
      <Pressable onPress={handleToggle}>
        <XStack
          alignItems="center"
          gap="$2.5"
          padding="$3"
          backgroundColor={group.isRead ? 'transparent' : '$backgroundHover'}
        >
          {/* Icon */}
          <View
            width={40}
            height={40}
            borderRadius="$full"
            backgroundColor="$backgroundHover"
            alignItems="center"
            justifyContent="center"
          >
            <Text size="lg">{CATEGORY_ICONS[group.category]}</Text>
          </View>

          {/* Content */}
          <YStack flex={1} gap="$0.5">
            <XStack alignItems="center" gap="$1">
              <Text weight="semibold" size="sm" numberOfLines={1} flex={1}>
                {group.title}
              </Text>
              <View
                paddingHorizontal="$1"
                paddingVertical="$0.5"
                borderRadius="$full"
                backgroundColor="$primary"
              >
                <Text color="white" size="xs" weight="bold">
                  {group.count}
                </Text>
              </View>
            </XStack>
            <Text color="secondary" size="xs" numberOfLines={1}>
              {group.body}
            </Text>
            <Text color="secondary" size="xs">
              {formatTimeAgo(group.latestAt)}
            </Text>
          </YStack>

          {/* Expand indicator */}
          <Text color="secondary" size="sm">
            {expanded ? '▲' : '▼'}
          </Text>
        </XStack>
      </Pressable>

      {/* Expanded notifications */}
      {expanded && (
        <YStack paddingLeft="$4">
          {!group.isRead && (
            <Pressable onPress={handleMarkGroupRead}>
              <XStack padding="$2" justifyContent="flex-end">
                <Text color="primary" size="xs" weight="semibold">
                  Marcar grupo como lido
                </Text>
              </XStack>
            </Pressable>
          )}
          {group.notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
            />
          ))}
        </YStack>
      )}
    </YStack>
  );
}
