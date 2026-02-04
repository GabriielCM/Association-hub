import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock @prisma/client and guards before importing controller
vi.mock('@prisma/client', () => ({
  EventStatus: { DRAFT: 'DRAFT', SCHEDULED: 'SCHEDULED', ONGOING: 'ONGOING', ENDED: 'ENDED', CANCELED: 'CANCELED' },
  EventCategory: { SOCIAL: 'SOCIAL', SPORTS: 'SPORTS', CULTURAL: 'CULTURAL', EDUCATIONAL: 'EDUCATIONAL', NETWORKING: 'NETWORKING', GASTRO: 'GASTRO', MUSIC: 'MUSIC', ART: 'ART', GAMES: 'GAMES', INSTITUTIONAL: 'INSTITUTIONAL' },
  BadgeCriteria: { FIRST_CHECKIN: 'FIRST_CHECKIN', ALL_CHECKINS: 'ALL_CHECKINS', AT_LEAST_ONE: 'AT_LEAST_ONE' },
}));

vi.mock('../../../common/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: vi.fn().mockImplementation(() => ({
    canActivate: () => true,
  })),
}));

import { EventsController } from '../events.controller';
import { EventsService } from '../events.service';
import { EventFilter } from '../dto/event-query.dto';

const mockUserId = 'user-123';
const mockAssociationId = 'assoc-123';

import type { JwtPayload } from '../../../common/types';

// JwtPayload format for @CurrentUser() decorator
const mockUser: JwtPayload = {
  sub: mockUserId,
  email: 'user@test.com',
  role: 'USER',
  associationId: mockAssociationId,
};

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: any;

  beforeEach(() => {
    eventsService = {
      listEvents: vi.fn(),
      getEvent: vi.fn(),
      confirmEvent: vi.fn(),
      removeConfirmation: vi.fn(),
      processCheckin: vi.fn(),
      getComments: vi.fn(),
      createComment: vi.fn(),
    };

    controller = new EventsController(eventsService);
  });

  // ==========================================
  // listEvents
  // ==========================================

  describe('listEvents', () => {
    it('should call eventsService.listEvents with correct params', async () => {
      const query = { page: 1, perPage: 20 };
      eventsService.listEvents.mockResolvedValue({ data: [], meta: {} });

      await controller.listEvents(mockUser, query);

      expect(eventsService.listEvents).toHaveBeenCalledWith(
        mockUserId,
        mockAssociationId,
        query,
      );
    });

    it('should return events list', async () => {
      const mockEvents = {
        data: [{ id: 'event-1', title: 'Test Event' }],
        meta: { totalCount: 1 },
      };
      eventsService.listEvents.mockResolvedValue(mockEvents);

      const result = await controller.listEvents(mockUser, {});

      expect(result).toEqual(mockEvents);
    });

    it('should pass filter params to service', async () => {
      const query = { filter: EventFilter.UPCOMING, category: 'SOCIAL' as any };
      eventsService.listEvents.mockResolvedValue({ data: [], meta: {} });

      await controller.listEvents(mockUser, query);

      expect(eventsService.listEvents).toHaveBeenCalledWith(
        mockUserId,
        mockAssociationId,
        query,
      );
    });

    it('should pass search params to service', async () => {
      const query = { search: 'festa' };
      eventsService.listEvents.mockResolvedValue({ data: [], meta: {} });

      await controller.listEvents(mockUser, query);

      expect(eventsService.listEvents).toHaveBeenCalledWith(
        mockUserId,
        mockAssociationId,
        query,
      );
    });
  });

  // ==========================================
  // getEvent
  // ==========================================

  describe('getEvent', () => {
    it('should call eventsService.getEvent with correct params', async () => {
      eventsService.getEvent.mockResolvedValue({ id: 'event-123' });

      await controller.getEvent(mockUser, 'event-123');

      expect(eventsService.getEvent).toHaveBeenCalledWith('event-123', mockUserId);
    });

    it('should return event details', async () => {
      const mockEvent = {
        id: 'event-123',
        title: 'Test Event',
        isConfirmed: true,
      };
      eventsService.getEvent.mockResolvedValue(mockEvent);

      const result = await controller.getEvent(mockUser, 'event-123');

      expect(result).toEqual(mockEvent);
    });
  });

  // ==========================================
  // confirmEvent
  // ==========================================

  describe('confirmEvent', () => {
    it('should call eventsService.confirmEvent with correct params', async () => {
      eventsService.confirmEvent.mockResolvedValue({ confirmed: true });

      await controller.confirmEvent(mockUser, 'event-123');

      expect(eventsService.confirmEvent).toHaveBeenCalledWith('event-123', mockUserId);
    });

    it('should return confirmation result', async () => {
      const mockResult = { confirmed: true, confirmedAt: new Date() };
      eventsService.confirmEvent.mockResolvedValue(mockResult);

      const result = await controller.confirmEvent(mockUser, 'event-123');

      expect(result).toEqual(mockResult);
    });
  });

  // ==========================================
  // removeConfirmation
  // ==========================================

  describe('removeConfirmation', () => {
    it('should call eventsService.removeConfirmation with correct params', async () => {
      eventsService.removeConfirmation.mockResolvedValue({ confirmed: false });

      await controller.removeConfirmation(mockUser, 'event-123');

      expect(eventsService.removeConfirmation).toHaveBeenCalledWith(
        'event-123',
        mockUserId,
      );
    });

    it('should return removal result', async () => {
      const mockResult = { confirmed: false };
      eventsService.removeConfirmation.mockResolvedValue(mockResult);

      const result = await controller.removeConfirmation(mockUser, 'event-123');

      expect(result).toEqual(mockResult);
    });
  });

  // ==========================================
  // checkin
  // ==========================================

  describe('checkin', () => {
    it('should call eventsService.processCheckin with correct params', async () => {
      const dto = {
        eventId: 'other-event', // This should be overridden
        checkinNumber: 1,
        securityToken: 'token-123',
        timestamp: 1234567890,
      };
      eventsService.processCheckin.mockResolvedValue({ success: true });

      await controller.checkin(mockUser, 'event-123', dto);

      expect(eventsService.processCheckin).toHaveBeenCalledWith(mockUserId, {
        ...dto,
        eventId: 'event-123', // Overridden from URL
      });
    });

    it('should override eventId from URL for security', async () => {
      const dto = {
        eventId: 'malicious-event',
        checkinNumber: 1,
        securityToken: 'token-123',
        timestamp: 1234567890,
      };
      eventsService.processCheckin.mockResolvedValue({ success: true });

      await controller.checkin(mockUser, 'event-123', dto);

      expect(eventsService.processCheckin).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({ eventId: 'event-123' }),
      );
    });

    it('should return check-in result', async () => {
      const dto = {
        eventId: 'event-123',
        checkinNumber: 1,
        securityToken: 'token-123',
        timestamp: 1234567890,
      };
      const mockResult = {
        success: true,
        pointsAwarded: 25,
        badgeAwarded: false,
      };
      eventsService.processCheckin.mockResolvedValue(mockResult);

      const result = await controller.checkin(mockUser, 'event-123', dto);

      expect(result).toEqual(mockResult);
    });
  });

  // ==========================================
  // getComments
  // ==========================================

  describe('getComments', () => {
    it('should call eventsService.getComments with correct params', async () => {
      const query = { page: 1, perPage: 20 };
      eventsService.getComments.mockResolvedValue({ data: [], meta: {} });

      await controller.getComments('event-123', query);

      expect(eventsService.getComments).toHaveBeenCalledWith('event-123', query);
    });

    it('should return comments list', async () => {
      const mockComments = {
        data: [{ id: 'comment-1', text: 'Test comment' }],
        meta: { totalCount: 1 },
      };
      eventsService.getComments.mockResolvedValue(mockComments);

      const result = await controller.getComments('event-123', {});

      expect(result).toEqual(mockComments);
    });
  });

  // ==========================================
  // createComment
  // ==========================================

  describe('createComment', () => {
    it('should call eventsService.createComment with correct params', async () => {
      const dto = { text: 'New comment' };
      eventsService.createComment.mockResolvedValue({ id: 'comment-1', text: 'New comment' });

      await controller.createComment(mockUser, 'event-123', dto);

      expect(eventsService.createComment).toHaveBeenCalledWith(
        'event-123',
        mockUserId,
        dto,
      );
    });

    it('should return created comment', async () => {
      const dto = { text: 'New comment' };
      const mockComment = {
        id: 'comment-1',
        text: 'New comment',
        createdAt: new Date(),
        user: { id: mockUserId, name: 'User' },
      };
      eventsService.createComment.mockResolvedValue(mockComment);

      const result = await controller.createComment(mockUser, 'event-123', dto);

      expect(result).toEqual(mockComment);
    });
  });
});
