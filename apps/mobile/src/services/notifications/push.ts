import { Platform, DeviceEventEmitter } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { registerDeviceToken } from '@/features/notifications/api/notifications.api';
import { NOTIFICATION_BANNER_EVENT } from '@/features/messages/components/InAppNotificationBanner';
import type { NotificationBannerData } from '@/features/messages/components/InAppNotificationBanner';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;

    // For message notifications: suppress system alert and show custom in-app banner
    if (data?.type === 'message') {
      const bannerData: NotificationBannerData = {
        conversationId: data.conversationId as string,
        title: notification.request.content.title ?? '',
        body: notification.request.content.body ?? '',
        mediaUrl: data.mediaUrl as string | undefined,
        senderName: data.senderName as string | undefined,
        groupName: data.groupName as string | undefined,
      };
      DeviceEventEmitter.emit(NOTIFICATION_BANNER_EVENT, bannerData);

      return {
        shouldShowAlert: false,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    }

    // Other notification types: default behavior
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

/**
 * Register for push notifications.
 * Requests permission, gets Expo push token, and sends it to the backend.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log('[Push] Must use physical device for push notifications');
    return null;
  }

  // Push notifications are not supported in Expo Go since SDK 53
  const isExpoGo = Constants.appOwnership === 'expo';
  if (isExpoGo) {
    console.warn('[Push] Push notifications are not supported in Expo Go. Use a development build.');
    return null;
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Permission not granted');
    return null;
  }

  // Get Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const isValidUuid = projectId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);

    if (!isValidUuid) {
      console.warn('[Push] No valid EAS projectId configured. Set it in app.json extra.eas.projectId');
    }

    const tokenData = await Notifications.getExpoPushTokenAsync(
      isValidUuid ? { projectId } : undefined
    );
    const token = tokenData.data;

    // Set up Android notification channels (required for Android 8+)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Geral',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B5CF6',
      });

      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Mensagens',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });

      await Notifications.setNotificationChannelAsync('events', {
        name: 'Eventos',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // Register token with backend
    const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
    await registerDeviceToken(token, platform);

    console.log('[Push] Registered token:', token);
    return token;
  } catch (error) {
    console.error('[Push] Error getting push token:', error);
    return null;
  }
}

/**
 * Set up notification response listener (when user taps a notification).
 * Returns a cleanup function.
 */
export function setupNotificationListeners(
  onNotificationTap?: (data: Record<string, unknown>) => void
): () => void {
  // Handle notification taps (when user interacts with notification)
  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data;
      console.log('[Push] Notification tapped:', data);
      onNotificationTap?.(data as Record<string, unknown>);
    });

  return () => {
    responseSubscription.remove();
  };
}

/**
 * Set badge count on the app icon.
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}
