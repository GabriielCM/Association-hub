import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export const DASHBOARD_EVENTS = {
  FEED_POST_NEW: 'feed.post_new',
  FEED_POST_LIKED: 'feed.post_liked',
  FEED_POST_DELETED: 'feed.post_deleted',
  STORY_NEW: 'story.new',
  POLL_VOTE_UPDATE: 'poll.vote_update',
} as const;

@WebSocketGateway({
  namespace: '/ws/dashboard',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DashboardGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    const userId = this.extractUserId(client);
    const associationId = this.extractAssociationId(client);

    if (userId) {
      this.registerUser(client.id, userId);
      client.join(`user:${userId}`);
      this.logger.log(`User ${userId} registered with socket ${client.id}`);
    }

    if (associationId) {
      client.join(`association:${associationId}`);
      this.logger.log(`Socket ${client.id} joined association room ${associationId}`);
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
   * Broadcast new post to all users in the association
   */
  broadcastNewPost(associationId: string, post: unknown) {
    const room = `association:${associationId}`;
    this.server.to(room).emit(DASHBOARD_EVENTS.FEED_POST_NEW, { post });
    this.logger.debug(`New post broadcast to association ${associationId}`);
  }

  /**
   * Broadcast post liked event to all users in the association
   */
  broadcastPostLiked(
    associationId: string,
    postId: string,
    likesCount: number,
    likedBy: { id: string; name: string },
  ) {
    const room = `association:${associationId}`;
    this.server.to(room).emit(DASHBOARD_EVENTS.FEED_POST_LIKED, {
      post_id: postId,
      likes_count: likesCount,
      liked_by: likedBy,
    });
  }

  /**
   * Broadcast post deleted event to all users in the association
   */
  broadcastPostDeleted(associationId: string, postId: string) {
    const room = `association:${associationId}`;
    this.server.to(room).emit(DASHBOARD_EVENTS.FEED_POST_DELETED, {
      post_id: postId,
    });
  }

  /**
   * Broadcast new story to all users in the association
   */
  broadcastNewStory(
    associationId: string,
    storyUser: { user_id: string; username: string; avatar_url?: string },
  ) {
    const room = `association:${associationId}`;
    this.server.to(room).emit(DASHBOARD_EVENTS.STORY_NEW, storyUser);
    this.logger.debug(`New story broadcast to association ${associationId}`);
  }

  /**
   * Broadcast poll vote update to all users in the association
   */
  broadcastPollVoteUpdate(
    associationId: string,
    pollId: string,
    results: unknown,
  ) {
    const room = `association:${associationId}`;
    this.server.to(room).emit(DASHBOARD_EVENTS.POLL_VOTE_UPDATE, {
      poll_id: pollId,
      results,
    });
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

  private extractAssociationId(client: Socket): string | null {
    const auth = client.handshake.auth;
    if (auth?.associationId) {
      return auth.associationId;
    }

    const query = client.handshake.query;
    if (query?.associationId && typeof query.associationId === 'string') {
      return query.associationId;
    }

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
