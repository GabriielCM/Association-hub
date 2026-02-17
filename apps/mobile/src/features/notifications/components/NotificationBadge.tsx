import { Pressable } from 'react-native';
import { View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Bell } from '@ahub/ui/src/icons';
import { router } from 'expo-router';
import { useNotificationStore } from '@/stores/notification.store';

interface NotificationBadgeProps {
  size?: number;
}

export function NotificationBadge({ size = 24 }: NotificationBadgeProps) {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const handlePress = () => {
    router.push('/notifications');
  };

  const displayCount = unreadCount > 99 ? '99+' : String(unreadCount);
  const badgeSize = unreadCount > 99 ? 22 : 18;

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View width={size} height={size} alignItems="center" justifyContent="center">
        <Icon icon={Bell} size={size} color="inherit" />

        {unreadCount > 0 && (
          <View
            position="absolute"
            top={-4}
            right={-6}
            minWidth={badgeSize}
            height={badgeSize}
            borderRadius="$full"
            backgroundColor="$error"
            alignItems="center"
            justifyContent="center"
            paddingHorizontal="$0.5"
          >
            <Text
              color="white"
              weight="bold"
              style={{ fontSize: 10, lineHeight: 12 }}
            >
              {displayCount}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
