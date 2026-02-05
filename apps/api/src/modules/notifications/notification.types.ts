import {
  NotificationCategory,
  NotificationType,
} from '@prisma/client';

export { NotificationCategory, NotificationType };

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
  actionUrl?: string;
  groupKey?: string;
}

export interface BatchNotificationPayload {
  userIds: string[];
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
  actionUrl?: string;
  groupKey?: string;
}

export interface UnreadCount {
  total: number;
  byCategory: Record<NotificationCategory, number>;
}

export interface NotificationGroup {
  groupKey: string;
  category: NotificationCategory;
  title: string;
  body: string;
  count: number;
  latestAt: Date;
  isRead: boolean;
  notificationIds: string[];
}

// WebSocket events
export const NOTIFICATION_EVENTS = {
  NEW: 'notification.new',
  READ: 'notification.read',
  DELETED: 'notification.deleted',
  UNREAD_COUNT_UPDATE: 'unread_count.update',
  SETTINGS_CHANGED: 'settings.changed',
} as const;

// Category to types mapping
export const CATEGORY_TYPES: Record<NotificationCategory, NotificationType[]> = {
  SOCIAL: [
    NotificationType.NEW_LIKE,
    NotificationType.NEW_COMMENT,
    NotificationType.COMMENT_REPLY,
    NotificationType.MENTION,
    NotificationType.NEW_FOLLOWER,
    NotificationType.STORY_VIEW,
    NotificationType.POLL_ENDED,
  ],
  EVENTS: [
    NotificationType.NEW_EVENT,
    NotificationType.EVENT_REMINDER_1DAY,
    NotificationType.EVENT_REMINDER_1HOUR,
    NotificationType.EVENT_STARTED,
    NotificationType.CHECKIN_REMINDER,
    NotificationType.BADGE_EARNED,
    NotificationType.EVENT_CANCELLED,
    NotificationType.EVENT_UPDATED,
    NotificationType.CHECKIN_PROGRESS,
  ],
  POINTS: [
    NotificationType.POINTS_RECEIVED,
    NotificationType.POINTS_SPENT,
    NotificationType.RANKING_UP,
    NotificationType.TRANSFER_RECEIVED,
    NotificationType.STRAVA_SYNC,
  ],
  RESERVATIONS: [
    NotificationType.RESERVATION_APPROVED,
    NotificationType.RESERVATION_REJECTED,
    NotificationType.RESERVATION_REMINDER,
    NotificationType.WAITLIST_AVAILABLE,
  ],
  SYSTEM: [
    NotificationType.NEW_MESSAGE,
    NotificationType.NEW_BENEFIT,
    NotificationType.CARD_BLOCKED,
    NotificationType.CARD_UNBLOCKED,
    NotificationType.ADMIN_ANNOUNCEMENT,
  ],
};
