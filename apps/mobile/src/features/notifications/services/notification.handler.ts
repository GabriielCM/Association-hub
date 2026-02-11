import { router } from 'expo-router';
import type { NotificationResponse } from 'expo-notifications';

const DEEP_LINK_MAP: Record<string, string> = {
  NEW_LIKE: '/posts',
  NEW_COMMENT: '/posts',
  NEW_EVENT: '/events',
  NEW_MESSAGE: '/messages',
  BADGE_EARNED: '/profile/badges',
  POINTS_RECEIVED: '/wallet',
  TRANSFER_RECEIVED: '/wallet',
  RESERVATION_APPROVED: '/reservations',
};

export function handleNotificationResponse(response: NotificationResponse) {
  const data = response.notification.request.content.data;

  if (!data) return;

  const actionUrl = data.actionUrl as string | undefined;
  const type = data.type as string | undefined;

  if (actionUrl) {
    router.push(actionUrl as never);
    return;
  }

  if (type && DEEP_LINK_MAP[type]) {
    const baseRoute = DEEP_LINK_MAP[type];
    const id = data.entityId as string | undefined;

    if (id) {
      router.push(`${baseRoute}/${id}` as never);
    } else {
      router.push(baseRoute as never);
    }
  }
}
