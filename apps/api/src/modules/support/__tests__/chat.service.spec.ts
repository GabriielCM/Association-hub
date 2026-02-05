import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatService } from '../chat.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: any;
  let notificationsService: any;

  const mockSession = {
    id: 'session-1',
    userId: 'user-1',
    associationId: 'assoc-1',
    agentId: null,
    status: 'QUEUED',
    queuePosition: 1,
    startedAt: null,
    endedAt: null,
    createdAt: new Date(),
  };

  const mockActiveSession = {
    ...mockSession,
    status: 'ACTIVE',
    agentId: 'agent-1',
    startedAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    name: 'João Silva',
    avatarUrl: null,
  };

  beforeEach(() => {
    prisma = {
      chatSession: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      chatMessage: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      chatRating: {
        create: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      supportUpload: {
        findMany: vi.fn(),
      },
      $transaction: vi.fn((callbacks) => Promise.all(callbacks)),
    };

    notificationsService = {
      create: vi.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    service = new ChatService(prisma, notificationsService);
  });

  // ===========================================
  // connect
  // ===========================================

  describe('connect', () => {
    it('should create session and enter queue', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(null); // No existing session
      prisma.chatSession.count.mockResolvedValue(2); // 2 people in queue
      prisma.chatSession.create.mockResolvedValue({
        ...mockSession,
        queuePosition: 3,
      });

      const result = await service.connect('user-1', 'assoc-1');

      expect(result.data.status).toBe('QUEUED');
      expect(result.data.queuePosition).toBe(3);
      expect(result.data.estimatedMinutes).toBe(6); // 3 * 2 min
    });

    it('should throw ConflictException if already in queue', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(mockSession);

      await expect(service.connect('user-1', 'assoc-1')).rejects.toThrow(ConflictException);
    });
  });

  // ===========================================
  // getStatus
  // ===========================================

  describe('getStatus', () => {
    it('should return null if no active session', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(null);

      const result = await service.getStatus('user-1');

      expect(result.data).toBeNull();
    });

    it('should return queue position if in queue', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(mockSession);
      prisma.chatSession.count.mockResolvedValue(0); // First in queue

      const result = await service.getStatus('user-1');

      expect(result.data?.status).toBe('QUEUED');
      expect(result.data?.queuePosition).toBe(1);
    });

    it('should return agent info if connected', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(mockActiveSession);
      prisma.user.findUnique.mockResolvedValue({ id: 'agent-1', name: 'Maria', avatarUrl: null });

      const result = await service.getStatus('user-1');

      expect(result.data?.status).toBe('ACTIVE');
      expect(result.data?.agent?.name).toBe('Maria');
    });
  });

  // ===========================================
  // getMessages
  // ===========================================

  describe('getMessages', () => {
    it('should return messages for active session', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(mockActiveSession);
      prisma.chatMessage.findMany.mockResolvedValue([
        {
          id: 'msg-1',
          senderType: 'AGENT',
          content: 'Hello!',
          attachments: [],
          createdAt: new Date(),
        },
      ]);

      const result = await service.getMessages('user-1');

      expect(result.data).toHaveLength(1);
      expect(result.meta.hasMore).toBe(false);
    });

    it('should throw if no active session', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(null);

      await expect(service.getMessages('user-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // sendMessage
  // ===========================================

  describe('sendMessage', () => {
    it('should send message in active session', async () => {
      prisma.chatSession.findFirst
        .mockResolvedValueOnce(mockActiveSession) // For active check
        .mockResolvedValueOnce(null); // For queued check (if first fails)
      prisma.chatMessage.create.mockResolvedValue({
        id: 'msg-1',
        senderType: 'USER',
        content: 'Hi there!',
        attachments: [],
        createdAt: new Date(),
      });

      const result = await service.sendMessage('user-1', { content: 'Hi there!' });

      expect(result.data.content).toBe('Hi there!');
    });

    it('should throw if in queue', async () => {
      prisma.chatSession.findFirst
        .mockResolvedValueOnce(null) // No active session
        .mockResolvedValueOnce(mockSession); // But in queue

      await expect(
        service.sendMessage('user-1', { content: 'Hi!' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if no session', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(null);

      await expect(
        service.sendMessage('user-1', { content: 'Hi!' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // disconnect
  // ===========================================

  describe('disconnect', () => {
    it('should end active session', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(mockActiveSession);
      prisma.chatSession.update.mockResolvedValue({
        ...mockActiveSession,
        status: 'ENDED',
        endedAt: new Date(),
      });

      const result = await service.disconnect('user-1');

      expect(result.data.status).toBe('ENDED');
      expect(result.data.endedAt).toBeTruthy();
    });

    it('should recalculate queue positions when leaving queue', async () => {
      prisma.chatSession.findFirst
        .mockResolvedValueOnce(mockSession) // Initial find
        .mockResolvedValueOnce(null); // For recalculation
      prisma.chatSession.update.mockResolvedValue({
        ...mockSession,
        status: 'ENDED',
      });
      prisma.chatSession.findMany.mockResolvedValue([]); // Queue is empty after

      await service.disconnect('user-1');

      expect(prisma.chatSession.update).toHaveBeenCalled();
    });

    it('should throw if no session', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(null);

      await expect(service.disconnect('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // rateChat
  // ===========================================

  describe('rateChat', () => {
    it('should rate ended session', async () => {
      prisma.chatSession.findFirst.mockResolvedValue({
        ...mockActiveSession,
        status: 'ENDED',
        endedAt: new Date(),
        rating: null,
      });
      prisma.chatRating.create.mockResolvedValue({
        sessionId: 'session-1',
        rating: 5,
        comment: 'Great help!',
        createdAt: new Date(),
      });

      const result = await service.rateChat('user-1', { rating: 5, comment: 'Great help!' });

      expect(result.data.rating).toBe(5);
    });

    it('should throw if already rated', async () => {
      prisma.chatSession.findFirst.mockResolvedValue({
        ...mockActiveSession,
        status: 'ENDED',
        rating: { rating: 4 },
      });

      await expect(
        service.rateChat('user-1', { rating: 5 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw if no ended session', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(null);

      await expect(
        service.rateChat('user-1', { rating: 5 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // Admin Methods
  // ===========================================

  describe('getQueue (admin)', () => {
    it('should return queued sessions', async () => {
      prisma.chatSession.findMany.mockResolvedValue([
        { ...mockSession, user: mockUser },
      ]);

      const result = await service.getQueue('assoc-1');

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalWaiting).toBe(1);
    });
  });

  describe('getActiveChats (admin)', () => {
    it('should return agent active chats', async () => {
      prisma.chatSession.findMany.mockResolvedValue([
        { ...mockActiveSession, user: mockUser, _count: { messages: 5 } },
      ]);

      const result = await service.getActiveChats('agent-1');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].messageCount).toBe(5);
    });
  });

  describe('acceptChat (admin)', () => {
    it('should accept chat from queue', async () => {
      prisma.chatSession.findFirst
        .mockResolvedValueOnce({ ...mockSession, user: mockUser }) // Find in queue
        .mockResolvedValueOnce(null); // For recalculation check
      prisma.chatSession.update.mockResolvedValue({
        ...mockActiveSession,
        user: mockUser,
      });
      prisma.chatSession.findMany.mockResolvedValue([]); // Empty queue after

      const result = await service.acceptChat('session-1', 'agent-1', 'Maria');

      expect(result.data.status).toBe('ACTIVE');
      expect(notificationsService.create).toHaveBeenCalled();
    });

    it('should throw if session not found or already accepted', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(null);

      await expect(
        service.acceptChat('session-999', 'agent-1', 'Maria'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('endChat (admin)', () => {
    it('should end chat session and notify user', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(mockActiveSession);
      prisma.chatSession.update.mockResolvedValue({
        ...mockActiveSession,
        status: 'ENDED',
        endedAt: new Date(),
      });

      const result = await service.endChat('session-1', 'agent-1');

      expect(result.data.status).toBe('ENDED');
      expect(notificationsService.create).toHaveBeenCalled();
    });
  });

  describe('transferChat (admin)', () => {
    it('should transfer chat to another agent', async () => {
      prisma.chatSession.findFirst.mockResolvedValue(mockActiveSession);
      prisma.chatSession.update.mockResolvedValue({
        ...mockActiveSession,
        agentId: 'agent-2',
      });

      const result = await service.transferChat('session-1', 'agent-1', 'agent-2');

      expect(prisma.chatSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { agentId: 'agent-2' },
        }),
      );
    });
  });
});
