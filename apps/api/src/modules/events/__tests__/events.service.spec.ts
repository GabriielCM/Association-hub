import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

// Mock @prisma/client enums before importing service
vi.mock('@prisma/client', () => ({
  EventStatus: {
    DRAFT: 'DRAFT',
    SCHEDULED: 'SCHEDULED',
    ONGOING: 'ONGOING',
    ENDED: 'ENDED',
    CANCELED: 'CANCELED',
  },
  EventCategory: {
    SOCIAL: 'SOCIAL',
    SPORTS: 'SPORTS',
    CULTURAL: 'CULTURAL',
    EDUCATIONAL: 'EDUCATIONAL',
    NETWORKING: 'NETWORKING',
    GASTRO: 'GASTRO',
    MUSIC: 'MUSIC',
    ART: 'ART',
    GAMES: 'GAMES',
    INSTITUTIONAL: 'INSTITUTIONAL',
  },
  BadgeCriteria: {
    FIRST_CHECKIN: 'FIRST_CHECKIN',
    ALL_CHECKINS: 'ALL_CHECKINS',
    AT_LEAST_ONE: 'AT_LEAST_ONE',
  },
  Prisma: {
    EventWhereInput: {},
    EventUpdateInput: {},
  },
}));

import { EventsService } from '../events.service';
import { EventFilter } from '../dto/event-query.dto';

// Define local enums for type safety in tests
const EventStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  ONGOING: 'ONGOING',
  ENDED: 'ENDED',
  CANCELED: 'CANCELED',
} as const;
type EventStatus = typeof EventStatus[keyof typeof EventStatus];

const EventCategory = {
  SOCIAL: 'SOCIAL',
  SPORTS: 'SPORTS',
  CULTURAL: 'CULTURAL',
  EDUCATIONAL: 'EDUCATIONAL',
  NETWORKING: 'NETWORKING',
  GASTRO: 'GASTRO',
  MUSIC: 'MUSIC',
  ART: 'ART',
  GAMES: 'GAMES',
  INSTITUTIONAL: 'INSTITUTIONAL',
} as const;
type EventCategory = typeof EventCategory[keyof typeof EventCategory];

const BadgeCriteria = {
  FIRST_CHECKIN: 'FIRST_CHECKIN',
  ALL_CHECKINS: 'ALL_CHECKINS',
  AT_LEAST_ONE: 'AT_LEAST_ONE',
} as const;
type BadgeCriteria = typeof BadgeCriteria[keyof typeof BadgeCriteria];

// EventFilter is imported from DTO

// Mock data
const mockAssociationId = 'assoc-123';
const mockUserId = 'user-123';
const mockAdminId = 'admin-123';

const mockEvent = {
  id: 'event-123',
  associationId: mockAssociationId,
  title: 'Evento Teste',
  description: 'Descricao do evento teste',
  category: 'SOCIAL' as EventCategory,
  color: '#6366F1',
  startDate: new Date('2025-01-15T10:00:00Z'),
  endDate: new Date('2025-01-15T18:00:00Z'),
  locationName: 'Salao Principal',
  locationAddress: 'Rua Teste, 123',
  bannerFeed: 'https://example.com/banner.jpg',
  bannerDisplay: [],
  pointsTotal: 100,
  checkinsCount: 4,
  checkinInterval: 30,
  badgeId: null,
  badgeCriteria: 'AT_LEAST_ONE' as BadgeCriteria,
  status: 'ONGOING' as EventStatus,
  isPaused: false,
  cancelReason: null,
  capacity: null,
  externalLink: null,
  qrSecret: 'secret-123',
  createdBy: mockAdminId,
  createdAt: new Date(),
  updatedAt: new Date(),
  publishedAt: new Date(),
};

const mockEventDraft = {
  ...mockEvent,
  id: 'event-draft',
  status: 'DRAFT' as EventStatus,
  publishedAt: null,
};

const mockEventScheduled = {
  ...mockEvent,
  id: 'event-scheduled',
  status: 'SCHEDULED' as EventStatus,
};

const mockEventEnded = {
  ...mockEvent,
  id: 'event-ended',
  status: 'ENDED' as EventStatus,
};

const mockUser = {
  id: mockUserId,
  name: 'Usuario Teste',
  email: 'teste@example.com',
  avatarUrl: null,
  associationId: mockAssociationId,
};

describe('EventsService', () => {
  let service: EventsService;
  let prisma: any;
  let pointsService: any;
  let subscriptionsService: any;

  beforeEach(() => {
    prisma = {
      event: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      eventConfirmation: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      eventCheckIn: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
        groupBy: vi.fn(),
        aggregate: vi.fn(),
      },
      eventComment: {
        findMany: vi.fn(),
        create: vi.fn(),
        count: vi.fn(),
      },
      userBadge: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        count: vi.fn(),
      },
      badge: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(prisma)),
      $queryRaw: vi.fn(),
    };

    pointsService = {
      creditPoints: vi.fn(),
    };

    subscriptionsService = {
      getBenefits: vi.fn().mockResolvedValue({ mutators: { points_events: 1 } }),
    };

    service = new EventsService(prisma, pointsService, subscriptionsService);
  });

  // ==========================================
  // listEvents
  // ==========================================

  describe('listEvents', () => {
    it('should return paginated events list', async () => {
      const events = [
        { ...mockEvent, _count: { confirmations: 10 }, confirmations: [] },
      ];
      prisma.event.findMany.mockResolvedValue(events);
      prisma.event.count.mockResolvedValue(1);

      const result = await service.listEvents(mockUserId, mockAssociationId, {
        page: 1,
        perPage: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalCount).toBe(1);
      expect(result.data[0].isConfirmed).toBe(false);
    });

    it('should mark event as confirmed when user has confirmation', async () => {
      const events = [
        { ...mockEvent, _count: { confirmations: 10 }, confirmations: [{ id: 'conf-1' }] },
      ];
      prisma.event.findMany.mockResolvedValue(events);
      prisma.event.count.mockResolvedValue(1);

      const result = await service.listEvents(mockUserId, mockAssociationId, {});

      expect(result.data[0].isConfirmed).toBe(true);
    });

    it('should filter by category', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.listEvents(mockUserId, mockAssociationId, {
        category: 'SPORTS' as EventCategory,
      });

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'SPORTS',
          }),
        }),
      );
    });

    it('should filter upcoming events', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.listEvents(mockUserId, mockAssociationId, {
        filter: EventFilter.UPCOMING,
      });

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SCHEDULED',
            startDate: expect.any(Object),
          }),
        }),
      );
    });

    it('should filter ongoing events', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.listEvents(mockUserId, mockAssociationId, {
        filter: EventFilter.ONGOING,
      });

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ONGOING',
          }),
        }),
      );
    });

    it('should filter past events', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.listEvents(mockUserId, mockAssociationId, {
        filter: EventFilter.PAST,
      });

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ENDED',
          }),
        }),
      );
    });

    it('should filter confirmed events', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.listEvents(mockUserId, mockAssociationId, {
        filter: EventFilter.CONFIRMED,
      });

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            confirmations: { some: { userId: mockUserId } },
          }),
        }),
      );
    });

    it('should search by title', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.listEvents(mockUserId, mockAssociationId, {
        search: 'festa',
      });

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                title: { contains: 'festa', mode: 'insensitive' },
              }),
            ]),
          }),
        }),
      );
    });

    it('should calculate pagination correctly', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(100);

      const result = await service.listEvents(mockUserId, mockAssociationId, {
        page: 3,
        perPage: 10,
      });

      expect(result.meta.currentPage).toBe(3);
      expect(result.meta.perPage).toBe(10);
      expect(result.meta.totalPages).toBe(10);
    });
  });

  // ==========================================
  // getEvent
  // ==========================================

  describe('getEvent', () => {
    it('should return event details with user progress', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        badge: null,
        _count: { confirmations: 10, checkIns: 25, comments: 5 },
        confirmations: [{ id: 'conf-1', confirmedAt: new Date() }],
        checkIns: [
          { id: 'ci-1', checkinNumber: 1, pointsAwarded: 25, badgeAwarded: false, createdAt: new Date() },
        ],
      });

      const result = await service.getEvent('event-123', mockUserId);

      expect(result.id).toBe('event-123');
      expect(result.isConfirmed).toBe(true);
      expect(result.userCheckInsCompleted).toBe(1);
    });

    it('should return event with badge details', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        badge: { id: 'badge-1', name: 'Participante', description: 'Desc', iconUrl: 'url' },
        _count: { confirmations: 10, checkIns: 25, comments: 5 },
        confirmations: [],
        checkIns: [],
      });

      const result = await service.getEvent('event-123', mockUserId);

      expect(result.badge).toBeDefined();
      expect(result.badge?.name).toBe('Participante');
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.getEvent('invalid-id', mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return confirmedAt as null when not confirmed', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        badge: null,
        _count: { confirmations: 10, checkIns: 25, comments: 5 },
        confirmations: [],
        checkIns: [],
      });

      const result = await service.getEvent('event-123', mockUserId);

      expect(result.isConfirmed).toBe(false);
      expect(result.confirmedAt).toBeNull();
    });
  });

  // ==========================================
  // confirmEvent
  // ==========================================

  describe('confirmEvent', () => {
    it('should create confirmation for event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        status: 'SCHEDULED',
        _count: { confirmations: 5 },
      });
      prisma.eventConfirmation.findUnique.mockResolvedValue(null);
      prisma.eventConfirmation.create.mockResolvedValue({
        id: 'conf-1',
        confirmedAt: new Date(),
      });

      const result = await service.confirmEvent('event-123', mockUserId);

      expect(result.confirmed).toBe(true);
      expect(prisma.eventConfirmation.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.confirmEvent('invalid-id', mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if already confirmed', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        status: 'SCHEDULED',
        _count: { confirmations: 5 },
      });
      prisma.eventConfirmation.findUnique.mockResolvedValue({ id: 'conf-1' });

      await expect(
        service.confirmEvent('event-123', mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if event is ended', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        status: 'ENDED',
        _count: { confirmations: 5 },
      });

      await expect(
        service.confirmEvent('event-123', mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if event is canceled', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        status: 'CANCELED',
        _count: { confirmations: 5 },
      });

      await expect(
        service.confirmEvent('event-123', mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if event is at capacity', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        status: 'SCHEDULED',
        capacity: 10,
        _count: { confirmations: 10 },
      });

      await expect(
        service.confirmEvent('event-123', mockUserId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================================
  // removeConfirmation
  // ==========================================

  describe('removeConfirmation', () => {
    it('should remove confirmation successfully', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEventScheduled,
      });
      prisma.eventConfirmation.findUnique.mockResolvedValue({
        id: 'conf-1',
      });
      prisma.eventConfirmation.delete.mockResolvedValue({});

      const result = await service.removeConfirmation('event-scheduled', mockUserId);

      expect(result.confirmed).toBe(false);
      expect(prisma.eventConfirmation.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.removeConfirmation('invalid-id', mockUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if event is ongoing', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        status: 'ONGOING',
      });

      await expect(
        service.removeConfirmation('event-123', mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if event is ended', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEventEnded,
      });

      await expect(
        service.removeConfirmation('event-ended', mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user has no confirmation', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEventScheduled,
      });
      prisma.eventConfirmation.findUnique.mockResolvedValue(null);

      await expect(
        service.removeConfirmation('event-scheduled', mockUserId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================================
  // processCheckin
  // ==========================================

  describe('processCheckin', () => {
    const validTimestamp = Math.floor(Date.now() / 1000);
    // Create an event with startDate within the last few minutes so currentCheckinNumber = 1
    const recentStartDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const mockOngoingEvent = {
      ...mockEvent,
      startDate: recentStartDate,
      endDate: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
    };

    beforeEach(() => {
      prisma.event.findUnique.mockResolvedValue(mockOngoingEvent);
      prisma.eventCheckIn.findUnique.mockResolvedValue(null);
      prisma.eventCheckIn.findFirst.mockResolvedValue(null);
      prisma.eventCheckIn.create.mockResolvedValue({
        id: 'ci-1',
        checkinNumber: 1,
        pointsAwarded: 25,
      });
      prisma.eventCheckIn.count.mockResolvedValue(1);
    });

    it('should process valid check-in', async () => {
      const token = service.generateSecurityToken(
        'event-123',
        1,
        validTimestamp,
        'secret-123',
      );

      const result = await service.processCheckin(mockUserId, {
        eventId: 'event-123',
        checkinNumber: 1,
        securityToken: token,
        timestamp: validTimestamp,
      });

      expect(result.success).toBe(true);
      expect(result.pointsAwarded).toBeGreaterThan(0);
      expect(pointsService.creditPoints).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      const token = service.generateSecurityToken(
        'event-123',
        1,
        validTimestamp,
        'secret-123',
      );

      await expect(
        service.processCheckin(mockUserId, {
          eventId: 'event-123',
          checkinNumber: 1,
          securityToken: token,
          timestamp: validTimestamp,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject if event is not ongoing', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        status: 'SCHEDULED',
      });

      const token = service.generateSecurityToken(
        'event-123',
        1,
        validTimestamp,
        'secret-123',
      );

      await expect(
        service.processCheckin(mockUserId, {
          eventId: 'event-123',
          checkinNumber: 1,
          securityToken: token,
          timestamp: validTimestamp,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject expired token', async () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 200;
      const token = service.generateSecurityToken(
        'event-123',
        1,
        oldTimestamp,
        'secret-123',
      );

      await expect(
        service.processCheckin(mockUserId, {
          eventId: 'event-123',
          checkinNumber: 1,
          securityToken: token,
          timestamp: oldTimestamp,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject future timestamp', async () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 200;
      const token = service.generateSecurityToken(
        'event-123',
        1,
        futureTimestamp,
        'secret-123',
      );

      await expect(
        service.processCheckin(mockUserId, {
          eventId: 'event-123',
          checkinNumber: 1,
          securityToken: token,
          timestamp: futureTimestamp,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid token', async () => {
      await expect(
        service.processCheckin(mockUserId, {
          eventId: 'event-123',
          checkinNumber: 1,
          securityToken: 'invalid-token',
          timestamp: validTimestamp,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate check-in', async () => {
      const token = service.generateSecurityToken(
        'event-123',
        1,
        validTimestamp,
        'secret-123',
      );

      prisma.eventCheckIn.findUnique.mockResolvedValue({ id: 'ci-1' });

      await expect(
        service.processCheckin(mockUserId, {
          eventId: 'event-123',
          checkinNumber: 1,
          securityToken: token,
          timestamp: validTimestamp,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if event is paused', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockOngoingEvent,
        isPaused: true,
      });

      const token = service.generateSecurityToken(
        'event-123',
        1,
        validTimestamp,
        'secret-123',
      );

      await expect(
        service.processCheckin(mockUserId, {
          eventId: 'event-123',
          checkinNumber: 1,
          securityToken: token,
          timestamp: validTimestamp,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should apply subscription multiplier to points', async () => {
      subscriptionsService.getBenefits.mockResolvedValue({
        mutators: { points_events: 1.5 },
      });

      const token = service.generateSecurityToken(
        'event-123',
        1,
        validTimestamp,
        'secret-123',
      );

      const result = await service.processCheckin(mockUserId, {
        eventId: 'event-123',
        checkinNumber: 1,
        securityToken: token,
        timestamp: validTimestamp,
      });

      // Base: 100/4 = 25, with 1.5x = 37
      expect(result.pointsAwarded).toBe(37);
    });

    it('should use base points if subscription service fails', async () => {
      subscriptionsService.getBenefits.mockRejectedValue(new Error('No subscription'));

      const token = service.generateSecurityToken(
        'event-123',
        1,
        validTimestamp,
        'secret-123',
      );

      const result = await service.processCheckin(mockUserId, {
        eventId: 'event-123',
        checkinNumber: 1,
        securityToken: token,
        timestamp: validTimestamp,
      });

      // Base: 100/4 = 25
      expect(result.pointsAwarded).toBe(25);
    });

    it('should reject if interval not respected', async () => {
      const token = service.generateSecurityToken(
        'event-123',
        2,
        validTimestamp,
        'secret-123',
      );

      // Mock that we're on check-in 2
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        startDate: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
      });

      // Last check-in was 10 minutes ago (interval is 30 min)
      prisma.eventCheckIn.findFirst.mockResolvedValue({
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
      });

      await expect(
        service.processCheckin(mockUserId, {
          eventId: 'event-123',
          checkinNumber: 2,
          securityToken: token,
          timestamp: validTimestamp,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should award badge on first check-in with FIRST_CHECKIN criteria', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockOngoingEvent,
        badgeId: 'badge-1',
        badgeCriteria: 'FIRST_CHECKIN',
      });
      prisma.eventCheckIn.count.mockResolvedValue(1);
      prisma.userBadge.findUnique.mockResolvedValue(null);
      prisma.userBadge.create.mockResolvedValue({});
      prisma.eventCheckIn.update.mockResolvedValue({});

      const token = service.generateSecurityToken(
        'event-123',
        1,
        validTimestamp,
        'secret-123',
      );

      const result = await service.processCheckin(mockUserId, {
        eventId: 'event-123',
        checkinNumber: 1,
        securityToken: token,
        timestamp: validTimestamp,
      });

      expect(result.badgeAwarded).toBe(true);
    });

    it('should award badge on all check-ins with ALL_CHECKINS criteria', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockOngoingEvent,
        badgeId: 'badge-1',
        badgeCriteria: 'ALL_CHECKINS',
        checkinsCount: 4,
      });
      prisma.eventCheckIn.count.mockResolvedValue(4); // All 4 completed
      prisma.userBadge.findUnique.mockResolvedValue(null);
      prisma.userBadge.create.mockResolvedValue({});
      prisma.eventCheckIn.update.mockResolvedValue({});

      const token = service.generateSecurityToken(
        'event-123',
        1,
        validTimestamp,
        'secret-123',
      );

      const result = await service.processCheckin(mockUserId, {
        eventId: 'event-123',
        checkinNumber: 1,
        securityToken: token,
        timestamp: validTimestamp,
      });

      expect(result.badgeAwarded).toBe(true);
    });

    it('should not award badge if user already has it', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockOngoingEvent,
        badgeId: 'badge-1',
        badgeCriteria: 'AT_LEAST_ONE',
      });
      prisma.eventCheckIn.count.mockResolvedValue(1);
      prisma.userBadge.findUnique.mockResolvedValue({ id: 'ub-1' }); // Already has badge

      const token = service.generateSecurityToken(
        'event-123',
        1,
        validTimestamp,
        'secret-123',
      );

      const result = await service.processCheckin(mockUserId, {
        eventId: 'event-123',
        checkinNumber: 1,
        securityToken: token,
        timestamp: validTimestamp,
      });

      expect(result.badgeAwarded).toBe(false);
    });
  });

  // ==========================================
  // getComments
  // ==========================================

  describe('getComments', () => {
    it('should return paginated comments', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'event-123' });
      prisma.eventComment.findMany.mockResolvedValue([
        {
          id: 'comment-1',
          text: 'Comentario teste',
          createdAt: new Date(),
          user: { id: mockUserId, name: 'User', avatarUrl: null },
        },
      ]);
      prisma.eventComment.count.mockResolvedValue(1);

      const result = await service.getComments('event-123', { page: 1, perPage: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].text).toBe('Comentario teste');
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.getComments('invalid-id', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================
  // createComment
  // ==========================================

  describe('createComment', () => {
    it('should create comment successfully', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'event-123', status: 'ONGOING' });
      prisma.eventComment.create.mockResolvedValue({
        id: 'comment-1',
        text: 'Novo comentario',
        createdAt: new Date(),
        user: { id: mockUserId, name: 'User', avatarUrl: null },
      });

      const result = await service.createComment('event-123', mockUserId, {
        text: 'Novo comentario',
      });

      expect(result.text).toBe('Novo comentario');
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.createComment('invalid-id', mockUserId, { text: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================
  // adminListEvents
  // ==========================================

  describe('adminListEvents', () => {
    it('should return all events for admin', async () => {
      const events = [
        { ...mockEvent, _count: { confirmations: 10, checkIns: 5 } },
        { ...mockEventDraft, _count: { confirmations: 0, checkIns: 0 } },
      ];
      prisma.event.findMany.mockResolvedValue(events);
      prisma.event.count.mockResolvedValue(2);

      const result = await service.adminListEvents(mockAssociationId, {});

      expect(result.data).toHaveLength(2);
      expect(result.data[0].confirmationsCount).toBe(10);
    });

    it('should filter by status', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.adminListEvents(mockAssociationId, {
        status: 'DRAFT' as EventStatus,
      });

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'DRAFT',
          }),
        }),
      );
    });

    it('should search by title and description', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      await service.adminListEvents(mockAssociationId, {
        search: 'festa',
      });

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'festa', mode: 'insensitive' } },
              { description: { contains: 'festa', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });
  });

  // ==========================================
  // createEvent (Admin)
  // ==========================================

  describe('createEvent', () => {
    const createDto = {
      title: 'Novo Evento',
      description: 'Descricao do novo evento teste',
      category: 'SOCIAL' as EventCategory,
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 172800000).toISOString(),
      locationName: 'Local Teste',
      pointsTotal: 200,
      checkinsCount: 2,
    };

    it('should create event as draft', async () => {
      prisma.event.create.mockResolvedValue({
        ...mockEventDraft,
        ...createDto,
      });

      const result = await service.createEvent(
        mockAssociationId,
        mockAdminId,
        createDto,
      );

      expect(result.status).toBe('DRAFT');
      expect(prisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'DRAFT',
            qrSecret: expect.any(String),
          }),
        }),
      );
    });

    it('should create event with badge', async () => {
      prisma.badge.findUnique.mockResolvedValue({ id: 'badge-1' });
      prisma.event.create.mockResolvedValue({
        ...mockEventDraft,
        ...createDto,
        badgeId: 'badge-1',
      });

      await service.createEvent(mockAssociationId, mockAdminId, {
        ...createDto,
        badgeId: 'badge-1',
      });

      expect(prisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            badgeId: 'badge-1',
          }),
        }),
      );
    });

    it('should reject if badge not found', async () => {
      prisma.badge.findUnique.mockResolvedValue(null);

      await expect(
        service.createEvent(mockAssociationId, mockAdminId, {
          ...createDto,
          badgeId: 'invalid-badge',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if start date is in the past', async () => {
      const invalidDto = {
        ...createDto,
        startDate: new Date(Date.now() - 86400000).toISOString(),
      };

      await expect(
        service.createEvent(mockAssociationId, mockAdminId, invalidDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if end date is before start date', async () => {
      const invalidDto = {
        ...createDto,
        endDate: createDto.startDate,
        startDate: new Date(Date.now() + 172800000).toISOString(),
      };

      await expect(
        service.createEvent(mockAssociationId, mockAdminId, invalidDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================================
  // updateEvent (Admin)
  // ==========================================

  describe('updateEvent', () => {
    it('should update event successfully', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEventDraft);
      prisma.event.update.mockResolvedValue({
        ...mockEventDraft,
        title: 'Titulo Atualizado',
      });

      const result = await service.updateEvent('event-draft', mockAssociationId, {
        title: 'Titulo Atualizado',
      });

      expect(result.title).toBe('Titulo Atualizado');
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.updateEvent('invalid-id', mockAssociationId, { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for different association', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEventDraft,
        associationId: 'other-assoc',
      });

      await expect(
        service.updateEvent('event-draft', mockAssociationId, { title: 'Test' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject if event is ended', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEventEnded);

      await expect(
        service.updateEvent('event-ended', mockAssociationId, { title: 'Test' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if event is canceled', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        status: 'CANCELED',
      });

      await expect(
        service.updateEvent('event-123', mockAssociationId, { title: 'Test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================================
  // publishEvent (Admin)
  // ==========================================

  describe('publishEvent', () => {
    it('should publish draft event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEventDraft);
      prisma.event.update.mockResolvedValue({
        ...mockEventDraft,
        status: 'SCHEDULED',
        publishedAt: new Date(),
      });

      const result = await service.publishEvent('event-draft', mockAssociationId);

      expect(result.status).toBe('SCHEDULED');
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.publishEvent('invalid-id', mockAssociationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject if not a draft', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.publishEvent('event-123', mockAssociationId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if different association', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEventDraft,
        associationId: 'other-assoc',
      });

      await expect(
        service.publishEvent('event-draft', mockAssociationId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================================
  // cancelEvent (Admin)
  // ==========================================

  describe('cancelEvent', () => {
    it('should cancel event with reason', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.event.update.mockResolvedValue({
        ...mockEvent,
        status: 'CANCELED',
        cancelReason: 'Motivo do cancelamento',
      });

      const result = await service.cancelEvent(
        'event-123',
        mockAssociationId,
        'Motivo do cancelamento',
      );

      expect(result.status).toBe('CANCELED');
      expect(result.cancelReason).toBe('Motivo do cancelamento');
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelEvent('invalid-id', mockAssociationId, 'Motivo'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject if already ended', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEventEnded);

      await expect(
        service.cancelEvent('event-ended', mockAssociationId, 'Motivo'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if already canceled', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        status: 'CANCELED',
      });

      await expect(
        service.cancelEvent('event-123', mockAssociationId, 'Motivo'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if different association', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        associationId: 'other-assoc',
      });

      await expect(
        service.cancelEvent('event-123', mockAssociationId, 'Motivo'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================================
  // pauseEvent (Admin)
  // ==========================================

  describe('pauseEvent', () => {
    it('should pause ongoing event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.event.update.mockResolvedValue({
        ...mockEvent,
        isPaused: true,
      });

      const result = await service.pauseEvent('event-123', mockAssociationId, true);

      expect(result.isPaused).toBe(true);
    });

    it('should unpause ongoing event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        isPaused: true,
      });
      prisma.event.update.mockResolvedValue({
        ...mockEvent,
        isPaused: false,
      });

      const result = await service.pauseEvent('event-123', mockAssociationId, false);

      expect(result.isPaused).toBe(false);
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.pauseEvent('invalid-id', mockAssociationId, true),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject if not ongoing', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEventScheduled);

      await expect(
        service.pauseEvent('event-scheduled', mockAssociationId, true),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if different association', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        associationId: 'other-assoc',
      });

      await expect(
        service.pauseEvent('event-123', mockAssociationId, true),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================================
  // manualCheckin (Admin)
  // ==========================================

  describe('manualCheckin', () => {
    it('should create manual check-in', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.eventCheckIn.findUnique.mockResolvedValue(null);
      prisma.eventCheckIn.create.mockResolvedValue({
        id: 'ci-1',
        checkinNumber: 1,
        pointsAwarded: 25,
      });
      prisma.eventCheckIn.count.mockResolvedValue(1);

      const result = await service.manualCheckin(
        'event-123',
        mockAssociationId,
        mockAdminId,
        {
          userId: mockUserId,
          checkinNumber: 1,
          reason: 'Chegou atrasado',
        },
      );

      expect(result.success).toBe(true);
      expect(result.pointsAwarded).toBe(25);
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.manualCheckin('invalid-id', mockAssociationId, mockAdminId, {
          userId: mockUserId,
          checkinNumber: 1,
          reason: 'Manual check-in for testing',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for different association', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        associationId: 'other-assoc',
      });

      await expect(
        service.manualCheckin('event-123', mockAssociationId, mockAdminId, {
          userId: mockUserId,
          checkinNumber: 1,
          reason: 'Manual check-in for testing',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.manualCheckin('event-123', mockAssociationId, mockAdminId, {
          userId: 'invalid-user',
          checkinNumber: 1,
          reason: 'Manual check-in for testing',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for user from different association', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        associationId: 'other-assoc',
      });

      await expect(
        service.manualCheckin('event-123', mockAssociationId, mockAdminId, {
          userId: mockUserId,
          checkinNumber: 1,
          reason: 'Manual check-in for testing',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject duplicate manual check-in', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.eventCheckIn.findUnique.mockResolvedValue({ id: 'ci-1' });

      await expect(
        service.manualCheckin('event-123', mockAssociationId, mockAdminId, {
          userId: mockUserId,
          checkinNumber: 1,
          reason: 'Manual check-in for testing',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================================
  // deleteEvent (Admin)
  // ==========================================

  describe('deleteEvent', () => {
    it('should delete draft event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEventDraft);
      prisma.event.delete.mockResolvedValue(mockEventDraft);

      const result = await service.deleteEvent('event-draft', mockAssociationId);

      expect(result.deleted).toBe(true);
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteEvent('invalid-id', mockAssociationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject if not a draft', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.deleteEvent('event-123', mockAssociationId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if different association', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEventDraft,
        associationId: 'other-assoc',
      });

      await expect(
        service.deleteEvent('event-draft', mockAssociationId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================================
  // getAnalytics (Admin)
  // ==========================================

  describe('getAnalytics', () => {
    it('should return event analytics', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-123',
        associationId: mockAssociationId,
        title: 'Evento Teste',
        checkinsCount: 4,
        pointsTotal: 100,
        badgeId: 'badge-1',
      });
      prisma.eventConfirmation.count.mockResolvedValue(50);
      prisma.eventCheckIn.count.mockResolvedValue(30);
      prisma.eventCheckIn.groupBy.mockResolvedValue([
        { userId: 'u1', _count: 2 },
        { userId: 'u2', _count: 1 },
      ]);
      prisma.eventCheckIn.findMany.mockResolvedValue([]);
      prisma.eventCheckIn.aggregate.mockResolvedValue({ _sum: { pointsAwarded: 750 } });
      prisma.user.count.mockResolvedValue(100);

      const result = await service.getAnalytics('event-123', mockAssociationId);

      expect(result.metrics.confirmations).toBe(50);
      expect(result.metrics.totalCheckIns).toBe(30);
      expect(result.metrics.uniqueUsers).toBe(2);
      expect(result.metrics.pointsDistributed).toBe(750);
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.getAnalytics('invalid-id', mockAssociationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for different association', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        associationId: 'other-assoc',
      });

      await expect(
        service.getAnalytics('event-123', mockAssociationId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle events without badge', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-123',
        associationId: mockAssociationId,
        title: 'Evento Teste',
        checkinsCount: 4,
        pointsTotal: 100,
        badgeId: null,
      });
      prisma.eventConfirmation.count.mockResolvedValue(10);
      prisma.eventCheckIn.count.mockResolvedValue(5);
      prisma.eventCheckIn.groupBy.mockResolvedValue([]);
      prisma.eventCheckIn.findMany.mockResolvedValue([]);
      prisma.eventCheckIn.aggregate.mockResolvedValue({ _sum: { pointsAwarded: null } });
      prisma.user.count.mockResolvedValue(100);

      const result = await service.getAnalytics('event-123', mockAssociationId);

      expect(result.metrics.badgesAwarded).toBe(0);
      expect(result.metrics.pointsDistributed).toBe(0);
    });
  });

  // ==========================================
  // getParticipants (Admin)
  // ==========================================

  describe('getParticipants', () => {
    it('should return paginated participants', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-123',
        associationId: mockAssociationId,
        checkinsCount: 4,
      });
      prisma.$queryRaw.mockResolvedValueOnce([
        { id: 'u1', name: 'User 1', email: 'u1@test.com', avatar_url: null },
      ]);
      prisma.$queryRaw.mockResolvedValueOnce([{ count: 1 }]);
      prisma.eventConfirmation.findMany.mockResolvedValue([
        { userId: 'u1', confirmedAt: new Date() },
      ]);
      prisma.eventCheckIn.findMany.mockResolvedValue([
        { userId: 'u1', checkinNumber: 1, pointsAwarded: 25, badgeAwarded: false, createdAt: new Date() },
      ]);

      const result = await service.getParticipants('event-123', mockAssociationId);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('User 1');
      expect(result.data[0].confirmed).toBe(true);
      expect(result.data[0].checkInsCompleted).toBe(1);
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.getParticipants('invalid-id', mockAssociationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for different association', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        associationId: 'other-assoc',
      });

      await expect(
        service.getParticipants('event-123', mockAssociationId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================================
  // transitionEventStatuses
  // ==========================================

  describe('transitionEventStatuses', () => {
    it('should transition scheduled events to ongoing', async () => {
      prisma.event.updateMany.mockResolvedValue({ count: 2 });

      await service.transitionEventStatuses();

      expect(prisma.event.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SCHEDULED',
            startDate: expect.any(Object),
          }),
          data: { status: 'ONGOING' },
        }),
      );
    });

    it('should transition ongoing events to ended', async () => {
      prisma.event.updateMany.mockResolvedValue({ count: 1 });

      await service.transitionEventStatuses();

      expect(prisma.event.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ONGOING',
            endDate: expect.any(Object),
          }),
          data: { status: 'ENDED' },
        }),
      );
    });
  });

  // ==========================================
  // getOngoingEvents
  // ==========================================

  describe('getOngoingEvents', () => {
    it('should return all ongoing events', async () => {
      prisma.event.findMany.mockResolvedValue([
        { id: 'e1', status: 'ONGOING', isPaused: false },
        { id: 'e2', status: 'ONGOING', isPaused: true },
      ]);

      const result = await service.getOngoingEvents();

      expect(result).toHaveLength(2);
    });

    it('should filter by association', async () => {
      prisma.event.findMany.mockResolvedValue([
        { id: 'e1', status: 'ONGOING', isPaused: false },
      ]);

      await service.getOngoingEvents(mockAssociationId);

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ONGOING',
            associationId: mockAssociationId,
          }),
        }),
      );
    });
  });

  // ==========================================
  // getEventForDisplay
  // ==========================================

  describe('getEventForDisplay', () => {
    it('should return event data for display', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        association: { name: 'Assoc Teste', logoUrl: 'logo.png' },
        _count: { checkIns: 10 },
      });

      const result = await service.getEventForDisplay('event-123');

      expect(result?.title).toBe('Evento Teste');
      expect(result?.association.name).toBe('Assoc Teste');
    });

    it('should return null for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      const result = await service.getEventForDisplay('invalid-id');

      expect(result).toBeNull();
    });
  });

  // ==========================================
  // exportToCsv
  // ==========================================

  describe('exportToCsv', () => {
    it('should generate CSV with participants', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-123',
        title: 'Evento Teste',
        associationId: mockAssociationId,
        checkinsCount: 4,
      });
      prisma.$queryRaw.mockResolvedValueOnce([
        { id: 'u1', name: 'User 1', email: 'u1@test.com', avatar_url: null },
      ]);
      prisma.$queryRaw.mockResolvedValueOnce([{ count: 1 }]);
      prisma.eventConfirmation.findMany.mockResolvedValue([
        { userId: 'u1', confirmedAt: new Date('2025-01-15T10:00:00Z') },
      ]);
      prisma.eventCheckIn.findMany.mockResolvedValue([
        { userId: 'u1', checkinNumber: 1, pointsAwarded: 25, badgeAwarded: true, createdAt: new Date() },
      ]);

      const result = await service.exportToCsv('event-123', mockAssociationId);

      expect(result).toContain('Nome,Email,Confirmado');
      expect(result).toContain('User 1');
      expect(result).toContain('u1@test.com');
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.exportToCsv('invalid-id', mockAssociationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for different association', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        associationId: 'other-assoc',
      });

      await expect(
        service.exportToCsv('event-123', mockAssociationId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================================
  // exportToPrintHtml
  // ==========================================

  describe('exportToPrintHtml', () => {
    it('should generate HTML report', async () => {
      // For exportToPrintHtml, we need to mock getAnalytics and getParticipants
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-123',
        title: 'Evento Teste',
        associationId: mockAssociationId,
        startDate: new Date('2025-01-15T10:00:00Z'),
        endDate: new Date('2025-01-15T18:00:00Z'),
        locationName: 'Salao Principal',
        pointsTotal: 100,
        checkinsCount: 4,
        badgeId: null,
      });
      prisma.eventConfirmation.count.mockResolvedValue(10);
      prisma.eventCheckIn.count.mockResolvedValue(5);
      prisma.eventCheckIn.groupBy.mockResolvedValue([{ userId: 'u1', _count: 1 }]);
      prisma.eventCheckIn.findMany.mockResolvedValue([]);
      prisma.eventCheckIn.aggregate.mockResolvedValue({ _sum: { pointsAwarded: 125 } });
      prisma.user.count.mockResolvedValue(100);
      prisma.$queryRaw.mockResolvedValueOnce([]);
      prisma.$queryRaw.mockResolvedValueOnce([{ count: 0 }]);
      prisma.eventConfirmation.findMany.mockResolvedValue([]);

      const result = await service.exportToPrintHtml('event-123', mockAssociationId);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('Evento Teste');
      expect(result).toContain('Salao Principal');
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.exportToPrintHtml('invalid-id', mockAssociationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for different association', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        associationId: 'other-assoc',
      });

      await expect(
        service.exportToPrintHtml('event-123', mockAssociationId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================================
  // generateSecurityToken
  // ==========================================

  describe('generateSecurityToken', () => {
    it('should generate consistent tokens for same input', () => {
      const token1 = service.generateSecurityToken('event-1', 1, 1234567890, 'secret');
      const token2 = service.generateSecurityToken('event-1', 1, 1234567890, 'secret');

      expect(token1).toBe(token2);
    });

    it('should generate different tokens for different inputs', () => {
      const token1 = service.generateSecurityToken('event-1', 1, 1234567890, 'secret');
      const token2 = service.generateSecurityToken('event-1', 2, 1234567890, 'secret');
      const token3 = service.generateSecurityToken('event-2', 1, 1234567890, 'secret');

      expect(token1).not.toBe(token2);
      expect(token1).not.toBe(token3);
    });

    it('should generate different tokens for different timestamps', () => {
      const token1 = service.generateSecurityToken('event-1', 1, 1234567890, 'secret');
      const token2 = service.generateSecurityToken('event-1', 1, 1234567891, 'secret');

      expect(token1).not.toBe(token2);
    });

    it('should generate different tokens for different secrets', () => {
      const token1 = service.generateSecurityToken('event-1', 1, 1234567890, 'secret1');
      const token2 = service.generateSecurityToken('event-1', 1, 1234567890, 'secret2');

      expect(token1).not.toBe(token2);
    });
  });
});
