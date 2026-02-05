import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TicketsService } from '../tickets.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: any;
  let notificationsService: any;

  const mockTicket = {
    id: 'ticket-1',
    code: 'TKT-001',
    userId: 'user-1',
    associationId: 'assoc-1',
    category: 'BUG',
    subject: 'Bug no login',
    description: 'O app fecha quando tento fazer login.',
    status: 'OPEN',
    isAutomatic: false,
    deviceInfo: null,
    assignedToId: null,
    resolvedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
    attachments: [],
    rating: null,
  };

  const mockUser = {
    id: 'user-1',
    name: 'João Silva',
    email: 'joao@email.com',
    avatarUrl: null,
    createdAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      ticket: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
        groupBy: vi.fn(),
      },
      ticketMessage: {
        create: vi.fn(),
      },
      ticketRating: {
        create: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      supportUpload: {
        findMany: vi.fn(),
      },
    };

    notificationsService = {
      create: vi.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    service = new TicketsService(prisma, notificationsService);
  });

  // ===========================================
  // listUserTickets
  // ===========================================

  describe('listUserTickets', () => {
    it('should return user tickets', async () => {
      prisma.ticket.findMany.mockResolvedValue([{ ...mockTicket, _count: { messages: 2 } }]);
      prisma.ticket.count.mockResolvedValue(1);

      const result = await service.listUserTickets('user-1', {});

      expect(result.data).toHaveLength(1);
      expect(result.data[0].code).toBe('TKT-001');
      expect(result.data[0].messageCount).toBe(2);
    });

    it('should filter by status', async () => {
      prisma.ticket.findMany.mockResolvedValue([]);
      prisma.ticket.count.mockResolvedValue(0);

      await service.listUserTickets('user-1', { status: 'RESOLVED' as any });

      expect(prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'RESOLVED',
          }),
        }),
      );
    });

    it('should paginate results', async () => {
      prisma.ticket.findMany.mockResolvedValue([]);
      prisma.ticket.count.mockResolvedValue(50);

      const result = await service.listUserTickets('user-1', { page: 2, perPage: 10 });

      expect(prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.meta.totalPages).toBe(5);
    });
  });

  // ===========================================
  // createTicket
  // ===========================================

  describe('createTicket', () => {
    it('should create a new ticket', async () => {
      prisma.ticket.count.mockResolvedValue(0);
      prisma.ticket.create.mockResolvedValue(mockTicket);

      const result = await service.createTicket('user-1', 'assoc-1', {
        category: 'BUG' as any,
        subject: 'Bug no login',
        description: 'O app fecha quando tento fazer login.',
      });

      expect(result.data.code).toBe('TKT-001');
      expect(prisma.ticket.create).toHaveBeenCalled();
    });

    it('should generate incremental ticket code', async () => {
      prisma.ticket.count.mockResolvedValue(99);
      prisma.ticket.create.mockResolvedValue({ ...mockTicket, code: 'TKT-100' });

      const result = await service.createTicket('user-1', 'assoc-1', {
        category: 'BUG' as any,
        subject: 'Another bug',
        description: 'Another bug description here.',
      });

      expect(prisma.ticket.create).toHaveBeenCalled();
    });
  });

  // ===========================================
  // createAutomaticTicket
  // ===========================================

  describe('createAutomaticTicket', () => {
    it('should create automatic ticket for crash', async () => {
      prisma.ticket.findFirst.mockResolvedValue(null); // No existing ticket today
      prisma.ticket.count.mockResolvedValue(0);
      prisma.ticket.create.mockResolvedValue({
        ...mockTicket,
        isAutomatic: true,
        subject: 'Crash Report - NullPointerException',
      });

      const result = await service.createAutomaticTicket('user-1', 'assoc-1', {
        errorType: 'NullPointerException',
        deviceInfo: {
          platform: 'android',
          osVersion: '14.0',
          appVersion: '2.1.0',
          deviceModel: 'Samsung S23',
        },
      });

      expect(result.data.isAutomatic).toBe(true);
      expect(result.data.subject).toContain('Crash Report');
    });

    it('should rate limit automatic tickets to 1 per day', async () => {
      prisma.ticket.findFirst.mockResolvedValue(mockTicket); // Existing ticket today

      await expect(
        service.createAutomaticTicket('user-1', 'assoc-1', {
          errorType: 'AnotherError',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // getTicket
  // ===========================================

  describe('getTicket', () => {
    it('should return ticket with messages', async () => {
      prisma.ticket.findFirst.mockResolvedValue({
        ...mockTicket,
        messages: [
          {
            id: 'msg-1',
            senderType: 'USER',
            senderId: 'user-1',
            content: 'Test message',
            attachments: [],
            createdAt: new Date(),
          },
        ],
      });
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getTicket('ticket-1', 'user-1');

      expect(result.data.code).toBe('TKT-001');
      expect(result.data.messages).toHaveLength(1);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      prisma.ticket.findFirst.mockResolvedValue(null);

      await expect(service.getTicket('ticket-999', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // sendMessage
  // ===========================================

  describe('sendMessage', () => {
    it('should send message to ticket', async () => {
      prisma.ticket.findFirst.mockResolvedValue(mockTicket);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.ticketMessage.create.mockResolvedValue({
        id: 'msg-1',
        ticketId: 'ticket-1',
        senderType: 'USER',
        senderId: 'user-1',
        content: 'New message',
        attachments: [],
        createdAt: new Date(),
      });

      const result = await service.sendMessage('ticket-1', 'user-1', {
        content: 'New message',
      });

      expect(result.data.content).toBe('New message');
    });

    it('should reopen resolved ticket when message is sent', async () => {
      prisma.ticket.findFirst.mockResolvedValue({ ...mockTicket, status: 'RESOLVED' });
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.ticketMessage.create.mockResolvedValue({
        id: 'msg-1',
        content: 'New message',
        attachments: [],
      });
      prisma.ticket.update.mockResolvedValue({ ...mockTicket, status: 'OPEN' });

      await service.sendMessage('ticket-1', 'user-1', { content: 'New message' });

      expect(prisma.ticket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'OPEN',
          }),
        }),
      );
    });

    it('should throw BadRequestException if ticket is closed', async () => {
      prisma.ticket.findFirst.mockResolvedValue({ ...mockTicket, status: 'CLOSED' });

      await expect(
        service.sendMessage('ticket-1', 'user-1', { content: 'New message' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // resolveTicket
  // ===========================================

  describe('resolveTicket', () => {
    it('should resolve ticket', async () => {
      prisma.ticket.findFirst.mockResolvedValue(mockTicket);
      prisma.ticket.update.mockResolvedValue({ ...mockTicket, status: 'RESOLVED', resolvedAt: new Date() });

      const result = await service.resolveTicket('ticket-1', 'user-1');

      expect(result.data.status).toBe('RESOLVED');
      expect(result.data.resolvedAt).toBeTruthy();
    });

    it('should throw if already resolved', async () => {
      prisma.ticket.findFirst.mockResolvedValue({ ...mockTicket, status: 'RESOLVED' });

      await expect(service.resolveTicket('ticket-1', 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // rateTicket
  // ===========================================

  describe('rateTicket', () => {
    it('should rate resolved ticket', async () => {
      prisma.ticket.findFirst.mockResolvedValue({ ...mockTicket, status: 'RESOLVED', rating: null });
      prisma.ticketRating.create.mockResolvedValue({
        ticketId: 'ticket-1',
        rating: 5,
        comment: 'Great support!',
        createdAt: new Date(),
      });
      prisma.ticket.update.mockResolvedValue({ ...mockTicket, status: 'CLOSED' });

      const result = await service.rateTicket('ticket-1', 'user-1', {
        rating: 5,
        comment: 'Great support!',
      });

      expect(result.data.rating).toBe(5);
    });

    it('should throw if ticket not resolved', async () => {
      prisma.ticket.findFirst.mockResolvedValue({ ...mockTicket, status: 'OPEN', rating: null });

      await expect(
        service.rateTicket('ticket-1', 'user-1', { rating: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if already rated', async () => {
      prisma.ticket.findFirst.mockResolvedValue({
        ...mockTicket,
        status: 'RESOLVED',
        rating: { rating: 4 },
      });

      await expect(
        service.rateTicket('ticket-1', 'user-1', { rating: 5 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ===========================================
  // Admin Methods
  // ===========================================

  describe('listAllTickets (admin)', () => {
    it('should return all tickets with counts', async () => {
      prisma.ticket.findMany.mockResolvedValue([
        { ...mockTicket, user: mockUser, _count: { messages: 3 } },
      ]);
      prisma.ticket.count.mockResolvedValue(1);
      prisma.ticket.groupBy.mockResolvedValue([
        { status: 'OPEN', _count: 5 },
        { status: 'IN_PROGRESS', _count: 3 },
        { status: 'RESOLVED', _count: 10 },
        { status: 'CLOSED', _count: 2 },
      ]);

      const result = await service.listAllTickets('assoc-1', {});

      expect(result.data).toHaveLength(1);
      expect(result.meta.counts.open).toBe(5);
      expect(result.meta.counts.inProgress).toBe(3);
    });

    it('should filter by automatic tickets', async () => {
      prisma.ticket.findMany.mockResolvedValue([]);
      prisma.ticket.count.mockResolvedValue(0);
      prisma.ticket.groupBy.mockResolvedValue([]);

      await service.listAllTickets('assoc-1', { isAutomatic: true });

      expect(prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isAutomatic: true,
          }),
        }),
      );
    });
  });

  describe('updateTicketStatus (admin)', () => {
    it('should update ticket status and notify user', async () => {
      prisma.ticket.findFirst.mockResolvedValue(mockTicket);
      prisma.ticket.update.mockResolvedValue({ ...mockTicket, status: 'IN_PROGRESS' });

      await service.updateTicketStatus('ticket-1', 'assoc-1', { status: 'IN_PROGRESS' as any });

      expect(prisma.ticket.update).toHaveBeenCalled();
      expect(notificationsService.create).toHaveBeenCalled();
    });
  });
});
