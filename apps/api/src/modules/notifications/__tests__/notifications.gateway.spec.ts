import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock @prisma/client
vi.mock('@prisma/client', () => ({
  NotificationCategory: {
    SOCIAL: 'SOCIAL',
    EVENTS: 'EVENTS',
    POINTS: 'POINTS',
    RESERVATIONS: 'RESERVATIONS',
    SYSTEM: 'SYSTEM',
  },
  NotificationType: {
    NEW_LIKE: 'NEW_LIKE',
  },
}));

import { NotificationsGateway } from '../notifications.gateway';
import { NOTIFICATION_EVENTS } from '../notification.types';

// Mock Socket
const createMockSocket = (id: string, auth: any = {}, query: any = {}) => ({
  id,
  handshake: { auth, query },
  join: vi.fn(),
  leave: vi.fn(),
});

// Mock Server
const createMockServer = () => ({
  to: vi.fn().mockReturnThis(),
  emit: vi.fn(),
});

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = new NotificationsGateway();
    mockServer = createMockServer();
    (gateway as any).server = mockServer;
  });

  describe('handleConnection', () => {
    it('deve registrar cliente com userId do auth', () => {
      const socket = createMockSocket('socket-123', { userId: 'user-123' });

      gateway.handleConnection(socket as any);

      expect(socket.join).toHaveBeenCalledWith('user:user-123');
      expect(gateway.isUserOnline('user-123')).toBe(true);
    });

    it('deve registrar cliente com userId da query', () => {
      const socket = createMockSocket('socket-123', {}, { userId: 'user-456' });

      gateway.handleConnection(socket as any);

      expect(socket.join).toHaveBeenCalledWith('user:user-456');
      expect(gateway.isUserOnline('user-456')).toBe(true);
    });

    it('não deve registrar cliente sem userId', () => {
      const socket = createMockSocket('socket-123');

      gateway.handleConnection(socket as any);

      expect(socket.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('deve remover cliente ao desconectar', () => {
      const socket = createMockSocket('socket-123', { userId: 'user-123' });
      gateway.handleConnection(socket as any);

      expect(gateway.isUserOnline('user-123')).toBe(true);

      gateway.handleDisconnect(socket as any);

      expect(gateway.isUserOnline('user-123')).toBe(false);
    });
  });

  describe('broadcastNewNotification', () => {
    it('deve enviar notificação para o usuário', () => {
      const notification = {
        id: 'notif-123',
        userId: 'user-123',
        type: 'NEW_LIKE',
        category: 'SOCIAL',
        title: 'Novo like',
        body: 'João curtiu',
        data: {},
        imageUrl: null,
        actionUrl: '/posts/123',
        groupKey: null,
        isRead: false,
        readAt: null,
        createdAt: new Date(),
      };

      gateway.broadcastNewNotification('user-123', notification as any);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        NOTIFICATION_EVENTS.NEW,
        expect.objectContaining({
          id: 'notif-123',
          type: 'NEW_LIKE',
        })
      );
    });
  });

  describe('broadcastNotificationRead', () => {
    it('deve notificar que notificação foi lida', () => {
      gateway.broadcastNotificationRead('user-123', 'notif-123');

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith(NOTIFICATION_EVENTS.READ, {
        notificationId: 'notif-123',
      });
    });
  });

  describe('broadcastNotificationDeleted', () => {
    it('deve notificar que notificação foi excluída', () => {
      gateway.broadcastNotificationDeleted('user-123', 'notif-123');

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith(NOTIFICATION_EVENTS.DELETED, {
        notificationId: 'notif-123',
      });
    });
  });

  describe('broadcastUnreadCountUpdate', () => {
    it('deve enviar contadores atualizados', () => {
      const counts = {
        total: 5,
        byCategory: {
          SOCIAL: 3,
          EVENTS: 2,
          POINTS: 0,
          RESERVATIONS: 0,
          SYSTEM: 0,
        },
      };

      gateway.broadcastUnreadCountUpdate('user-123', counts as any);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith(
        NOTIFICATION_EVENTS.UNREAD_COUNT_UPDATE,
        counts
      );
    });
  });

  describe('broadcastSettingsChanged', () => {
    it('deve notificar mudança de configurações', () => {
      gateway.broadcastSettingsChanged('user-123', 'SOCIAL', {
        pushEnabled: false,
        inAppEnabled: true,
      });

      expect(mockServer.to).toHaveBeenCalledWith('user:user-123');
      expect(mockServer.emit).toHaveBeenCalledWith(NOTIFICATION_EVENTS.SETTINGS_CHANGED, {
        category: 'SOCIAL',
        pushEnabled: false,
        inAppEnabled: true,
      });
    });
  });

  describe('broadcastToUsers', () => {
    it('deve enviar para múltiplos usuários', () => {
      gateway.broadcastToUsers(['user-1', 'user-2'], 'custom.event', { data: 'test' });

      expect(mockServer.to).toHaveBeenCalledWith('user:user-1');
      expect(mockServer.to).toHaveBeenCalledWith('user:user-2');
      expect(mockServer.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('isUserOnline', () => {
    it('deve retornar true se usuário online', () => {
      const socket = createMockSocket('socket-123', { userId: 'user-123' });
      gateway.handleConnection(socket as any);

      expect(gateway.isUserOnline('user-123')).toBe(true);
    });

    it('deve retornar false se usuário offline', () => {
      expect(gateway.isUserOnline('user-999')).toBe(false);
    });
  });

  describe('getOnlineUserCount', () => {
    it('deve retornar contagem de usuários online', () => {
      expect(gateway.getOnlineUserCount()).toBe(0);

      const socket1 = createMockSocket('socket-1', { userId: 'user-1' });
      const socket2 = createMockSocket('socket-2', { userId: 'user-2' });

      gateway.handleConnection(socket1 as any);
      gateway.handleConnection(socket2 as any);

      expect(gateway.getOnlineUserCount()).toBe(2);
    });

    it('deve contar usuário uma vez mesmo com múltiplas conexões', () => {
      const socket1 = createMockSocket('socket-1', { userId: 'user-1' });
      const socket2 = createMockSocket('socket-2', { userId: 'user-1' });

      gateway.handleConnection(socket1 as any);
      gateway.handleConnection(socket2 as any);

      expect(gateway.getOnlineUserCount()).toBe(1);
    });
  });
});
