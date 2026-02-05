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
}));

import { GroupsController } from '../groups.controller';
import { MessagesService } from '../messages.service';

// Mock data
const mockUserId = 'user-123';
const mockOtherUserId = 'user-456';
const mockConversationId = 'conv-group-123';

const mockJwtPayload: JwtPayload = {
  sub: mockUserId,
  email: 'user@example.com',
  role: 'USER' as UserRole,
  associationId: 'assoc-123',
};

const mockGroup = {
  id: 'group-1',
  conversationId: mockConversationId,
  name: 'Test Group',
  description: 'A test group for testing',
  imageUrl: null,
  createdById: mockUserId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock MessagesService
const mockMessagesService = {
  getGroup: vi.fn(),
  updateGroup: vi.fn(),
  addParticipants: vi.fn(),
  removeParticipant: vi.fn(),
  promoteToAdmin: vi.fn(),
};

describe('GroupsController', () => {
  let controller: GroupsController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new GroupsController(
      mockMessagesService as unknown as MessagesService
    );
  });

  describe('getGroup', () => {
    it('deve retornar informações do grupo', async () => {
      mockMessagesService.getGroup.mockResolvedValue(mockGroup);

      const result = await controller.getGroup(mockJwtPayload, mockConversationId);

      expect(result).toEqual(mockGroup);
      expect(mockMessagesService.getGroup).toHaveBeenCalledWith(
        mockUserId,
        mockConversationId
      );
    });

    it('deve retornar grupo com todos os campos', async () => {
      const groupWithImage = {
        ...mockGroup,
        imageUrl: 'https://example.com/group.jpg',
        description: 'Updated description',
      };
      mockMessagesService.getGroup.mockResolvedValue(groupWithImage);

      const result = await controller.getGroup(mockJwtPayload, mockConversationId);

      expect(result.name).toBe('Test Group');
      expect(result.imageUrl).toBe('https://example.com/group.jpg');
      expect(result.description).toBe('Updated description');
    });
  });

  describe('updateGroup', () => {
    it('deve atualizar nome do grupo', async () => {
      const updatedGroup = { ...mockGroup, name: 'New Group Name' };
      mockMessagesService.updateGroup.mockResolvedValue(updatedGroup);

      const dto = { name: 'New Group Name' };
      const result = await controller.updateGroup(
        mockJwtPayload,
        mockConversationId,
        dto
      );

      expect(result.name).toBe('New Group Name');
      expect(mockMessagesService.updateGroup).toHaveBeenCalledWith(
        mockUserId,
        mockConversationId,
        dto
      );
    });

    it('deve atualizar descrição do grupo', async () => {
      const updatedGroup = { ...mockGroup, description: 'New description' };
      mockMessagesService.updateGroup.mockResolvedValue(updatedGroup);

      const dto = { description: 'New description' };
      const result = await controller.updateGroup(
        mockJwtPayload,
        mockConversationId,
        dto
      );

      expect(result.description).toBe('New description');
    });

    it('deve atualizar imagem do grupo', async () => {
      const updatedGroup = { ...mockGroup, imageUrl: 'https://example.com/new.jpg' };
      mockMessagesService.updateGroup.mockResolvedValue(updatedGroup);

      const dto = { imageUrl: 'https://example.com/new.jpg' };
      const result = await controller.updateGroup(
        mockJwtPayload,
        mockConversationId,
        dto
      );

      expect(result.imageUrl).toBe('https://example.com/new.jpg');
    });

    it('deve atualizar múltiplos campos', async () => {
      const updatedGroup = {
        ...mockGroup,
        name: 'New Name',
        description: 'New Desc',
        imageUrl: 'https://example.com/img.jpg',
      };
      mockMessagesService.updateGroup.mockResolvedValue(updatedGroup);

      const dto = {
        name: 'New Name',
        description: 'New Desc',
        imageUrl: 'https://example.com/img.jpg',
      };
      const result = await controller.updateGroup(
        mockJwtPayload,
        mockConversationId,
        dto
      );

      expect(result.name).toBe('New Name');
      expect(result.description).toBe('New Desc');
      expect(result.imageUrl).toBe('https://example.com/img.jpg');
    });
  });

  describe('addParticipants', () => {
    it('deve adicionar um participante', async () => {
      mockMessagesService.addParticipants.mockResolvedValue(undefined);

      const result = await controller.addParticipants(
        mockJwtPayload,
        mockConversationId,
        { participantIds: [mockOtherUserId] }
      );

      expect(result).toEqual({ success: true });
      expect(mockMessagesService.addParticipants).toHaveBeenCalledWith(
        mockUserId,
        mockConversationId,
        [mockOtherUserId]
      );
    });

    it('deve adicionar múltiplos participantes', async () => {
      mockMessagesService.addParticipants.mockResolvedValue(undefined);

      const participantIds = ['user-2', 'user-3', 'user-4'];
      const result = await controller.addParticipants(
        mockJwtPayload,
        mockConversationId,
        { participantIds }
      );

      expect(result).toEqual({ success: true });
      expect(mockMessagesService.addParticipants).toHaveBeenCalledWith(
        mockUserId,
        mockConversationId,
        participantIds
      );
    });
  });

  describe('removeParticipant', () => {
    it('deve remover participante do grupo', async () => {
      mockMessagesService.removeParticipant.mockResolvedValue(undefined);

      await controller.removeParticipant(
        mockJwtPayload,
        mockConversationId,
        mockOtherUserId
      );

      expect(mockMessagesService.removeParticipant).toHaveBeenCalledWith(
        mockUserId,
        mockConversationId,
        mockOtherUserId
      );
    });
  });

  describe('promoteToAdmin', () => {
    it('deve promover participante a administrador', async () => {
      mockMessagesService.promoteToAdmin.mockResolvedValue(undefined);

      const result = await controller.promoteToAdmin(
        mockJwtPayload,
        mockConversationId,
        { userId: mockOtherUserId }
      );

      expect(result).toEqual({ success: true });
      expect(mockMessagesService.promoteToAdmin).toHaveBeenCalledWith(
        mockUserId,
        mockConversationId,
        mockOtherUserId
      );
    });
  });
});
