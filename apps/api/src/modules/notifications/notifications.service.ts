import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  NotificationCategory,
  NotificationType,
  Notification,
  NotificationSettings,
  DoNotDisturbSettings,
  DevicePlatform,
} from '@prisma/client';
import {
  NotificationPayload,
  BatchNotificationPayload,
  UnreadCount,
  NotificationGroup,
  CATEGORY_TYPES,
} from './notification.types';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { UpdateNotificationSettingsDto } from './dto/update-settings.dto';
import { UpdateDoNotDisturbDto } from './dto/update-dnd.dto';

const MAX_NOTIFICATIONS_PER_USER = 500;
const BATCH_WINDOW_HOURS = 1;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // NOTIFICATION CRUD
  // ============================================

  async create(payload: NotificationPayload): Promise<Notification | null> {
    const { userId, type, category, title, body, data, imageUrl, actionUrl, groupKey } = payload;

    // Check user settings
    const settings = await this.getOrCreateSettings(userId, category);
    if (!settings.inAppEnabled) {
      this.logger.debug(`In-app notifications disabled for user ${userId} category ${category}`);
      return null;
    }

    // Create notification
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        category,
        title,
        body,
        data: data as object | undefined,
        imageUrl,
        actionUrl,
        groupKey,
      },
    });

    // Cleanup old notifications if over limit
    await this.cleanupOldNotifications(userId);

    return notification;
  }

  async createBatch(payload: BatchNotificationPayload): Promise<number> {
    const { userIds, type, category, title, body, data, imageUrl, actionUrl, groupKey } = payload;

    // Get settings for all users
    const settingsMap = await this.getBatchSettings(userIds, category);

    // Filter users with in-app enabled
    const eligibleUserIds = userIds.filter(
      (id) => settingsMap.get(id)?.inAppEnabled !== false
    );

    if (eligibleUserIds.length === 0) {
      return 0;
    }

    // Create notifications in batch
    const result = await this.prisma.notification.createMany({
      data: eligibleUserIds.map((userId) => ({
        userId,
        type,
        category,
        title,
        body,
        data: data as object | undefined,
        imageUrl,
        actionUrl,
        groupKey,
      })),
    });

    // Cleanup for each user (async, non-blocking)
    Promise.all(eligibleUserIds.map((id) => this.cleanupOldNotifications(id))).catch(
      (err) => this.logger.error('Cleanup error:', err)
    );

    return result.count;
  }

  async findAll(
    userId: string,
    query: NotificationQueryDto
  ): Promise<{ notifications: Notification[]; total: number; hasMore: boolean }> {
    const { category, unreadOnly, grouped, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(category && { category }),
      ...(unreadOnly && { isRead: false }),
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      hasMore: skip + notifications.length < total,
    };
  }

  async findGrouped(
    userId: string,
    query: NotificationQueryDto
  ): Promise<{ groups: NotificationGroup[]; total: number }> {
    const { category, unreadOnly } = query;

    const where = {
      userId,
      groupKey: { not: null },
      ...(category && { category }),
      ...(unreadOnly && { isRead: false }),
    };

    // Group by groupKey
    const grouped = await this.prisma.notification.groupBy({
      by: ['groupKey', 'category'],
      where,
      _count: true,
      _max: { createdAt: true },
    });

    // Get details for each group (filter out null groupKeys)
    const validGroups = grouped.filter((g) => g.groupKey !== null);
    const groups: NotificationGroup[] = await Promise.all(
      validGroups.map(async (g) => {
        const notifications = await this.prisma.notification.findMany({
          where: { userId, groupKey: g.groupKey },
          orderBy: { createdAt: 'desc' },
          take: 1,
        });

        const allIds = await this.prisma.notification.findMany({
          where: { userId, groupKey: g.groupKey },
          select: { id: true, isRead: true },
        });

        const latest = notifications[0];
        return {
          groupKey: g.groupKey!,
          category: g.category as NotificationCategory,
          title: latest?.title || '',
          body: latest?.body || '',
          count: g._count,
          latestAt: g._max.createdAt!,
          isRead: allIds.every((n) => n.isRead),
          notificationIds: allIds.map((n) => n.id),
        };
      })
    );

    return { groups, total: groups.length };
  }

  async findOne(userId: string, id: string): Promise<Notification> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return notification;
  }

  async markAsRead(userId: string, id: string): Promise<Notification> {
    const notification = await this.findOne(userId, id);

    if (notification.isRead) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return result.count;
  }

  async markCategoryAsRead(userId: string, category: NotificationCategory): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, category, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return result.count;
  }

  async markGroupAsRead(userId: string, groupKey: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, groupKey, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return result.count;
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);
    await this.prisma.notification.delete({ where: { id } });
  }

  async clearRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });

    return result.count;
  }

  // ============================================
  // UNREAD COUNT
  // ============================================

  async getUnreadCount(userId: string): Promise<UnreadCount> {
    const counts = await this.prisma.notification.groupBy({
      by: ['category'],
      where: { userId, isRead: false },
      _count: true,
    });

    const byCategory = Object.values(NotificationCategory).reduce(
      (acc, cat) => {
        acc[cat] = 0;
        return acc;
      },
      {} as Record<NotificationCategory, number>
    );

    let total = 0;
    for (const c of counts) {
      byCategory[c.category] = c._count;
      total += c._count;
    }

    return { total, byCategory };
  }

  // ============================================
  // SETTINGS
  // ============================================

  async getAllSettings(userId: string): Promise<NotificationSettings[]> {
    // Ensure settings exist for all categories
    await this.ensureAllSettings(userId);

    return this.prisma.notificationSettings.findMany({
      where: { userId },
      orderBy: { category: 'asc' },
    });
  }

  async getSettings(userId: string, category: NotificationCategory): Promise<NotificationSettings> {
    return this.getOrCreateSettings(userId, category);
  }

  async updateSettings(
    userId: string,
    category: NotificationCategory,
    dto: UpdateNotificationSettingsDto
  ): Promise<NotificationSettings> {
    const settings = await this.getOrCreateSettings(userId, category);

    return this.prisma.notificationSettings.update({
      where: { id: settings.id },
      data: {
        ...(dto.pushEnabled !== undefined && { pushEnabled: dto.pushEnabled }),
        ...(dto.inAppEnabled !== undefined && { inAppEnabled: dto.inAppEnabled }),
      },
    });
  }

  private async getOrCreateSettings(
    userId: string,
    category: NotificationCategory
  ): Promise<NotificationSettings> {
    let settings = await this.prisma.notificationSettings.findUnique({
      where: { userId_category: { userId, category } },
    });

    if (!settings) {
      settings = await this.prisma.notificationSettings.create({
        data: { userId, category, pushEnabled: true, inAppEnabled: true },
      });
    }

    return settings;
  }

  private async ensureAllSettings(userId: string): Promise<void> {
    const existing = await this.prisma.notificationSettings.findMany({
      where: { userId },
      select: { category: true },
    });

    const existingCategories = new Set(existing.map((s) => s.category));
    const missing = Object.values(NotificationCategory).filter(
      (cat) => !existingCategories.has(cat)
    );

    if (missing.length > 0) {
      await this.prisma.notificationSettings.createMany({
        data: missing.map((category) => ({
          userId,
          category,
          pushEnabled: true,
          inAppEnabled: true,
        })),
      });
    }
  }

  private async getBatchSettings(
    userIds: string[],
    category: NotificationCategory
  ): Promise<Map<string, NotificationSettings>> {
    const settings = await this.prisma.notificationSettings.findMany({
      where: { userId: { in: userIds }, category },
    });

    const map = new Map<string, NotificationSettings>();
    for (const s of settings) {
      map.set(s.userId, s);
    }

    return map;
  }

  // ============================================
  // DO NOT DISTURB
  // ============================================

  async getDndSettings(userId: string): Promise<DoNotDisturbSettings> {
    let settings = await this.prisma.doNotDisturbSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.doNotDisturbSettings.create({
        data: { userId, enabled: false, daysOfWeek: [] },
      });
    }

    return settings;
  }

  async updateDndSettings(
    userId: string,
    dto: UpdateDoNotDisturbDto
  ): Promise<DoNotDisturbSettings> {
    const existing = await this.getDndSettings(userId);

    return this.prisma.doNotDisturbSettings.update({
      where: { id: existing.id },
      data: {
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
        ...(dto.startTime !== undefined && { startTime: dto.startTime }),
        ...(dto.endTime !== undefined && { endTime: dto.endTime }),
        ...(dto.daysOfWeek !== undefined && { daysOfWeek: dto.daysOfWeek }),
      },
    });
  }

  async isDndActive(userId: string): Promise<boolean> {
    const settings = await this.getDndSettings(userId);

    if (!settings.enabled) {
      return false;
    }

    if (!settings.startTime || !settings.endTime) {
      return false;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Check if current day is in DND days
    if (settings.daysOfWeek.length > 0 && !settings.daysOfWeek.includes(currentDay)) {
      return false;
    }

    // Check time range (handles overnight ranges like 22:00-07:00)
    const { startTime, endTime } = settings;
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // ============================================
  // DEVICE TOKENS (Push Notifications)
  // ============================================

  async registerDeviceToken(
    userId: string,
    token: string,
    platform: DevicePlatform,
  ): Promise<void> {
    // Upsert: if token exists, update the userId and reactivate
    await this.prisma.deviceToken.upsert({
      where: { token },
      update: { userId, platform, isActive: true },
      create: { userId, token, platform },
    });

    this.logger.debug(`Device token registered for user ${userId}: ${token.substring(0, 20)}...`);
  }

  async removeDeviceToken(userId: string, token: string): Promise<void> {
    await this.prisma.deviceToken.updateMany({
      where: { token, userId },
      data: { isActive: false },
    });
  }

  /**
   * Send push notification to a user via Expo Push API.
   * Only sends to active device tokens where push is enabled for the MESSAGES category.
   */
  async sendPushToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    // Check DND
    const isDnd = await this.isDndActive(userId);
    if (isDnd) {
      this.logger.debug(`Push skipped for user ${userId}: DND active`);
      return;
    }

    // Check push settings for SOCIAL category (covers messages)
    const settings = await this.getOrCreateSettings(userId, NotificationCategory.SOCIAL);
    if (!settings.pushEnabled) {
      this.logger.debug(`Push disabled for user ${userId} category SOCIAL`);
      return;
    }

    // Get active device tokens
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId, isActive: true },
    });

    if (tokens.length === 0) {
      this.logger.debug(`No active tokens for user ${userId}`);
      return;
    }

    // Send via Expo Push API
    const messages = tokens.map((t) => ({
      to: t.token,
      title,
      body,
      data,
      sound: 'default' as const,
      priority: 'high' as const,
      channelId: 'messages',
    }));

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        this.logger.error(`Expo Push API error: ${response.status} ${response.statusText}`);
        return;
      }

      const result = await response.json();
      this.logger.debug(`Push sent to user ${userId}: ${tokens.length} device(s)`);

      // Deactivate invalid tokens based on response
      if (result.data) {
        for (let i = 0; i < result.data.length; i++) {
          const ticket = result.data[i];
          if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
            await this.prisma.deviceToken.updateMany({
              where: { token: tokens[i].token },
              data: { isActive: false },
            });
            this.logger.debug(`Deactivated invalid token: ${tokens[i].token.substring(0, 20)}...`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to send push to user ${userId}:`, error);
    }
  }

  /**
   * Send push notification to multiple users.
   */
  async sendPushToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    await Promise.allSettled(
      userIds.map((userId) => this.sendPushToUser(userId, title, body, data)),
    );
  }

  // ============================================
  // HELPERS
  // ============================================

  private async cleanupOldNotifications(userId: string): Promise<void> {
    const count = await this.prisma.notification.count({ where: { userId } });

    if (count <= MAX_NOTIFICATIONS_PER_USER) {
      return;
    }

    const toDelete = count - MAX_NOTIFICATIONS_PER_USER;

    // Get oldest notifications to delete
    const oldestIds = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: toDelete,
      select: { id: true },
    });

    await this.prisma.notification.deleteMany({
      where: { id: { in: oldestIds.map((n) => n.id) } },
    });

    this.logger.debug(`Cleaned up ${toDelete} old notifications for user ${userId}`);
  }

  getCategoryTypes(category: NotificationCategory): NotificationType[] {
    return CATEGORY_TYPES[category] || [];
  }
}
