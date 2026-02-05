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
import { Message } from '@prisma/client';
import { MESSAGE_EVENTS, PresenceUpdate, MessageWithSender } from './message.types';

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
  private userSockets: Map<string, Set<string>> = new Map();
  private socketUsers: Map<string, string> = new Map();
  private typingUsers: Map<string, Map<string, NodeJS.Timeout>> = new Map(); // conversationId -> userId -> timeout

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    const userId = this.extractUserId(client);
    if (userId) {
      this.registerUser(client.id, userId);
      client.join(`user:${userId}`);
      this.logger.log(`User ${userId} registered with socket ${client.id}`);

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
        this.broadcastPresenceUpdate(userId, false);
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

    // Broadcast typing update
    this.broadcastTypingUpdate(conversationId, userId, true);
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
  broadcastNewMessage(conversationId: string, message: Message, senderName: string) {
    const room = `conversation:${conversationId}`;
    this.server.to(room).emit(MESSAGE_EVENTS.MESSAGE_NEW, {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderName,
      content: message.content,
      contentType: message.contentType,
      mediaUrl: message.mediaUrl,
      replyToId: message.replyToId,
      status: message.status,
      createdAt: message.createdAt,
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
   * Broadcast typing indicator
   */
  broadcastTypingUpdate(conversationId: string, userId: string, isTyping: boolean) {
    const room = `conversation:${conversationId}`;
    this.server.to(room).emit(MESSAGE_EVENTS.TYPING_UPDATE, {
      conversationId,
      userId,
      isTyping,
    });
  }

  /**
   * Broadcast user presence (online/offline)
   */
  broadcastPresenceUpdate(userId: string, isOnline: boolean) {
    // Broadcast to all users (or you could limit to user's contacts)
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
      this.broadcastTypingUpdate(conversationId, userId, false);
    }
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
