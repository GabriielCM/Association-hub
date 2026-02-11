import { useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack, YStack, View } from 'tamagui';
import { Text, Avatar } from '@ahub/ui';
import { router } from 'expo-router';
import { DeviceEventEmitter } from 'react-native';

export const NOTIFICATION_BANNER_EVENT = 'messages:notification-banner';

export interface NotificationBannerData {
  conversationId: string;
  title: string;
  body: string;
  mediaUrl?: string;
  senderName?: string;
  groupName?: string;
}

const AUTO_DISMISS_MS = 4000;

export function InAppNotificationBanner() {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-200)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef<NotificationBannerData | null>(null);
  const visibleRef = useRef(false);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    visibleRef.current = false;
    Animated.timing(translateY, {
      toValue: -200,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const show = useCallback(
    (data: NotificationBannerData) => {
      dataRef.current = data;
      visibleRef.current = true;

      // Slide in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();

      // Auto-dismiss
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    },
    [translateY, dismiss]
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      NOTIFICATION_BANNER_EVENT,
      (data: NotificationBannerData) => {
        show(data);
      }
    );
    return () => {
      subscription.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show]);

  const handlePress = useCallback(() => {
    const data = dataRef.current;
    if (!data) return;
    dismiss();
    router.push({
      pathname: '/messages/[conversationId]',
      params: { conversationId: data.conversationId },
    } as never);
  }, [dismiss]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          paddingTop: insets.top + 4,
        },
      ]}
      pointerEvents="box-none"
    >
      <Pressable onPress={handlePress} style={styles.pressable}>
        <XStack
          alignItems="center"
          gap="$2.5"
          padding="$2.5"
          backgroundColor="$background"
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$borderColor"
          shadowColor="black"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.15}
          shadowRadius={8}
          elevation={5}
        >
          {/* Avatar / Group icon */}
          <View
            width={40}
            height={40}
            borderRadius="$full"
            backgroundColor="$primary"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" weight="bold" size="sm">
              {(dataRef.current?.groupName ?? dataRef.current?.senderName ?? '?').charAt(0)}
            </Text>
          </View>

          {/* Text content */}
          <YStack flex={1} gap="$0.5">
            <Text weight="bold" size="sm" numberOfLines={1}>
              {dataRef.current?.title ?? ''}
            </Text>
            <Text color="secondary" size="xs" numberOfLines={1}>
              {dataRef.current?.body ?? ''}
            </Text>
          </YStack>

          {/* Image thumbnail for photo messages */}
          {dataRef.current?.mediaUrl && (
            <Image
              source={{ uri: dataRef.current.mediaUrl }}
              style={styles.thumbnail}
            />
          )}
        </XStack>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 12,
  },
  pressable: {
    width: '100%',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
});
