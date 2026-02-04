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

import { AdminEventsController } from '../admin-events.controller';
import { EventsService } from '../events.service';
import { Response } from 'express';

import type { JwtPayload } from '../../../common/types';

const mockUserId = 'admin-123';
const mockAssociationId = 'assoc-123';

// JwtPayload format for @CurrentUser() decorator
const mockUser: JwtPayload = {
  sub: mockUserId,
  email: 'admin@test.com',
  role: 'ADMIN',
  associationId: mockAssociationId,
};

const createMockResponse = () => {
  return {
    setHeader: vi.fn(),
    send: vi.fn(),
  } as unknown as Response;
};

describe('AdminEventsController', () => {
  let controller: AdminEventsController;
  let eventsService: any;

  beforeEach(() => {
    eventsService = {
      adminListEvents: vi.fn(),
      createEvent: vi.fn(),
      updateEvent: vi.fn(),
      deleteEvent: vi.fn(),
      publishEvent: vi.fn(),
      cancelEvent: vi.fn(),
      pauseEvent: vi.fn(),
      manualCheckin: vi.fn(),
      getAnalytics: vi.fn(),
      getParticipants: vi.fn(),
      exportToCsv: vi.fn(),
      exportToPrintHtml: vi.fn(),
    };

    controller = new AdminEventsController(eventsService);
  });

  // ==========================================
  // listEvents
  // ==========================================

  describe('listEvents', () => {
    it('should call eventsService.adminListEvents with correct params', async () => {
      const query = { page: 1, perPage: 20 };
      eventsService.adminListEvents.mockResolvedValue({ data: [], meta: {} });

      await controller.listEvents(mockUser, query);

      expect(eventsService.adminListEvents).toHaveBeenCalledWith(
        mockAssociationId,
        query,
      );
    });

    it('should return events list with all statuses', async () => {
      const mockEvents = {
        data: [
          { id: 'event-1', status: 'DRAFT' },
          { id: 'event-2', status: 'ONGOING' },
        ],
        meta: { totalCount: 2 },
      };
      eventsService.adminListEvents.mockResolvedValue(mockEvents);

      const result = await controller.listEvents(mockUser, {});

      expect(result).toEqual(mockEvents);
    });

    it('should pass status filter to service', async () => {
      const query = { status: 'DRAFT' as any };
      eventsService.adminListEvents.mockResolvedValue({ data: [], meta: {} });

      await controller.listEvents(mockUser, query);

      expect(eventsService.adminListEvents).toHaveBeenCalledWith(
        mockAssociationId,
        query,
      );
    });
  });

  // ==========================================
  // createEvent
  // ==========================================

  describe('createEvent', () => {
    const createDto = {
      title: 'Novo Evento',
      description: 'Descricao',
      category: 'SOCIAL' as any,
      startDate: '2025-02-01T10:00:00Z',
      endDate: '2025-02-01T18:00:00Z',
      locationName: 'Local',
      pointsTotal: 100,
      checkinsCount: 4,
    };

    it('should call eventsService.createEvent with correct params', async () => {
      eventsService.createEvent.mockResolvedValue({ id: 'event-123' });

      await controller.createEvent(mockUser, createDto);

      expect(eventsService.createEvent).toHaveBeenCalledWith(
        mockAssociationId,
        mockUserId,
        createDto,
      );
    });

    it('should return created event', async () => {
      const mockEvent = { id: 'event-123', ...createDto, status: 'DRAFT' };
      eventsService.createEvent.mockResolvedValue(mockEvent);

      const result = await controller.createEvent(mockUser, createDto);

      expect(result).toEqual(mockEvent);
    });
  });

  // ==========================================
  // updateEvent
  // ==========================================

  describe('updateEvent', () => {
    it('should call eventsService.updateEvent with correct params', async () => {
      const updateDto = { title: 'Updated Title' };
      eventsService.updateEvent.mockResolvedValue({ id: 'event-123', title: 'Updated Title' });

      await controller.updateEvent(mockUser, 'event-123', updateDto);

      expect(eventsService.updateEvent).toHaveBeenCalledWith(
        'event-123',
        mockAssociationId,
        updateDto,
      );
    });

    it('should return updated event', async () => {
      const mockEvent = { id: 'event-123', title: 'Updated Title' };
      eventsService.updateEvent.mockResolvedValue(mockEvent);

      const result = await controller.updateEvent(mockUser, 'event-123', {
        title: 'Updated Title',
      });

      expect(result).toEqual(mockEvent);
    });
  });

  // ==========================================
  // deleteEvent
  // ==========================================

  describe('deleteEvent', () => {
    it('should call eventsService.deleteEvent with correct params', async () => {
      eventsService.deleteEvent.mockResolvedValue({ deleted: true });

      await controller.deleteEvent(mockUser, 'event-123');

      expect(eventsService.deleteEvent).toHaveBeenCalledWith(
        'event-123',
        mockAssociationId,
      );
    });

    it('should return deletion result', async () => {
      eventsService.deleteEvent.mockResolvedValue({ deleted: true });

      const result = await controller.deleteEvent(mockUser, 'event-123');

      expect(result).toEqual({ deleted: true });
    });
  });

  // ==========================================
  // publishEvent
  // ==========================================

  describe('publishEvent', () => {
    it('should call eventsService.publishEvent with correct params', async () => {
      eventsService.publishEvent.mockResolvedValue({ id: 'event-123', status: 'SCHEDULED' });

      await controller.publishEvent(mockUser, 'event-123');

      expect(eventsService.publishEvent).toHaveBeenCalledWith(
        'event-123',
        mockAssociationId,
      );
    });

    it('should return published event', async () => {
      const mockEvent = { id: 'event-123', status: 'SCHEDULED', publishedAt: new Date() };
      eventsService.publishEvent.mockResolvedValue(mockEvent);

      const result = await controller.publishEvent(mockUser, 'event-123');

      expect(result).toEqual(mockEvent);
    });
  });

  // ==========================================
  // cancelEvent
  // ==========================================

  describe('cancelEvent', () => {
    it('should call eventsService.cancelEvent with correct params', async () => {
      eventsService.cancelEvent.mockResolvedValue({ id: 'event-123', status: 'CANCELED' });

      await controller.cancelEvent(mockUser, 'event-123', 'Motivo do cancelamento');

      expect(eventsService.cancelEvent).toHaveBeenCalledWith(
        'event-123',
        mockAssociationId,
        'Motivo do cancelamento',
      );
    });

    it('should return canceled event', async () => {
      const mockEvent = {
        id: 'event-123',
        status: 'CANCELED',
        cancelReason: 'Motivo',
      };
      eventsService.cancelEvent.mockResolvedValue(mockEvent);

      const result = await controller.cancelEvent(mockUser, 'event-123', 'Motivo');

      expect(result).toEqual(mockEvent);
    });
  });

  // ==========================================
  // pauseEvent
  // ==========================================

  describe('pauseEvent', () => {
    it('should call eventsService.pauseEvent to pause', async () => {
      eventsService.pauseEvent.mockResolvedValue({ id: 'event-123', isPaused: true });

      await controller.pauseEvent(mockUser, 'event-123', true);

      expect(eventsService.pauseEvent).toHaveBeenCalledWith(
        'event-123',
        mockAssociationId,
        true,
      );
    });

    it('should call eventsService.pauseEvent to unpause', async () => {
      eventsService.pauseEvent.mockResolvedValue({ id: 'event-123', isPaused: false });

      await controller.pauseEvent(mockUser, 'event-123', false);

      expect(eventsService.pauseEvent).toHaveBeenCalledWith(
        'event-123',
        mockAssociationId,
        false,
      );
    });

    it('should return updated event', async () => {
      const mockEvent = { id: 'event-123', isPaused: true };
      eventsService.pauseEvent.mockResolvedValue(mockEvent);

      const result = await controller.pauseEvent(mockUser, 'event-123', true);

      expect(result).toEqual(mockEvent);
    });
  });

  // ==========================================
  // manualCheckin
  // ==========================================

  describe('manualCheckin', () => {
    const manualDto = {
      userId: 'user-456',
      checkinNumber: 1,
      reason: 'Chegou atrasado',
    };

    it('should call eventsService.manualCheckin with correct params', async () => {
      eventsService.manualCheckin.mockResolvedValue({ success: true });

      await controller.manualCheckin(mockUser, 'event-123', manualDto);

      expect(eventsService.manualCheckin).toHaveBeenCalledWith(
        'event-123',
        mockAssociationId,
        mockUserId,
        manualDto,
      );
    });

    it('should return manual check-in result', async () => {
      const mockResult = {
        success: true,
        checkinNumber: 1,
        pointsAwarded: 25,
        badgeAwarded: false,
        user: { id: 'user-456', name: 'User Name' },
      };
      eventsService.manualCheckin.mockResolvedValue(mockResult);

      const result = await controller.manualCheckin(mockUser, 'event-123', manualDto);

      expect(result).toEqual(mockResult);
    });
  });

  // ==========================================
  // getAnalytics
  // ==========================================

  describe('getAnalytics', () => {
    it('should call eventsService.getAnalytics with correct params', async () => {
      eventsService.getAnalytics.mockResolvedValue({ metrics: {} });

      await controller.getAnalytics(mockUser, 'event-123');

      expect(eventsService.getAnalytics).toHaveBeenCalledWith(
        'event-123',
        mockAssociationId,
      );
    });

    it('should return analytics data', async () => {
      const mockAnalytics = {
        event: { id: 'event-123', title: 'Test' },
        metrics: {
          confirmations: 50,
          totalCheckIns: 30,
          uniqueUsers: 25,
        },
      };
      eventsService.getAnalytics.mockResolvedValue(mockAnalytics);

      const result = await controller.getAnalytics(mockUser, 'event-123');

      expect(result).toEqual(mockAnalytics);
    });
  });

  // ==========================================
  // getParticipants
  // ==========================================

  describe('getParticipants', () => {
    it('should call eventsService.getParticipants with default params', async () => {
      eventsService.getParticipants.mockResolvedValue({ data: [], meta: {} });

      await controller.getParticipants(mockUser, 'event-123');

      expect(eventsService.getParticipants).toHaveBeenCalledWith(
        'event-123',
        mockAssociationId,
        1,
        50,
      );
    });

    it('should call eventsService.getParticipants with custom params', async () => {
      eventsService.getParticipants.mockResolvedValue({ data: [], meta: {} });

      await controller.getParticipants(mockUser, 'event-123', 2, 25);

      expect(eventsService.getParticipants).toHaveBeenCalledWith(
        'event-123',
        mockAssociationId,
        2,
        25,
      );
    });

    it('should return participants data', async () => {
      const mockParticipants = {
        data: [{ id: 'user-1', name: 'User 1', checkInsCompleted: 2 }],
        meta: { totalCount: 1 },
      };
      eventsService.getParticipants.mockResolvedValue(mockParticipants);

      const result = await controller.getParticipants(mockUser, 'event-123');

      expect(result).toEqual(mockParticipants);
    });
  });

  // ==========================================
  // exportCsv
  // ==========================================

  describe('exportCsv', () => {
    it('should call eventsService.exportToCsv with correct params', async () => {
      const res = createMockResponse();
      eventsService.exportToCsv.mockResolvedValue('Nome,Email\nUser1,u1@test.com');

      await controller.exportCsv(mockUser, 'event-123', res);

      expect(eventsService.exportToCsv).toHaveBeenCalledWith(
        'event-123',
        mockAssociationId,
      );
    });

    it('should set Content-Disposition header', async () => {
      const res = createMockResponse();
      eventsService.exportToCsv.mockResolvedValue('Nome,Email');

      await controller.exportCsv(mockUser, 'event-123', res);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment'),
      );
    });

    it('should send CSV data in response', async () => {
      const res = createMockResponse();
      const csvData = 'Nome,Email\nUser1,u1@test.com';
      eventsService.exportToCsv.mockResolvedValue(csvData);

      await controller.exportCsv(mockUser, 'event-123', res);

      expect(res.send).toHaveBeenCalledWith(csvData);
    });

    it('should include event ID in filename', async () => {
      const res = createMockResponse();
      eventsService.exportToCsv.mockResolvedValue('Nome,Email');

      await controller.exportCsv(mockUser, 'event-123', res);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('event-123'),
      );
    });
  });

  // ==========================================
  // exportPdf
  // ==========================================

  describe('exportPdf', () => {
    it('should call eventsService.exportToPrintHtml with correct params', async () => {
      const res = createMockResponse();
      eventsService.exportToPrintHtml.mockResolvedValue('<!DOCTYPE html>');

      await controller.exportPdf(mockUser, 'event-123', res);

      expect(eventsService.exportToPrintHtml).toHaveBeenCalledWith(
        'event-123',
        mockAssociationId,
      );
    });

    it('should send HTML data in response', async () => {
      const res = createMockResponse();
      const htmlData = '<!DOCTYPE html><html></html>';
      eventsService.exportToPrintHtml.mockResolvedValue(htmlData);

      await controller.exportPdf(mockUser, 'event-123', res);

      expect(res.send).toHaveBeenCalledWith(htmlData);
    });
  });
});
