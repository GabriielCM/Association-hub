import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { JwtPayload, UserRole } from '../../../common/types';

// Mock @prisma/client enums
vi.mock('@prisma/client', () => ({
  ConversationType: {
    DIRECT: 'DIRECT',
    GROUP: 'GROUP',
  },
  ConversationRole: {
    MEMBER: 'MEMBER',
    ADMIN: 'ADMIN',
  },
  MessageContentType: {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    AUDIO: 'AUDIO',
  },
  MessageStatus: {
    SENDING: 'SENDING',
    SENT: 'SENT',
    DELIVERED: 'DELIVERED',
    READ: 'READ',
  },
}));

import { ConversationsController } from '../conversations.controller';
import { MessagesService } from '../messages.service';

// Local type definitions
const ConversationType = {
  DIRECT: 'DIRECT',
  GROUP: 'GROUP',
} as const;

const MessageContentType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
} as const;

// Mock data
const mockUserId = 'user-123';
const mockOtherUserId = 'user-456';
const mockConversationId = 'conv-123';

const mockJwtPayload: JwtPayload = {
  sub: mockUserId,
  email: 'user@example.com',
  role: 'USER' as UserRole,
  associationId: 'assoc-123',
};

const mockConversation = {
  id: mockConversationId,
  type: ConversationType.DIRECT,
  createdAt: new Date(),
  updatedAt: new Date(),
  participants: [
    {
      id: 'part-1',
      userId: mockUserId,
      role: 'MEMBER',
      isMuted: false,
      isArchived: false,
      user: { id: mockUserId, name: 'User 1', avatarUrl: null },
    },
    {
      id: 'part-2',
      userId: mockOtherUserId,
      role: 'MEMBER',
      isMuted: false,
      isArchived: false,
      user: { id: mockOtherUserId, name: 'User 2', avatarUrl: null },
    },
  ],
};

const mockMessage = {
  id: 'msg-123',
  conversationId: mockConversationId,
  senderId: mockUserId,
  content: 'Hello!',
  contentType: MessageContentType.TEXT,
  mediaUrl: null,
  replyToId: null,
  status: 'SENT',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  sender: { id: mockUserId, name: 'User 1', avatarUrl: null },
  reactions: [],
};

const mockParticipantSettings = {
  id: 'part-1',
  userId: mockUserId,
  conversationId: mockConversationId,
  isMuted: true,
  isArchived: false,
};

// Mock MessagesService
const mockMessagesService = {
  findAllConversations: vi.fn(),
  createConversation: vi.fn(),
  findConversation: vi.fn(),
  updateConversationSettings: vi.fn(),
  leaveConversation: vi.fn(),
  markConversationAsRead: vi.fn(),
  findMessages: vi.fn(),
  sendMessage: vi.fn(),
};

describe('ConversationsController', () => {
  let controller: ConversationsController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ConversationsController(
      mockMessagesService as unknown as MessagesService
    );
  });

  describe('findAll', () => {
    it('deve listar conversas do usuário', async () => {
      const mockResponse = {
        conversations: [mockConversation],
        total: 1,
        hasMore: false,
      };
      mockMessagesService.findAllConversations.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockJwtPayload, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual(mockResponse);
      expect(mockMessagesService.findAllConversations).toHaveBeenCalledWith(
        mockUserId,
        { page: 1, limit: 20 }
      );
    });

    it('deve aplicar filtro de arquivadas', async () => {
      mockMessagesService.findAllConversations.mockResolvedValue({
        conversations: [],
        total: 0,
        hasMore: false,
      });

      await controller.findAll(mockJwtPayload, {
        includeArchived: true,
        page: 1,
        limit: 20,
      });

      expect(mockMessagesService.findAllConversations).toHaveBeenCalledWith(
        mockUserId,
        { includeArchived: true, page: 1, limit: 20 }
      );
    });

    it('deve aplicar filtro de busca', async () => {
      mockMessagesService.findAllConversations.mockResolvedValue({
        conversations: [],
        total: 0,
        hasMore: false,
      });

      await controller.findAll(mockJwtPayload, {
        search: 'test',
        page: 1,
        limit: 20,
      });

      expect(mockMessagesService.findAllConversations).toHaveBeenCalledWith(
        mockUserId,
        { search: 'test', page: 1, limit: 20 }
      );
    });
  });

  describe('create', () => {
    it('deve criar conversa direta', async () => {
      mockMessagesService.createConversation.mockResolvedValue(mockConversation);

      const dto = {
        type: ConversationType.DIRECT as any,
        participantIds: [mockOtherUserId],
      };

      const result = await controller.create(mockJwtPayload, dto);

      expect(result).toEqual(mockConversation);
      expect(mockMessagesService.createConversation).toHaveBeenCalledWith(
        mockUserId,
        dto
      );
    });

    it('deve criar grupo com nome', async () => {
      const groupConversation = {
        ...mockConversation,
        type: ConversationType.GROUP,
        group: { name: 'Test Group' },
      };
      mockMessagesService.createConversation.mockResolvedValue(groupConversation);

      const dto = {
        type: ConversationType.GROUP as any,
        participantIds: [mockOtherUserId],
        groupName: 'Test Group',
      };

      const result = await controller.create(mockJwtPayload, dto);

      expect((result as any).group.name).toBe('Test Group');
      expect(mockMessagesService.createConversation).toHaveBeenCalledWith(
        mockUserId,
        dto
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar conversa', async () => {
      mockMessagesService.findConversation.mockResolvedValue(mockConversation);

      const result = await controller.findOne(mockJwtPayload, mockConversationId);

      expect(result).toEqual(mockConversation);
      expect(mockMessagesService.findConversation).toHaveBeenCalledWith(
        mockUserId,
        mockConversationId
      );
    });
  });

  describe('updateSettings', () => {
    it('deve atualizar configurações da conversa', async () => {
      mockMessagesService.updateConversationSettings.mockResolvedValue(
        mockParticipantSettings
      );

      const dto = { isMuted: true };
      const result = await controller.updateSettings(
        mockJwtPayload,
        mockConversationId,
        dto
      );

      expect(result.isMuted).toBe(true);
      expect(mockMessagesService.updateConversationSettings).toHaveBeenCalledWith(
        mockUserId,
        mockConversationId,
        dto
      );
    });

    it('deve arquivar conversa', async () => {
      mockMessagesService.updateConversationSettings.mockResolvedValue({
        ...mockParticipantSettings,
        isArchived: true,
      });

      const dto = { isArchived: true };
      const result = await controller.updateSettings(
        mockJwtPayload,
        mockConversationId,
        dto
      );

      expect(result.isArchived).toBe(true);
    });
  });

  describe('leave', () => {
    it('deve sair da conversa', async () => {
      mockMessagesService.leaveConversation.mockResolvedValue(undefined);

      await controller.leave(mockJwtPayload, mockConversationId);

      expect(mockMessagesService.leaveConversation).toHaveBeenCalledWith(
        mockUserId,
        mockConversationId
      );
    });
  });

  describe('markAsRead', () => {
    it('deve marcar conversa como lida', async () => {
      mockMessagesService.markConversationAsRead.mockResolvedValue(undefined);

      const result = await controller.markAsRead(mockJwtPayload, mockConversationId);

      expect(result).toEqual({ success: true });
      expect(mockMessagesService.markConversationAsRead).toHaveBeenCalledWith(
        mockUserId,
        mockConversationId
      );
    });
  });

  describe('typing', () => {
    it('deve retornar sucesso para indicador de digitação', async () => {
      const result = await controller.typing(mockJwtPayload, mockConversationId);

      expect(result).toEqual({ success: true });
    });
  });

  describe('findMessages', () => {
    it('deve listar mensagens da conversa', async () => {
      const mockResponse = {
        messages: [mockMessage],
        total: 1,
        hasMore: false,
      };
      mockMessagesService.findMessages.mockResolvedValue(mockResponse);

      const result = await controller.findMessages(
        mockJwtPayload,
        mockConversationId,
        { page: 1, limit: 50 }
      );

      expect(result).toEqual(mockResponse);
      expect(mockMessagesService.findMessages).toHaveBeenCalledWith(
        mockUserId,
        mockConversationId,
        { page: 1, limit: 50 }
      );
    });

    it('deve aplicar filtro before para paginação', async () => {
      mockMessagesService.findMessages.mockResolvedValue({
        messages: [],
        total: 0,
        hasMore: false,
      });

      await controller.findMessages(mockJwtPayload, mockConversationId, {
        before: 'msg-100',
        limit: 50,
      });

      expect(mockMessagesService.findMessages).toHaveBeenCalledWith(
        mockUserId,
        mockConversationId,
        { before: 'msg-100', limit: 50 }
      );
    });
  });

  describe('sendMessage', () => {
    it('deve enviar mensagem de texto', async () => {
      mockMessagesService.sendMessage.mockResolvedValue(mockMessage);

      const dto = {
        content: 'Hello!',
        contentType: MessageContentType.TEXT as any,
      };

      const result = await controller.sendMessage(
        mockJwtPayload,
        mockConversationId,
        dto
      );

      expect(result).toEqual(mockMessage);
      expect(mockMessagesService.sendMessage).toHaveBeenCalledWith(
        mockUserId,
        mockConversationId,
        dto
      );
    });

    it('deve enviar mensagem com mídia', async () => {
      const messageWithMedia = {
        ...mockMessage,
        contentType: MessageContentType.IMAGE,
        mediaUrl: 'https://example.com/image.jpg',
      };
      mockMessagesService.sendMessage.mockResolvedValue(messageWithMedia);

      const dto = {
        content: 'Check this out',
        contentType: MessageContentType.IMAGE as any,
        mediaUrl: 'https://example.com/image.jpg',
      };

      const result = await controller.sendMessage(
        mockJwtPayload,
        mockConversationId,
        dto
      );

      expect(result.mediaUrl).toBe('https://example.com/image.jpg');
    });

    it('deve enviar mensagem como resposta', async () => {
      const replyMessage = {
        ...mockMessage,
        replyToId: 'msg-original',
      };
      mockMessagesService.sendMessage.mockResolvedValue(replyMessage);

      const dto = {
        content: 'Reply!',
        replyToId: 'msg-original',
      };

      const result = await controller.sendMessage(
        mockJwtPayload,
        mockConversationId,
        dto
      );

      expect(result.replyToId).toBe('msg-original');
    });
  });
});
