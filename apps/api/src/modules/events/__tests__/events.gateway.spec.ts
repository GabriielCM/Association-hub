import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventsGateway } from '../events.gateway';
import { Server, Socket } from 'socket.io';

const createMockSocket = (id: string): Partial<Socket> => ({
  id,
  join: vi.fn(),
  leave: vi.fn(),
});

const createMockServer = (): Partial<Server> => ({
  to: vi.fn().mockReturnThis(),
  emit: vi.fn(),
});

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let mockServer: Partial<Server>;

  beforeEach(() => {
    gateway = new EventsGateway();
    mockServer = createMockServer();
    (gateway as any).server = mockServer;
  });

  // ==========================================
  // handleConnection
  // ==========================================

  describe('handleConnection', () => {
    it('should add client to clientRooms map', () => {
      const client = createMockSocket('client-123') as Socket;

      gateway.handleConnection(client);

      expect((gateway as any).clientRooms.has('client-123')).toBe(true);
    });

    it('should initialize empty set for client rooms', () => {
      const client = createMockSocket('client-123') as Socket;

      gateway.handleConnection(client);

      const rooms = (gateway as any).clientRooms.get('client-123');
      expect(rooms).toBeDefined();
      expect(rooms.size).toBe(0);
    });

    it('should handle multiple connections', () => {
      const client1 = createMockSocket('client-1') as Socket;
      const client2 = createMockSocket('client-2') as Socket;

      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      expect((gateway as any).clientRooms.has('client-1')).toBe(true);
      expect((gateway as any).clientRooms.has('client-2')).toBe(true);
    });
  });

  // ==========================================
  // handleDisconnect
  // ==========================================

  describe('handleDisconnect', () => {
    it('should remove client from clientRooms map', () => {
      const client = createMockSocket('client-123') as Socket;

      gateway.handleConnection(client);
      gateway.handleDisconnect(client);

      expect((gateway as any).clientRooms.has('client-123')).toBe(false);
    });

    it('should not throw for unknown client', () => {
      const client = createMockSocket('unknown-client') as Socket;

      expect(() => gateway.handleDisconnect(client)).not.toThrow();
    });
  });

  // ==========================================
  // handleSubscribe
  // ==========================================

  describe('handleSubscribe', () => {
    it('should join client to event room', () => {
      const client = createMockSocket('client-123') as Socket;
      gateway.handleConnection(client);

      const result = gateway.handleSubscribe(client as Socket, { event_id: 'event-123' });

      expect(client.join).toHaveBeenCalledWith('event:event-123');
      expect(result).toEqual({ success: true, room: 'event:event-123' });
    });

    it('should add room to client rooms set', () => {
      const client = createMockSocket('client-123') as Socket;
      gateway.handleConnection(client);

      gateway.handleSubscribe(client as Socket, { event_id: 'event-123' });

      const rooms = (gateway as any).clientRooms.get('client-123');
      expect(rooms.has('event:event-123')).toBe(true);
    });

    it('should handle multiple subscriptions', () => {
      const client = createMockSocket('client-123') as Socket;
      gateway.handleConnection(client);

      gateway.handleSubscribe(client as Socket, { event_id: 'event-1' });
      gateway.handleSubscribe(client as Socket, { event_id: 'event-2' });

      const rooms = (gateway as any).clientRooms.get('client-123');
      expect(rooms.has('event:event-1')).toBe(true);
      expect(rooms.has('event:event-2')).toBe(true);
    });

    it('should handle subscription for unknown client', () => {
      const client = createMockSocket('unknown-client') as Socket;

      const result = gateway.handleSubscribe(client as Socket, { event_id: 'event-123' });

      expect(client.join).toHaveBeenCalledWith('event:event-123');
      expect(result.success).toBe(true);
    });
  });

  // ==========================================
  // handleUnsubscribe
  // ==========================================

  describe('handleUnsubscribe', () => {
    it('should leave client from event room', () => {
      const client = createMockSocket('client-123') as Socket;
      gateway.handleConnection(client);
      gateway.handleSubscribe(client as Socket, { event_id: 'event-123' });

      const result = gateway.handleUnsubscribe(client as Socket, { event_id: 'event-123' });

      expect(client.leave).toHaveBeenCalledWith('event:event-123');
      expect(result).toEqual({ success: true });
    });

    it('should remove room from client rooms set', () => {
      const client = createMockSocket('client-123') as Socket;
      gateway.handleConnection(client);
      gateway.handleSubscribe(client as Socket, { event_id: 'event-123' });

      gateway.handleUnsubscribe(client as Socket, { event_id: 'event-123' });

      const rooms = (gateway as any).clientRooms.get('client-123');
      expect(rooms.has('event:event-123')).toBe(false);
    });

    it('should handle unsubscription for unknown client', () => {
      const client = createMockSocket('unknown-client') as Socket;

      const result = gateway.handleUnsubscribe(client as Socket, { event_id: 'event-123' });

      expect(client.leave).toHaveBeenCalledWith('event:event-123');
      expect(result.success).toBe(true);
    });
  });

  // ==========================================
  // broadcastQrUpdate
  // ==========================================

  describe('broadcastQrUpdate', () => {
    it('should emit qr_update to event room', () => {
      const qrData = {
        type: 'event_checkin' as const,
        event_id: 'event-123',
        checkin_number: 1,
        security_token: 'token',
        timestamp: 1234567890,
        expires_at: 1234567990,
      };

      gateway.broadcastQrUpdate('event-123', qrData);

      expect(mockServer.to).toHaveBeenCalledWith('event:event-123');
      expect(mockServer.emit).toHaveBeenCalledWith('qr_update', {
        event_id: 'event-123',
        ...qrData,
      });
    });

    it('should include all QR data fields', () => {
      const qrData = {
        type: 'event_checkin' as const,
        event_id: 'event-123',
        checkin_number: 2,
        security_token: 'secret-token',
        timestamp: 9999999999,
        expires_at: 9999999999 + 120,
      };

      gateway.broadcastQrUpdate('event-123', qrData);

      expect(mockServer.emit).toHaveBeenCalledWith(
        'qr_update',
        expect.objectContaining({
          checkin_number: 2,
          security_token: 'secret-token',
        }),
      );
    });
  });

  // ==========================================
  // broadcastCheckinChange
  // ==========================================

  describe('broadcastCheckinChange', () => {
    it('should emit checkin_change to event room', () => {
      gateway.broadcastCheckinChange('event-123', 2, 25);

      expect(mockServer.to).toHaveBeenCalledWith('event:event-123');
      expect(mockServer.emit).toHaveBeenCalledWith('checkin_change', {
        event_id: 'event-123',
        checkin_number: 2,
        points: 25,
      });
    });
  });

  // ==========================================
  // broadcastCounterUpdate
  // ==========================================

  describe('broadcastCounterUpdate', () => {
    it('should emit counter_update to event room', () => {
      gateway.broadcastCounterUpdate('event-123', 50, 30);

      expect(mockServer.to).toHaveBeenCalledWith('event:event-123');
      expect(mockServer.emit).toHaveBeenCalledWith('counter_update', {
        event_id: 'event-123',
        total: 50,
        unique_users: 30,
      });
    });
  });

  // ==========================================
  // broadcastStatusChange
  // ==========================================

  describe('broadcastStatusChange', () => {
    it('should emit status_change to event room', () => {
      gateway.broadcastStatusChange('event-123', 'ONGOING', false);

      expect(mockServer.to).toHaveBeenCalledWith('event:event-123');
      expect(mockServer.emit).toHaveBeenCalledWith('status_change', {
        event_id: 'event-123',
        status: 'ONGOING',
        is_paused: false,
        message: undefined,
      });
    });

    it('should include optional message', () => {
      gateway.broadcastStatusChange('event-123', 'PAUSED', true, 'Check-ins pausados temporariamente');

      expect(mockServer.emit).toHaveBeenCalledWith('status_change', {
        event_id: 'event-123',
        status: 'PAUSED',
        is_paused: true,
        message: 'Check-ins pausados temporariamente',
      });
    });

    it('should emit ENDED status', () => {
      gateway.broadcastStatusChange('event-123', 'ENDED', false, 'Evento encerrado');

      expect(mockServer.emit).toHaveBeenCalledWith('status_change', {
        event_id: 'event-123',
        status: 'ENDED',
        is_paused: false,
        message: 'Evento encerrado',
      });
    });
  });

  // ==========================================
  // broadcastNewCheckin
  // ==========================================

  describe('broadcastNewCheckin', () => {
    it('should emit new_checkin to admin room', () => {
      const timestamp = new Date();

      gateway.broadcastNewCheckin('event-123', 'User Name', 1, timestamp);

      expect(mockServer.to).toHaveBeenCalledWith('event:event-123:admin');
      expect(mockServer.emit).toHaveBeenCalledWith('new_checkin', {
        event_id: 'event-123',
        user_name: 'User Name',
        checkin_number: 1,
        timestamp,
      });
    });

    it('should use admin room for check-in notifications', () => {
      gateway.broadcastNewCheckin('event-456', 'Another User', 2, new Date());

      expect(mockServer.to).toHaveBeenCalledWith('event:event-456:admin');
    });
  });
});
