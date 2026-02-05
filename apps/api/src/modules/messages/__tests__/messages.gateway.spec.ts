import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock @prisma/client
vi.mock('@prisma/client', () => ({
  MessageContentType: {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    AUDIO: 'AUDIO',
  },
  MessageStatus: {
    SENT: 'SENT',
    DELIVERED: 'DELIVERED',
    READ: 'READ',
  },
}));

import { MessagesGateway } from '../messages.gateway';
import { MESSAGE_EVENTS } from '../message.types';

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

describe('MessagesGateway', () => {
  let gateway: MessagesGateway;
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    gateway = new MessagesGateway();
    mockServer = createMockServer();
    (gateway as any).server = mockServer;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('handleConnection', () => {
    it('deve registrar usuário com userId do auth', () => {
      const socket = createMockSocket('socket-1', { userId: 'user-1' });

      gateway.handleConnection(socket as any);

      expect(socket.join).toHaveBeenCalledWith('user:user-1');
      expect(gateway.isUserOnline('user-1')).toBe(true);
    });

    it('deve broadcast presença ao conectar', () => {
      const socket = createMockSocket('socket-1', { userId: 'user-1' });

      gateway.handleConnection(socket as any);

      expect(mockServer.emit).toHaveBeenCalledWith(
        MESSAGE_EVENTS.PRESENCE_UPDATE,
        expect.objectContaining({
          userId: 'user-1',
          isOnline: true,
        })
      );
    });
  });

  describe('handleDisconnect', () => {
    it('deve broadcast offline ao desconectar', () => {
      const socket = createMockSocket('socket-1', { userId: 'user-1' });
      gateway.handleConnection(socket as any);
      vi.clearAllMocks();

      gateway.handleDisconnect(socket as any);

      expect(mockServer.emit).toHaveBeenCalledWith(
        MESSAGE_EVENTS.PRESENCE_UPDATE,
        expect.objectContaining({
          userId: 'user-1',
          isOnline: false,
        })
      );
    });

    it('não deve broadcast offline se usuário ainda tem conexões', () => {
      const socket1 = createMockSocket('socket-1', { userId: 'user-1' });
      const socket2 = createMockSocket('socket-2', { userId: 'user-1' });
      gateway.handleConnection(socket1 as any);
      gateway.handleConnection(socket2 as any);
      vi.clearAllMocks();

      gateway.handleDisconnect(socket1 as any);

      expect(mockServer.emit).not.toHaveBeenCalled();
      expect(gateway.isUserOnline('user-1')).toBe(true);
    });
  });

  describe('handleJoin', () => {
    it('deve entrar na sala da conversa', () => {
      const socket = createMockSocket('socket-1', { userId: 'user-1' });

      const result = gateway.handleJoin(socket as any, { conversationId: 'conv-1' });

      expect(socket.join).toHaveBeenCalledWith('conversation:conv-1');
      expect(result.success).toBe(true);
    });
  });

  describe('handleLeave', () => {
    it('deve sair da sala da conversa', () => {
      const socket = createMockSocket('socket-1', { userId: 'user-1' });

      const result = gateway.handleLeave(socket as any, { conversationId: 'conv-1' });

      expect(socket.leave).toHaveBeenCalledWith('conversation:conv-1');
      expect(result.success).toBe(true);
    });
  });

  describe('handleTypingStart', () => {
    it('deve broadcast typing update', () => {
      const socket = createMockSocket('socket-1', { userId: 'user-1' });
      gateway.handleConnection(socket as any);
      vi.clearAllMocks();

      gateway.handleTypingStart(socket as any, { conversationId: 'conv-1' });

      expect(mockServer.to).toHaveBeenCalledWith('conversation:conv-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        MESSAGE_EVENTS.TYPING_UPDATE,
        expect.objectContaining({
          userId: 'user-1',
          isTyping: true,
        })
      );
    });

    it('deve auto-parar typing após 5 segundos', () => {
      const socket = createMockSocket('socket-1', { userId: 'user-1' });
      gateway.handleConnection(socket as any);
      vi.clearAllMocks();

      gateway.handleTypingStart(socket as any, { conversationId: 'conv-1' });
      expect(gateway.getTypingUsers('conv-1')).toContain('user-1');

      vi.advanceTimersByTime(5000);

      expect(gateway.getTypingUsers('conv-1')).not.toContain('user-1');
    });
  });

  describe('handleTypingStop', () => {
    it('deve parar typing', () => {
      const socket = createMockSocket('socket-1', { userId: 'user-1' });
      gateway.handleConnection(socket as any);
      gateway.handleTypingStart(socket as any, { conversationId: 'conv-1' });
      vi.clearAllMocks();

      gateway.handleTypingStop(socket as any, { conversationId: 'conv-1' });

      expect(mockServer.emit).toHaveBeenCalledWith(
        MESSAGE_EVENTS.TYPING_UPDATE,
        expect.objectContaining({
          userId: 'user-1',
          isTyping: false,
        })
      );
    });
  });

  describe('broadcastNewMessage', () => {
    it('deve enviar mensagem para a conversa', () => {
      const message = {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Hello',
        contentType: 'TEXT',
        mediaUrl: null,
        replyToId: null,
        status: 'SENT',
        createdAt: new Date(),
      };

      gateway.broadcastNewMessage('conv-1', message as any, 'User 1');

      expect(mockServer.to).toHaveBeenCalledWith('conversation:conv-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        MESSAGE_EVENTS.MESSAGE_NEW,
        expect.objectContaining({
          id: 'msg-1',
          senderName: 'User 1',
        })
      );
    });
  });

  describe('broadcastMessageDelivered', () => {
    it('deve enviar status de entrega', () => {
      gateway.broadcastMessageDelivered('conv-1', 'msg-1', 'user-2');

      expect(mockServer.to).toHaveBeenCalledWith('conversation:conv-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        MESSAGE_EVENTS.MESSAGE_DELIVERED,
        expect.objectContaining({
          messageId: 'msg-1',
          deliveredTo: 'user-2',
        })
      );
    });
  });

  describe('broadcastMessageRead', () => {
    it('deve enviar status de leitura', () => {
      gateway.broadcastMessageRead('conv-1', 'msg-1', 'user-2');

      expect(mockServer.to).toHaveBeenCalledWith('conversation:conv-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        MESSAGE_EVENTS.MESSAGE_READ,
        expect.objectContaining({
          messageId: 'msg-1',
          readBy: 'user-2',
        })
      );
    });
  });

  describe('broadcastMessageDeleted', () => {
    it('deve enviar notificação de exclusão', () => {
      gateway.broadcastMessageDeleted('conv-1', 'msg-1');

      expect(mockServer.to).toHaveBeenCalledWith('conversation:conv-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        MESSAGE_EVENTS.MESSAGE_DELETED,
        expect.objectContaining({
          messageId: 'msg-1',
        })
      );
    });
  });

  describe('broadcastReactionUpdate', () => {
    it('deve enviar atualização de reação', () => {
      gateway.broadcastReactionUpdate('conv-1', 'msg-1', 'user-1', '👍', true);

      expect(mockServer.to).toHaveBeenCalledWith('conversation:conv-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        MESSAGE_EVENTS.MESSAGE_REACTION,
        expect.objectContaining({
          messageId: 'msg-1',
          userId: 'user-1',
          emoji: '👍',
          added: true,
        })
      );
    });
  });

  describe('sendToUser', () => {
    it('deve enviar para usuário específico', () => {
      gateway.sendToUser('user-1', 'custom.event', { data: 'test' });

      expect(mockServer.to).toHaveBeenCalledWith('user:user-1');
      expect(mockServer.emit).toHaveBeenCalledWith('custom.event', { data: 'test' });
    });
  });

  describe('sendToUsers', () => {
    it('deve enviar para múltiplos usuários', () => {
      gateway.sendToUsers(['user-1', 'user-2'], 'custom.event', { data: 'test' });

      expect(mockServer.to).toHaveBeenCalledWith('user:user-1');
      expect(mockServer.to).toHaveBeenCalledWith('user:user-2');
      expect(mockServer.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('getOnlineUserIds', () => {
    it('deve retornar lista de usuários online', () => {
      const socket1 = createMockSocket('socket-1', { userId: 'user-1' });
      const socket2 = createMockSocket('socket-2', { userId: 'user-2' });
      gateway.handleConnection(socket1 as any);
      gateway.handleConnection(socket2 as any);

      const online = gateway.getOnlineUserIds();

      expect(online).toContain('user-1');
      expect(online).toContain('user-2');
    });
  });
});
