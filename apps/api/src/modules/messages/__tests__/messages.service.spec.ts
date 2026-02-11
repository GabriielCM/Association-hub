import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

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

import { MessagesService } from '../messages.service';

// Local type definitions
const ConversationType = {
  DIRECT: 'DIRECT',
  GROUP: 'GROUP',
} as const;

const ConversationRole = {
  MEMBER: 'MEMBER',
  ADMIN: 'ADMIN',
} as const;

const MessageContentType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  AUDIO: 'AUDIO',
} as const;

const MessageStatus = {
  SENT: 'SENT',
} as const;

// Mock data
const mockUserId = 'user-123';
const mockOtherUserId = 'user-456';
const mockConversationId = 'conv-123';

const mockConversation = {
  id: mockConversationId,
  type: ConversationType.DIRECT,
  createdAt: new Date(),
  updatedAt: new Date(),
  participants: [
    {
      id: 'part-1',
      conversationId: mockConversationId,
      userId: mockUserId,
      role: ConversationRole.MEMBER,
      isMuted: false,
      isArchived: false,
      lastReadAt: null,
      joinedAt: new Date(),
      leftAt: null,
      user: { id: mockUserId, name: 'User 1', avatarUrl: null },
    },
    {
      id: 'part-2',
      conversationId: mockConversationId,
      userId: mockOtherUserId,
      role: ConversationRole.MEMBER,
      isMuted: false,
      isArchived: false,
      lastReadAt: null,
      joinedAt: new Date(),
      leftAt: null,
      user: { id: mockOtherUserId, name: 'User 2', avatarUrl: null },
    },
  ],
  group: null,
  messages: [],
};

const mockGroupConversation = {
  ...mockConversation,
  id: 'conv-group',
  type: ConversationType.GROUP,
  participants: [
    {
      ...mockConversation.participants[0],
      role: ConversationRole.ADMIN,
    },
    mockConversation.participants[1],
  ],
  group: {
    id: 'group-1',
    conversationId: 'conv-group',
    name: 'Test Group',
    description: 'A test group',
    imageUrl: null,
    createdById: mockUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

const mockMessage = {
  id: 'msg-123',
  conversationId: mockConversationId,
  senderId: mockUserId,
  content: 'Hello!',
  contentType: MessageContentType.TEXT,
  mediaUrl: null,
  replyToId: null,
  status: MessageStatus.SENT,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  sender: { id: mockUserId, name: 'User 1', avatarUrl: null },
  replyTo: null,
  reactions: [],
};

// Mock PrismaService
const mockPrismaService = {
  conversation: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  conversationParticipant: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  conversationGroup: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  message: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  messageReaction: {
    upsert: vi.fn(),
    deleteMany: vi.fn(),
  },
};

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MessagesService(mockPrismaService as any);
  });

  describe('createConversation', () => {
    it('deve criar uma conversa direta', async () => {
      mockPrismaService.conversation.findMany.mockResolvedValue([]);
      mockPrismaService.conversation.create.mockResolvedValue(mockConversation);

      const result = await service.createConversation(mockUserId, {
        type: ConversationType.DIRECT as any,
        participantIds: [mockOtherUserId],
      });

      expect(result).toEqual(mockConversation);
      expect(mockPrismaService.conversation.create).toHaveBeenCalled();
    });

    it('deve retornar conversa existente se já existe', async () => {
      mockPrismaService.conversation.findMany.mockResolvedValue([mockConversation]);

      const result = await service.createConversation(mockUserId, {
        type: ConversationType.DIRECT as any,
        participantIds: [mockOtherUserId],
      });

      expect(result).toEqual(mockConversation);
      expect(mockPrismaService.conversation.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro se conversa direta tiver mais de 1 participante', async () => {
      await expect(
        service.createConversation(mockUserId, {
          type: ConversationType.DIRECT as any,
          participantIds: [mockOtherUserId, 'user-789'],
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('deve criar grupo com nome obrigatório', async () => {
      mockPrismaService.conversation.create.mockResolvedValue(mockGroupConversation);

      const result = await service.createConversation(mockUserId, {
        type: ConversationType.GROUP as any,
        participantIds: [mockOtherUserId],
        groupName: 'Test Group',
      });

      expect(result).toEqual(mockGroupConversation);
    });

    it('deve lançar erro se grupo não tiver nome', async () => {
      await expect(
        service.createConversation(mockUserId, {
          type: ConversationType.GROUP as any,
          participantIds: [mockOtherUserId],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllConversations', () => {
    it('deve listar conversas', async () => {
      mockPrismaService.conversation.findMany.mockResolvedValue([mockConversation]);
      mockPrismaService.conversation.count.mockResolvedValue(1);
      mockPrismaService.message.count.mockResolvedValue(0);

      const result = await service.findAllConversations(mockUserId, {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination).toHaveProperty('offset');
    });
  });

  describe('findConversation', () => {
    it('deve retornar conversa', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockConversation);

      const result = await service.findConversation(mockUserId, mockConversationId);

      expect(result).toEqual(mockConversation);
    });

    it('deve lançar NotFoundException se não encontrar', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(null);

      await expect(
        service.findConversation(mockUserId, 'conv-999')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateConversationSettings', () => {
    it('deve atualizar configurações', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockConversation);
      mockPrismaService.conversationParticipant.update.mockResolvedValue({
        ...mockConversation.participants[0],
        isMuted: true,
      });

      const result = await service.updateConversationSettings(
        mockUserId,
        mockConversationId,
        { isMuted: true }
      );

      expect(result.isMuted).toBe(true);
    });
  });

  describe('leaveConversation', () => {
    it('deve sair de um grupo', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockGroupConversation);
      mockPrismaService.conversationParticipant.update.mockResolvedValue({});

      await service.leaveConversation(mockUserId, 'conv-group');

      expect(mockPrismaService.conversationParticipant.update).toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar sair de conversa direta', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockConversation);

      await expect(
        service.leaveConversation(mockUserId, mockConversationId)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('sendMessage', () => {
    it('deve enviar mensagem', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockConversation);
      mockPrismaService.message.create.mockResolvedValue(mockMessage);
      mockPrismaService.conversation.update.mockResolvedValue({});

      const result = await service.sendMessage(mockUserId, mockConversationId, {
        content: 'Hello!',
        contentType: MessageContentType.TEXT as any,
      });

      expect(result).toEqual(mockMessage);
    });

    it('deve validar resposta existente', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockConversation);
      mockPrismaService.message.findFirst.mockResolvedValue(null);

      await expect(
        service.sendMessage(mockUserId, mockConversationId, {
          content: 'Reply',
          replyToId: 'msg-999',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteMessage', () => {
    it('deve excluir mensagem', async () => {
      mockPrismaService.message.findFirst.mockResolvedValue(mockMessage);
      mockPrismaService.message.update.mockResolvedValue({
        ...mockMessage,
        deletedAt: new Date(),
      });

      const result = await service.deleteMessage(mockUserId, 'msg-123');

      expect(result.deletedAt).toBeDefined();
    });

    it('deve lançar NotFoundException se mensagem não encontrada', async () => {
      mockPrismaService.message.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteMessage(mockUserId, 'msg-999')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addReaction', () => {
    it('deve adicionar reação', async () => {
      mockPrismaService.message.findFirst.mockResolvedValue({
        ...mockMessage,
        conversation: mockConversation,
      });
      mockPrismaService.messageReaction.upsert.mockResolvedValue({});

      await service.addReaction(mockUserId, 'msg-123', '👍');

      expect(mockPrismaService.messageReaction.upsert).toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException se não for participante', async () => {
      mockPrismaService.message.findFirst.mockResolvedValue({
        ...mockMessage,
        conversation: {
          ...mockConversation,
          participants: [],
        },
      });

      await expect(
        service.addReaction(mockUserId, 'msg-123', '👍')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeReaction', () => {
    it('deve remover reação', async () => {
      mockPrismaService.messageReaction.deleteMany.mockResolvedValue({ count: 1 });

      await service.removeReaction(mockUserId, 'msg-123', '👍');

      expect(mockPrismaService.messageReaction.deleteMany).toHaveBeenCalled();
    });
  });

  describe('getGroup', () => {
    it('deve retornar grupo', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockGroupConversation);
      mockPrismaService.conversationGroup.findUnique.mockResolvedValue(
        mockGroupConversation.group
      );

      const result = await service.getGroup(mockUserId, 'conv-group');

      expect(result).toEqual(mockGroupConversation.group);
    });

    it('deve lançar erro se não for grupo', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockConversation);

      await expect(
        service.getGroup(mockUserId, mockConversationId)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateGroup', () => {
    it('deve atualizar grupo', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockGroupConversation);
      mockPrismaService.conversationParticipant.findUnique.mockResolvedValue({
        ...mockGroupConversation.participants[0],
        role: ConversationRole.ADMIN,
      });
      mockPrismaService.conversationGroup.update.mockResolvedValue({
        ...mockGroupConversation.group,
        name: 'New Name',
      });

      const result = await service.updateGroup(mockUserId, 'conv-group', {
        name: 'New Name',
      });

      expect(result.name).toBe('New Name');
    });

    it('deve lançar ForbiddenException se não for admin', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockGroupConversation);
      mockPrismaService.conversationParticipant.findUnique.mockResolvedValue({
        ...mockGroupConversation.participants[1],
        role: ConversationRole.MEMBER,
      });

      await expect(
        service.updateGroup(mockOtherUserId, 'conv-group', { name: 'New Name' })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addParticipants', () => {
    it('deve adicionar participantes', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockGroupConversation);
      mockPrismaService.conversationParticipant.findUnique.mockResolvedValueOnce({
        role: ConversationRole.ADMIN,
      });
      mockPrismaService.conversationParticipant.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.conversationParticipant.create.mockResolvedValue({});

      await service.addParticipants(mockUserId, 'conv-group', ['user-789']);

      expect(mockPrismaService.conversationParticipant.create).toHaveBeenCalled();
    });
  });

  describe('removeParticipant', () => {
    it('deve remover participante', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockGroupConversation);
      mockPrismaService.conversationParticipant.findUnique.mockResolvedValue({
        role: ConversationRole.ADMIN,
      });
      mockPrismaService.conversationParticipant.update.mockResolvedValue({});

      await service.removeParticipant(mockUserId, 'conv-group', mockOtherUserId);

      expect(mockPrismaService.conversationParticipant.update).toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar se remover', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockGroupConversation);
      mockPrismaService.conversationParticipant.findUnique.mockResolvedValue({
        role: ConversationRole.ADMIN,
      });

      await expect(
        service.removeParticipant(mockUserId, 'conv-group', mockUserId)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('promoteToAdmin', () => {
    it('deve promover participante a admin', async () => {
      mockPrismaService.conversation.findFirst.mockResolvedValue(mockGroupConversation);
      mockPrismaService.conversationParticipant.findUnique.mockResolvedValue({
        role: ConversationRole.ADMIN,
      });
      mockPrismaService.conversationParticipant.update.mockResolvedValue({});

      await service.promoteToAdmin(mockUserId, 'conv-group', mockOtherUserId);

      expect(mockPrismaService.conversationParticipant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { role: ConversationRole.ADMIN },
        })
      );
    });
  });

  describe('mapMessageWithSender', () => {
    const baseMessage = {
      id: 'msg-1',
      conversationId: mockConversationId,
      senderId: mockUserId,
      sender: { name: 'User 1', avatarUrl: null },
      content: 'Test message',
      contentType: MessageContentType.TEXT,
      mediaUrl: null,
      replyTo: null,
      status: 'SENT',
      reactions: [],
      createdAt: new Date(),
      deletedAt: null,
    };

    it('deve retornar array vazio quando sem reações', () => {
      const result = (service as any).mapMessageWithSender(baseMessage, mockUserId);

      expect(result.reactions).toHaveLength(0);
    });

    it('deve agregar reação única corretamente', () => {
      const message = {
        ...baseMessage,
        reactions: [
          { emoji: '👍', userId: mockOtherUserId, user: { name: 'User 2' } },
        ],
      };

      const result = (service as any).mapMessageWithSender(message, mockUserId);

      expect(result.reactions).toHaveLength(1);
      expect(result.reactions[0]).toEqual({
        emoji: '👍',
        count: 1,
        users: [{ userId: mockOtherUserId, name: 'User 2' }],
        hasReacted: false,
      });
    });

    it('deve agregar múltiplas reações do mesmo emoji', () => {
      const message = {
        ...baseMessage,
        reactions: [
          { emoji: '👍', userId: mockOtherUserId, user: { name: 'User 2' } },
          { emoji: '👍', userId: 'user-789', user: { name: 'User 3' } },
          { emoji: '👍', userId: mockUserId, user: { name: 'User 1' } },
        ],
      };

      const result = (service as any).mapMessageWithSender(message, mockUserId);

      const likeReaction = result.reactions[0];
      expect(likeReaction.count).toBe(3);
      expect(likeReaction.users).toHaveLength(3);
      expect(likeReaction.hasReacted).toBe(true);
    });

    it('deve agregar múltiplos emojis diferentes', () => {
      const message = {
        ...baseMessage,
        reactions: [
          { emoji: '👍', userId: mockOtherUserId, user: { name: 'User 2' } },
          { emoji: '❤️', userId: 'user-789', user: { name: 'User 3' } },
          { emoji: '😂', userId: mockUserId, user: { name: 'User 1' } },
        ],
      };

      const result = (service as any).mapMessageWithSender(message, mockUserId);

      expect(result.reactions).toHaveLength(3);
      const emojis = result.reactions.map((r: any) => r.emoji);
      expect(emojis).toContain('👍');
      expect(emojis).toContain('❤️');
      expect(emojis).toContain('😂');
    });

    it('deve marcar hasReacted como true apenas para emojis do usuário atual', () => {
      const message = {
        ...baseMessage,
        reactions: [
          { emoji: '👍', userId: mockOtherUserId, user: { name: 'User 2' } },
          { emoji: '👍', userId: mockUserId, user: { name: 'User 1' } },
          { emoji: '❤️', userId: mockUserId, user: { name: 'User 1' } },
          { emoji: '😂', userId: mockOtherUserId, user: { name: 'User 2' } },
        ],
      };

      const result = (service as any).mapMessageWithSender(message, mockUserId);

      const likeReaction = result.reactions.find((r: any) => r.emoji === '👍');
      const heartReaction = result.reactions.find((r: any) => r.emoji === '❤️');
      const laughReaction = result.reactions.find((r: any) => r.emoji === '😂');

      expect(likeReaction?.hasReacted).toBe(true);
      expect(heartReaction?.hasReacted).toBe(true);
      expect(laughReaction?.hasReacted).toBe(false);
    });

    it('deve mapear corretamente mensagem com resposta', () => {
      const replyToMessage = {
        id: 'msg-reply-to',
        content: 'Original message',
        contentType: MessageContentType.TEXT,
        senderId: mockOtherUserId,
        sender: { name: 'User 2' },
        createdAt: new Date(),
      };

      const message = {
        ...baseMessage,
        replyToId: 'msg-reply-to',
        replyTo: replyToMessage,
      };

      const result = (service as any).mapMessageWithSender(message, mockUserId);

      expect(result.replyTo).toBeDefined();
      expect(result.replyTo.id).toBe('msg-reply-to');
      expect(result.replyTo.content).toBe('Original message');
      expect(result.replyTo.senderName).toBe('User 2');
    });

    it('deve mapear undefined quando não há resposta', () => {
      const result = (service as any).mapMessageWithSender(baseMessage, mockUserId);

      expect(result.replyTo).toBeUndefined();
    });

    it('deve mapear mediaUrl quando presente', () => {
      const message = {
        ...baseMessage,
        mediaUrl: 'https://example.com/image.jpg',
      };

      const result = (service as any).mapMessageWithSender(message, mockUserId);

      expect(result.mediaUrl).toBe('https://example.com/image.jpg');
    });

    it('deve mapear undefined quando mediaUrl é null', () => {
      const result = (service as any).mapMessageWithSender(baseMessage, mockUserId);

      expect(result.mediaUrl).toBeUndefined();
    });

    it('deve mapear deletedAt quando mensagem foi deletada', () => {
      const deletedDate = new Date();
      const message = { ...baseMessage, deletedAt: deletedDate };

      const result = (service as any).mapMessageWithSender(message, mockUserId);

      expect(result.deletedAt).toBe(deletedDate);
    });

    it('deve mapear undefined para deletedAt quando mensagem ativa', () => {
      const result = (service as any).mapMessageWithSender(baseMessage, mockUserId);

      expect(result.deletedAt).toBeUndefined();
    });
  });

  describe('getConversationParticipants', () => {
    it('deve retornar lista de IDs dos participantes ativos', async () => {
      mockPrismaService.conversationParticipant.findMany.mockResolvedValue([
        { userId: mockUserId },
        { userId: mockOtherUserId },
        { userId: 'user-789' },
      ]);

      const result = await service.getConversationParticipants(mockConversationId);

      expect(result).toEqual([mockUserId, mockOtherUserId, 'user-789']);
    });

    it('deve retornar array vazio quando nenhum participante ativo', async () => {
      mockPrismaService.conversationParticipant.findMany.mockResolvedValue([]);

      const result = await service.getConversationParticipants(mockConversationId);

      expect(result).toEqual([]);
    });

    it('deve filtrar por leftAt = null', async () => {
      mockPrismaService.conversationParticipant.findMany.mockResolvedValue([]);

      await service.getConversationParticipants(mockConversationId);

      expect(mockPrismaService.conversationParticipant.findMany).toHaveBeenCalledWith({
        where: { conversationId: mockConversationId, leftAt: null },
        select: { userId: true },
      });
    });
  });
});
