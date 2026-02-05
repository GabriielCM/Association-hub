import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { JwtPayload, UserRole } from '../../../common/types';

// Mock @prisma/client enums
vi.mock('@prisma/client', () => ({
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

import { MessagesController } from '../messages.controller';
import { MessagesService } from '../messages.service';

// Mock data
const mockUserId = 'user-123';
const mockMessageId = 'msg-123';

const mockJwtPayload: JwtPayload = {
  sub: mockUserId,
  email: 'user@example.com',
  role: 'USER' as UserRole,
  associationId: 'assoc-123',
};

const mockMessage = {
  id: mockMessageId,
  conversationId: 'conv-123',
  senderId: mockUserId,
  content: 'Hello!',
  contentType: 'TEXT',
  status: 'SENT',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// Mock MessagesService
const mockMessagesService = {
  deleteMessage: vi.fn(),
  addReaction: vi.fn(),
  removeReaction: vi.fn(),
};

describe('MessagesController', () => {
  let controller: MessagesController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new MessagesController(
      mockMessagesService as unknown as MessagesService
    );
  });

  describe('delete', () => {
    it('deve excluir mensagem', async () => {
      mockMessagesService.deleteMessage.mockResolvedValue({
        ...mockMessage,
        deletedAt: new Date(),
      });

      await controller.delete(mockJwtPayload, mockMessageId);

      expect(mockMessagesService.deleteMessage).toHaveBeenCalledWith(
        mockUserId,
        mockMessageId
      );
    });
  });

  describe('addReaction', () => {
    it('deve adicionar reação à mensagem', async () => {
      mockMessagesService.addReaction.mockResolvedValue(undefined);

      const result = await controller.addReaction(mockJwtPayload, mockMessageId, {
        emoji: '👍',
      });

      expect(result).toEqual({ success: true });
      expect(mockMessagesService.addReaction).toHaveBeenCalledWith(
        mockUserId,
        mockMessageId,
        '👍'
      );
    });

    it('deve adicionar emoji diferente', async () => {
      mockMessagesService.addReaction.mockResolvedValue(undefined);

      const result = await controller.addReaction(mockJwtPayload, mockMessageId, {
        emoji: '❤️',
      });

      expect(result).toEqual({ success: true });
      expect(mockMessagesService.addReaction).toHaveBeenCalledWith(
        mockUserId,
        mockMessageId,
        '❤️'
      );
    });

    it('deve adicionar emoji unicode complexo', async () => {
      mockMessagesService.addReaction.mockResolvedValue(undefined);

      const result = await controller.addReaction(mockJwtPayload, mockMessageId, {
        emoji: '🎉',
      });

      expect(result).toEqual({ success: true });
      expect(mockMessagesService.addReaction).toHaveBeenCalledWith(
        mockUserId,
        mockMessageId,
        '🎉'
      );
    });
  });

  describe('removeReaction', () => {
    it('deve remover reação da mensagem', async () => {
      mockMessagesService.removeReaction.mockResolvedValue(undefined);

      await controller.removeReaction(mockJwtPayload, mockMessageId, '👍');

      expect(mockMessagesService.removeReaction).toHaveBeenCalledWith(
        mockUserId,
        mockMessageId,
        '👍'
      );
    });

    it('deve remover emoji diferente', async () => {
      mockMessagesService.removeReaction.mockResolvedValue(undefined);

      await controller.removeReaction(mockJwtPayload, mockMessageId, '❤️');

      expect(mockMessagesService.removeReaction).toHaveBeenCalledWith(
        mockUserId,
        mockMessageId,
        '❤️'
      );
    });
  });
});
