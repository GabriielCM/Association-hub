import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MESSAGE_EVENTS, PresenceUpdate, MessageWithSender } from './message.types';
import { MessagesService } from './messages.service';

interface TypingPayload {
  conversationId: string;
}

interface JoinConversationPayload {
  conversationId: string;
}

@WebSocketGateway({
  namespace: '/ws/messages',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(private readonly messagesService: MessagesService) {}
  private userSockets: Map<string, Set<string>> = new Map();
  private socketUsers: Map<string, string> = new Map();
  private userNames: Map<string, string> = new Map();
  private typingUsers: Map<string, Map<string, NodeJS.Timeout>> = new Map(); // conversationId -> userId -> timeout
  private disconnectTimers: Map<string, NodeJS.Timeout> = new Map();

  private static readonly DISCONNECT_GRACE_PERIOD = 15_000; // 15 seconds

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    const userId = this.extractUserId(client);
    if (userId) {
      // Cancel pending disconnect timer (user reconnected within grace period)
      const pendingTimer = this.disconnectTimers.get(userId);
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        this.disconnectTimers.delete(userId);
        this.logger.debug(`Cancelled disconnect timer for user ${userId} (reconnected)`);
      }

      this.registerUser(client.id, userId);
      client.join(`user:${userId}`);

      // Store userName from auth
      const userName = client.handshake.auth?.userName;
      if (userName) {
        this.userNames.set(userId, userName);
      }

      this.logger.log(`User ${userId} registered with socket ${client.id}`);

      // Auto-join all conversation rooms so user receives typing/message events globally
      this.messagesService.getUserConversationIds(userId).then((conversationIds) => {
        for (const convId of conversationIds) {
          client.join(`conversation:${convId}`);
        }
        this.logger.debug(`User ${userId} auto-joined ${conversationIds.length} conversation rooms`);
      }).catch((err: Error) => {
        this.logger.error(`Failed to auto-join rooms for user ${userId}: ${err.message}`);
      });

      // Broadcast presence update
      this.broadcastPresenceUpdate(userId, true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const userId = this.socketUsers.get(client.id);
    if (userId) {
      this.unregisterSocket(client.id);

      // Check if user still has active connections
      if (!this.isUserOnline(userId)) {
        // Grace period: wait before broadcasting offline
        const existing = this.disconnectTimers.get(userId);
        if (existing) clearTimeout(existing);

        this.disconnectTimers.set(userId, setTimeout(() => {
          this.disconnectTimers.delete(userId);
          if (!this.isUserOnline(userId)) {
            this.broadcastPresenceUpdate(userId, false);
            this.userNames.delete(userId);
          }
        }, MessagesGateway.DISCONNECT_GRACE_PERIOD));
      }
    }
  }

  // ============================================
  // CLIENT -> SERVER EVENTS
  // ============================================

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinConversationPayload
  ) {
    const room = `conversation:${payload.conversationId}`;
    client.join(room);
    this.logger.debug(`Client ${client.id} joined ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinConversationPayload
  ) {
    const room = `conversation:${payload.conversationId}`;
    client.leave(room);
    this.logger.debug(`Client ${client.id} left ${room}`);
    return { success: true };
  }

  @SubscribeMessage(MESSAGE_EVENTS.TYPING_START)
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) return;

    const { conversationId } = payload;

    // Set typing timeout (auto-stop after 5 seconds)
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Map());
    }

    const conversationTyping = this.typingUsers.get(conversationId)!;

    // Clear existing timeout
    if (conversationTyping.has(userId)) {
      clearTimeout(conversationTyping.get(userId)!);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.stopTyping(conversationId, userId);
    }, 5000);

    conversationTyping.set(userId, timeout);

    // Broadcast typing update (excluding the sender)
    const userName = this.userNames.get(userId) ?? '';
    this.broadcastTypingUpdate(conversationId, userId, userName, true, this.getUserSocketIds(userId));
  }

  @SubscribeMessage(MESSAGE_EVENTS.TYPING_STOP)
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) return;

    this.stopTyping(payload.conversationId, userId);
  }

  @SubscribeMessage(MESSAGE_EVENTS.MARK_READ)
  handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; messageId: string }
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) return;

    // Broadcast read receipt
    this.broadcastMessageRead(payload.conversationId, payload.messageId, userId);
  }

  // ============================================
  // SERVER -> CLIENT BROADCASTS
  // ============================================

  /**
   * Broadcast new message to conversation participants
   */
  broadcastNewMessage(conversationId: string, message: MessageWithSender) {
    const room = `conversation:${conversationId}`;
    this.server.to(room).emit(MESSAGE_EVENTS.MESSAGE_NEW, {
      conversationId,
      message,
    });
    this.logger.debug(`New message broadcast to ${room}`);
  }

  /**
   * Broadcast message delivered status
   */
  broadcastMessageDelivered(conversationId: string, messageId: string, userId: string) {
    const room = `conversation:${conversationId}`;
    this.server.to(room).emit(MESSAGE_EVENTS.MESSAGE_DELIVERED, {
      messageId,
      deliveredTo: userId,
      deliveredAt: new Date(),
    });
  }

  /**
   * Broadcast message read status
   */
  broadcastMessageRead(conversationId: string, messageId: string, userId: string) {
    const room = `conversation:${conversationId}`;
    this.server.to(room).emit(MESSAGE_EVENTS.MESSAGE_READ, {
      messageId,
      readBy: userId,
      readAt: new Date(),
    });
  }

  /**
   * Broadcast message deleted
   */
  broadcastMessageDeleted(conversationId: string, messageId: string) {
    const room = `conversation:${conversationId}`;
    this.server.to(room).emit(MESSAGE_EVENTS.MESSAGE_DELETED, {
      messageId,
      deletedAt: new Date(),
    });
  }

  /**
   * Broadcast reaction update
   */
  broadcastReactionUpdate(
    conversationId: string,
    messageId: string,
    userId: string,
    emoji: string,
    added: boolean
  ) {
    const room = `conversation:${conversationId}`;
    this.server.to(room).emit(MESSAGE_EVENTS.MESSAGE_REACTION, {
      messageId,
      userId,
      emoji,
      added,
    });
  }

  /**
   * Broadcast typing indicator (excluding the sender's sockets)
   */
  broadcastTypingUpdate(
    conversationId: string,
    userId: string,
    userName: string,
    isTyping: boolean,
    excludeSocketIds?: Set<string>,
  ) {
    const room = `conversation:${conversationId}`;
    const payload = {
      conversationId,
      user: { id: userId, name: userName },
      isTyping,
    };

    if (excludeSocketIds && excludeSocketIds.size > 0) {
      this.server.to(room).except([...excludeSocketIds]).emit(MESSAGE_EVENTS.TYPING_UPDATE, payload);
    } else {
      this.server.to(room).emit(MESSAGE_EVENTS.TYPING_UPDATE, payload);
    }
  }

  /**
   * Broadcast user presence (online/offline)
   */
  broadcastPresenceUpdate(userId: string, isOnline: boolean) {
    this.server.emit(MESSAGE_EVENTS.PRESENCE_UPDATE, {
      userId,
      isOnline,
      lastSeenAt: isOnline ? undefined : new Date(),
    } as PresenceUpdate);
  }

  /**
   * Broadcast conversation update (e.g., new participant, settings change)
   */
  broadcastConversationUpdate(conversationId: string, update: any) {
    const room = `conversation:${conversationId}`;
    this.server.to(room).emit(MESSAGE_EVENTS.CONVERSATION_UPDATE, {
      conversationId,
      ...update,
    });
  }

  /**
   * Send to specific user
   */
  sendToUser(userId: string, event: string, data: unknown) {
    const room = `user:${userId}`;
    this.server.to(room).emit(event, data);
  }

  /**
   * Send to multiple users
   */
  sendToUsers(userIds: string[], event: string, data: unknown) {
    for (const userId of userIds) {
      this.sendToUser(userId, event, data);
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  private extractUserId(client: Socket): string | null {
    const auth = client.handshake.auth;
    if (auth?.userId) {
      return auth.userId;
    }

    const query = client.handshake.query;
    if (query?.userId && typeof query.userId === 'string') {
      return query.userId;
    }

    return null;
  }

  private registerUser(socketId: string, userId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
    this.socketUsers.set(socketId, userId);
  }

  private unregisterSocket(socketId: string) {
    const userId = this.socketUsers.get(socketId);
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
    this.socketUsers.delete(socketId);
  }

  private stopTyping(conversationId: string, userId: string) {
    const conversationTyping = this.typingUsers.get(conversationId);
    if (conversationTyping?.has(userId)) {
      clearTimeout(conversationTyping.get(userId)!);
      conversationTyping.delete(userId);
      const userName = this.userNames.get(userId) ?? '';
      this.broadcastTypingUpdate(conversationId, userId, userName, false, this.getUserSocketIds(userId));
    }
  }

  private getUserSocketIds(userId: string): Set<string> | undefined {
    return this.userSockets.get(userId);
  }

  isUserOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return sockets !== undefined && sockets.size > 0;
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }

  getTypingUsers(conversationId: string): string[] {
    const conversationTyping = this.typingUsers.get(conversationId);
    if (!conversationTyping) return [];
    return Array.from(conversationTyping.keys());
  }
}
