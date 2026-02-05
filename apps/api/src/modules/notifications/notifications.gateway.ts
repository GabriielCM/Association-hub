import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { NOTIFICATION_EVENTS, UnreadCount } from './notification.types';

@WebSocketGateway({
  namespace: '/ws/notifications',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Extract userId from auth token or query
    const userId = this.extractUserId(client);
    if (userId) {
      this.registerUser(client.id, userId);
      client.join(`user:${userId}`);
      this.logger.log(`User ${userId} registered with socket ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.unregisterSocket(client.id);
  }

  // ============================================
  // BROADCAST METHODS
  // ============================================

  /**
   * Send new notification to user
   */
  broadcastNewNotification(userId: string, notification: Notification) {
    const room = `user:${userId}`;
    this.server.to(room).emit(NOTIFICATION_EVENTS.NEW, {
      id: notification.id,
      type: notification.type,
      category: notification.category,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      imageUrl: notification.imageUrl,
      actionUrl: notification.actionUrl,
      groupKey: notification.groupKey,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });
    this.logger.debug(`New notification sent to user ${userId}`);
  }

  /**
   * Notify user that notification was read
   */
  broadcastNotificationRead(userId: string, notificationId: string) {
    const room = `user:${userId}`;
    this.server.to(room).emit(NOTIFICATION_EVENTS.READ, {
      notificationId,
    });
  }

  /**
   * Notify user that notification was deleted
   */
  broadcastNotificationDeleted(userId: string, notificationId: string) {
    const room = `user:${userId}`;
    this.server.to(room).emit(NOTIFICATION_EVENTS.DELETED, {
      notificationId,
    });
  }

  /**
   * Send updated unread counts to user
   */
  broadcastUnreadCountUpdate(userId: string, counts: UnreadCount) {
    const room = `user:${userId}`;
    this.server.to(room).emit(NOTIFICATION_EVENTS.UNREAD_COUNT_UPDATE, counts);
  }

  /**
   * Notify user that settings changed
   */
  broadcastSettingsChanged(userId: string, category: string, settings: { pushEnabled: boolean; inAppEnabled: boolean }) {
    const room = `user:${userId}`;
    this.server.to(room).emit(NOTIFICATION_EVENTS.SETTINGS_CHANGED, {
      category,
      ...settings,
    });
  }

  /**
   * Broadcast notification to multiple users
   */
  broadcastToUsers(userIds: string[], event: string, data: unknown) {
    for (const userId of userIds) {
      const room = `user:${userId}`;
      this.server.to(room).emit(event, data);
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  private extractUserId(client: Socket): string | null {
    // Try to get userId from handshake auth
    const auth = client.handshake.auth;
    if (auth?.userId) {
      return auth.userId;
    }

    // Try to get from query params
    const query = client.handshake.query;
    if (query?.userId && typeof query.userId === 'string') {
      return query.userId;
    }

    // In production, you'd verify JWT token here
    // const token = auth?.token || query?.token;
    // if (token) { return verifyAndExtractUserId(token); }

    return null;
  }

  private registerUser(socketId: string, userId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  private unregisterSocket(socketId: string) {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  isUserOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return sockets !== undefined && sockets.size > 0;
  }

  getOnlineUserCount(): number {
    return this.userSockets.size;
  }
}
