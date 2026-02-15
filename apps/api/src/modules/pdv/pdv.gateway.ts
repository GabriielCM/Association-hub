import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PdvCheckoutStatus } from '@prisma/client';

/**
 * PDV WebSocket event names
 */
export const PDV_EVENTS = {
  CHECKOUT_CREATED: 'checkout:created',
  CHECKOUT_PAID: 'checkout:paid',
  CHECKOUT_EXPIRED: 'checkout:expired',
  CHECKOUT_CANCELLED: 'checkout:cancelled',
  CHECKOUT_AWAITING_PIX: 'checkout:awaiting_pix',
  CHECKOUT_STATUS_CHANGED: 'checkout:status_changed',
} as const;

/**
 * Checkout data payload for WebSocket events
 */
export interface CheckoutEventPayload {
  code: string;
  status: PdvCheckoutStatus;
  items?: unknown[];
  totalPoints?: number;
  totalMoney?: number;
  expiresAt?: Date;
  paidAt?: Date;
  paymentMethod?: string;
}

/**
 * WebSocket gateway for real-time PDV display updates.
 * Enables instant status updates when checkouts are created, paid, expired, or cancelled.
 *
 * Room pattern: device:${deviceId} for PDV display devices
 */
@WebSocketGateway({
  namespace: '/ws/pdv',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class PdvGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PdvGateway.name);
  private deviceSockets: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Extract deviceId from auth or query params
    const deviceId = this.extractDeviceId(client);
    if (deviceId) {
      this.registerDevice(client.id, deviceId);
      client.join(`device:${deviceId}`);
      this.logger.log(`Device ${deviceId} registered with socket ${client.id}`);
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
   * Broadcast new checkout created on PDV device
   */
  broadcastCheckoutCreated(deviceId: string, payload: CheckoutEventPayload) {
    const room = `device:${deviceId}`;
    this.server.to(room).emit(PDV_EVENTS.CHECKOUT_CREATED, payload);
    this.logger.debug(`Checkout created event sent to device ${deviceId}: ${payload.code}`);
  }

  /**
   * Broadcast checkout paid notification
   */
  broadcastCheckoutPaid(deviceId: string, payload: CheckoutEventPayload) {
    const room = `device:${deviceId}`;
    this.server.to(room).emit(PDV_EVENTS.CHECKOUT_PAID, payload);
    this.logger.debug(`Checkout paid event sent to device ${deviceId}: ${payload.code}`);
  }

  /**
   * Broadcast checkout expired notification
   */
  broadcastCheckoutExpired(deviceId: string, payload: CheckoutEventPayload) {
    const room = `device:${deviceId}`;
    this.server.to(room).emit(PDV_EVENTS.CHECKOUT_EXPIRED, payload);
    this.logger.debug(`Checkout expired event sent to device ${deviceId}: ${payload.code}`);
  }

  /**
   * Broadcast checkout cancelled notification
   */
  broadcastCheckoutCancelled(deviceId: string, payload: CheckoutEventPayload) {
    const room = `device:${deviceId}`;
    this.server.to(room).emit(PDV_EVENTS.CHECKOUT_CANCELLED, payload);
    this.logger.debug(`Checkout cancelled event sent to device ${deviceId}: ${payload.code}`);
  }

  /**
   * Broadcast checkout awaiting PIX payment
   */
  broadcastCheckoutAwaitingPix(deviceId: string, payload: CheckoutEventPayload) {
    const room = `device:${deviceId}`;
    this.server.to(room).emit(PDV_EVENTS.CHECKOUT_AWAITING_PIX, payload);
    this.logger.debug(`Checkout awaiting PIX event sent to device ${deviceId}: ${payload.code}`);
  }

  /**
   * Generic status change broadcast
   */
  broadcastStatusChange(deviceId: string, payload: CheckoutEventPayload) {
    const room = `device:${deviceId}`;
    this.server.to(room).emit(PDV_EVENTS.CHECKOUT_STATUS_CHANGED, payload);
    this.logger.debug(
      `Checkout status changed to ${payload.status} for device ${deviceId}: ${payload.code}`,
    );
  }

  /**
   * Broadcast to multiple devices
   */
  broadcastToDevices(deviceIds: string[], event: string, data: unknown) {
    for (const deviceId of deviceIds) {
      const room = `device:${deviceId}`;
      this.server.to(room).emit(event, data);
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  private extractDeviceId(client: Socket): string | null {
    // Try to get deviceId from handshake auth
    const auth = client.handshake.auth;
    if (auth?.deviceId) {
      return auth.deviceId;
    }

    // Try to get from query params
    const query = client.handshake.query;
    if (query?.deviceId && typeof query.deviceId === 'string') {
      return query.deviceId;
    }

    // In production, you'd verify JWT token or API key here
    // const token = auth?.token || query?.token;
    // if (token) { return verifyAndExtractDeviceId(token); }

    return null;
  }

  private registerDevice(socketId: string, deviceId: string) {
    if (!this.deviceSockets.has(deviceId)) {
      this.deviceSockets.set(deviceId, new Set());
    }
    this.deviceSockets.get(deviceId)!.add(socketId);
  }

  private unregisterSocket(socketId: string) {
    for (const [deviceId, sockets] of this.deviceSockets.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.deviceSockets.delete(deviceId);
        }
        break;
      }
    }
  }

  isDeviceOnline(deviceId: string): boolean {
    const sockets = this.deviceSockets.get(deviceId);
    return sockets !== undefined && sockets.size > 0;
  }

  getOnlineDeviceCount(): number {
    return this.deviceSockets.size;
  }

  getConnectedDevices(): string[] {
    return Array.from(this.deviceSockets.keys());
  }
}
