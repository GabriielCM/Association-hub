import { useCallback } from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import { Swipeable } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import type { Notification, NotificationCategory } from '@ahub/shared/types';

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
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD < 7) return `${diffD}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const handlePress = useCallback(() => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl as never);
    }
  }, [notification, onMarkAsRead]);

  const renderRightActions = useCallback(
    (
      _progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>
    ) => {
      const opacity = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View style={[styles.swipeAction, styles.deleteAction, { opacity }]}>
          <Pressable onPress={() => onDelete(notification.id)} style={styles.swipeBtn}>
            <Text color="white" size="xs" weight="semibold">
              Excluir
            </Text>
          </Pressable>
        </Animated.View>
      );
    },
    [notification.id, onDelete]
  );

  const renderLeftActions = useCallback(
    (
      _progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>
    ) => {
      if (notification.isRead) return null;

      const opacity = dragX.interpolate({
        inputRange: [0, 80],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View style={[styles.swipeAction, styles.readAction, { opacity }]}>
          <Pressable onPress={() => onMarkAsRead(notification.id)} style={styles.swipeBtn}>
            <Text color="white" size="xs" weight="semibold">
              Lida
            </Text>
          </Pressable>
        </Animated.View>
      );
    },
    [notification, onMarkAsRead]
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootRight={false}
      overshootLeft={false}
    >
      <Pressable onPress={handlePress}>
        <XStack
          alignItems="flex-start"
          gap="$2.5"
          padding="$3"
          backgroundColor={notification.isRead ? 'transparent' : '$backgroundHover'}
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          {/* Category Icon */}
          <View
            width={40}
            height={40}
            borderRadius="$full"
            backgroundColor="$backgroundHover"
            alignItems="center"
            justifyContent="center"
          >
            <Text size="lg">{CATEGORY_ICONS[notification.category]}</Text>
          </View>

          {/* Content */}
          <YStack flex={1} gap="$0.5">
            <Text weight="semibold" size="sm" numberOfLines={1}>
              {notification.title}
            </Text>
            <Text color="secondary" size="xs" numberOfLines={2}>
              {notification.body}
            </Text>
            <Text color="secondary" size="xs">
              {formatTimeAgo(notification.createdAt)}
            </Text>
          </YStack>

          {/* Unread dot */}
          {!notification.isRead && (
            <View
              width={8}
              height={8}
              borderRadius="$full"
              backgroundColor="$primary"
              marginTop="$1"
            />
          )}
        </XStack>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteAction: {
    backgroundColor: '#EF4444',
  },
  readAction: {
    backgroundColor: '#8B5CF6',
  },
  swipeBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
