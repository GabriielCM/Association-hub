import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    associationId: string;
    role: string;
  };
}

@WebSocketGateway({
  namespace: '/support',
  cors: {
    origin: '*',
  },
})
export class SupportGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SupportGateway.name);

  // Track connected users and agents
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds
  private agentSockets: Map<string, string[]> = new Map(); // agentId -> socketIds

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove from tracking maps
    this.removeSocketFromMaps(client.id);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('auth')
  handleAuth(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string; role: string },
  ) {
    // Store socket mapping
    if (data.role === 'ADMIN') {
      this.addSocketToMap(this.agentSockets, data.userId, client.id);
      client.join(`agent:${data.userId}`);
      client.join('agents'); // All agents room
    } else {
      this.addSocketToMap(this.userSockets, data.userId, client.id);
      client.join(`user:${data.userId}`);
    }

    this.logger.log(`User ${data.userId} authenticated as ${data.role}`);

    return { event: 'auth', data: { success: true } };
  }

  @SubscribeMessage('chat.typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; isTyping: boolean },
  ) {
    // Broadcast typing status to the other party
    client.to(`session:${data.sessionId}`).emit('chat.typing', {
      sessionId: data.sessionId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('join_session')
  handleJoinSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    client.join(`session:${data.sessionId}`);
    this.logger.log(`Socket ${client.id} joined session ${data.sessionId}`);
  }

  @SubscribeMessage('leave_session')
  handleLeaveSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ) {
    client.leave(`session:${data.sessionId}`);
    this.logger.log(`Socket ${client.id} left session ${data.sessionId}`);
  }

  // =====================================
  // SERVER-TO-CLIENT EVENTS
  // =====================================

  /**
   * Notify user of ticket update
   */
  notifyTicketUpdate(userId: string, data: { ticketId: string; ticketCode: string; status: string }) {
    this.server.to(`user:${userId}`).emit('ticket.updated', data);
  }

  /**
   * Notify user of new ticket message
   */
  notifyTicketMessage(userId: string, data: { ticketId: string; message: any }) {
    this.server.to(`user:${userId}`).emit('ticket.message', data);
  }

  /**
   * Notify agents of new ticket
   */
  notifyNewTicket(associationId: string, data: { ticketId: string; ticketCode: string; subject: string }) {
    this.server.to('agents').emit('ticket.new', data);
  }

  /**
   * Notify user that chat is connected to agent
   */
  notifyChatConnected(userId: string, data: { sessionId: string; agent: any }) {
    this.server.to(`user:${userId}`).emit('chat.connected', data);
  }

  /**
   * Notify both parties of new chat message
   */
  notifyChatMessage(sessionId: string, data: { message: any }) {
    this.server.to(`session:${sessionId}`).emit('chat.message', data);
  }

  /**
   * Notify user that chat ended
   */
  notifyChatEnded(userId: string, data: { sessionId: string }) {
    this.server.to(`user:${userId}`).emit('chat.ended', data);
  }

  /**
   * Update queue position for user
   */
  notifyQueuePosition(userId: string, data: { sessionId: string; position: number; estimatedMinutes: number }) {
    this.server.to(`user:${userId}`).emit('queue.position', data);
  }

  /**
   * Notify agents of queue update
   */
  notifyQueueUpdate(data: { totalWaiting: number }) {
    this.server.to('agents').emit('chat.queue.update', data);
  }

  // =====================================
  // HELPERS
  // =====================================

  private addSocketToMap(map: Map<string, string[]>, key: string, socketId: string) {
    const sockets = map.get(key) || [];
    if (!sockets.includes(socketId)) {
      sockets.push(socketId);
      map.set(key, sockets);
    }
  }

  private removeSocketFromMaps(socketId: string) {
    // Remove from user sockets
    for (const [userId, sockets] of this.userSockets.entries()) {
      const index = sockets.indexOf(socketId);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }

    // Remove from agent sockets
    for (const [agentId, sockets] of this.agentSockets.entries()) {
      const index = sockets.indexOf(socketId);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.agentSockets.delete(agentId);
        }
        break;
      }
    }
  }
}
