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
import { QrCodeData } from './display.service';

interface SubscribePayload {
  event_id: string;
}

@WebSocketGateway({
  namespace: '/ws/events',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private clientRooms: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clientRooms.set(client.id, new Set());
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clientRooms.delete(client.id);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscribePayload,
  ) {
    const room = `event:${payload.event_id}`;
    client.join(room);

    const rooms = this.clientRooms.get(client.id);
    if (rooms) {
      rooms.add(room);
    }

    this.logger.log(`Client ${client.id} subscribed to ${room}`);

    return { success: true, room };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscribePayload,
  ) {
    const room = `event:${payload.event_id}`;
    client.leave(room);

    const rooms = this.clientRooms.get(client.id);
    if (rooms) {
      rooms.delete(room);
    }

    this.logger.log(`Client ${client.id} unsubscribed from ${room}`);

    return { success: true };
  }

  // Broadcast methods called by services

  broadcastQrUpdate(eventId: string, qrData: QrCodeData) {
    const room = `event:${eventId}`;
    this.server.to(room).emit('qr_update', {
      event_id: eventId,
      ...qrData,
    });
    this.logger.debug(`QR update broadcast to ${room}`);
  }

  broadcastCheckinChange(eventId: string, checkinNumber: number, points: number) {
    const room = `event:${eventId}`;
    this.server.to(room).emit('checkin_change', {
      event_id: eventId,
      checkin_number: checkinNumber,
      points,
    });
  }

  broadcastCounterUpdate(eventId: string, total: number, uniqueUsers: number) {
    const room = `event:${eventId}`;
    this.server.to(room).emit('counter_update', {
      event_id: eventId,
      total,
      unique_users: uniqueUsers,
    });
  }

  broadcastStatusChange(
    eventId: string,
    status: string,
    isPaused: boolean,
    message?: string,
  ) {
    const room = `event:${eventId}`;
    this.server.to(room).emit('status_change', {
      event_id: eventId,
      status,
      is_paused: isPaused,
      message,
    });
  }

  broadcastNewCheckin(
    eventId: string,
    userName: string,
    checkinNumber: number,
    timestamp: Date,
  ) {
    const room = `event:${eventId}:admin`;
    this.server.to(room).emit('new_checkin', {
      event_id: eventId,
      user_name: userName,
      checkin_number: checkinNumber,
      timestamp,
    });
  }
}
