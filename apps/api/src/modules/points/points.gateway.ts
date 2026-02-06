import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export interface PointsUpdatePayload {
  type: 'credit' | 'debit';
  amount: number;
  source: string;
  newBalance: number;
  description?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class PointsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PointsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    const userId = this.extractUserId(client);
    if (userId) {
      this.registerUser(client.id, userId);
      client.join(`user:${userId}`);
      this.logger.log(`User ${userId} connected (socket ${client.id})`);
    }
  }

  handleDisconnect(client: Socket) {
    this.unregisterSocket(client.id);
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  broadcastPointsUpdate(userId: string, payload: PointsUpdatePayload) {
    const room = `user:${userId}`;
    this.server.to(room).emit('points_update', payload);
    this.logger.debug(
      `points_update sent to user ${userId}: ${payload.type} ${payload.amount} (new balance: ${payload.newBalance})`,
    );
  }

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
}
