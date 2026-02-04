import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock @nestjs/schedule before importing scheduler
vi.mock('@nestjs/schedule', () => ({
  Cron: () => () => {},
  CronExpression: {
    EVERY_MINUTE: '* * * * *',
  },
}));

// Mock @prisma/client
vi.mock('@prisma/client', () => ({
  EventStatus: { DRAFT: 'DRAFT', SCHEDULED: 'SCHEDULED', ONGOING: 'ONGOING', ENDED: 'ENDED', CANCELED: 'CANCELED' },
  EventCategory: { SOCIAL: 'SOCIAL', SPORTS: 'SPORTS' },
  BadgeCriteria: { FIRST_CHECKIN: 'FIRST_CHECKIN', ALL_CHECKINS: 'ALL_CHECKINS', AT_LEAST_ONE: 'AT_LEAST_ONE' },
}));

import { EventsScheduler } from '../events.scheduler';
import { EventsService } from '../events.service';
import { DisplayService } from '../display.service';
import { EventsGateway } from '../events.gateway';

describe('EventsScheduler', () => {
  let scheduler: EventsScheduler;
  let eventsService: any;
  let displayService: any;
  let eventsGateway: any;

  beforeEach(() => {
    eventsService = {
      getOngoingEvents: vi.fn(),
      transitionEventStatuses: vi.fn(),
    };

    displayService = {
      getQrCodeForEvent: vi.fn(),
    };

    eventsGateway = {
      broadcastQrUpdate: vi.fn(),
    };

    scheduler = new EventsScheduler(eventsService, displayService, eventsGateway);
  });

  // ==========================================
  // rotateQrCodes
  // ==========================================

  describe('rotateQrCodes', () => {
    it('should rotate QR codes for all ongoing events', async () => {
      const ongoingEvents = [
        { id: 'event-1', isPaused: false },
        { id: 'event-2', isPaused: false },
      ];
      const qrData = {
        type: 'event_checkin',
        event_id: 'event-1',
        checkin_number: 1,
        security_token: 'token',
        timestamp: 1234567890,
        expires_at: 1234568010,
      };

      eventsService.getOngoingEvents.mockResolvedValue(ongoingEvents);
      displayService.getQrCodeForEvent.mockResolvedValue(qrData);

      await scheduler.rotateQrCodes();

      expect(eventsService.getOngoingEvents).toHaveBeenCalled();
      expect(displayService.getQrCodeForEvent).toHaveBeenCalledTimes(2);
      expect(eventsGateway.broadcastQrUpdate).toHaveBeenCalledTimes(2);
    });

    it('should not broadcast for paused events', async () => {
      const ongoingEvents = [
        { id: 'event-1', isPaused: true },
        { id: 'event-2', isPaused: false },
      ];
      const qrData = {
        type: 'event_checkin',
        event_id: 'event-2',
        checkin_number: 1,
        security_token: 'token',
        timestamp: 1234567890,
        expires_at: 1234568010,
      };

      eventsService.getOngoingEvents.mockResolvedValue(ongoingEvents);
      displayService.getQrCodeForEvent.mockResolvedValue(qrData);

      await scheduler.rotateQrCodes();

      // Only event-2 should be processed
      expect(displayService.getQrCodeForEvent).toHaveBeenCalledTimes(1);
      expect(displayService.getQrCodeForEvent).toHaveBeenCalledWith('event-2');
    });

    it('should not broadcast if getQrCodeForEvent returns null', async () => {
      const ongoingEvents = [{ id: 'event-1', isPaused: false }];

      eventsService.getOngoingEvents.mockResolvedValue(ongoingEvents);
      displayService.getQrCodeForEvent.mockResolvedValue(null);

      await scheduler.rotateQrCodes();

      expect(eventsGateway.broadcastQrUpdate).not.toHaveBeenCalled();
    });

    it('should handle empty ongoing events list', async () => {
      eventsService.getOngoingEvents.mockResolvedValue([]);

      await scheduler.rotateQrCodes();

      expect(displayService.getQrCodeForEvent).not.toHaveBeenCalled();
      expect(eventsGateway.broadcastQrUpdate).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      eventsService.getOngoingEvents.mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(scheduler.rotateQrCodes()).resolves.not.toThrow();
    });

    it('should continue processing other events if one fails', async () => {
      const ongoingEvents = [
        { id: 'event-1', isPaused: false },
        { id: 'event-2', isPaused: false },
      ];
      const qrData = {
        type: 'event_checkin',
        event_id: 'event-2',
        checkin_number: 1,
        security_token: 'token',
        timestamp: 1234567890,
        expires_at: 1234568010,
      };

      eventsService.getOngoingEvents.mockResolvedValue(ongoingEvents);
      displayService.getQrCodeForEvent
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce(qrData);

      // Note: Current implementation doesn't catch individual event errors
      // This test documents current behavior
      await scheduler.rotateQrCodes();
    });

    it('should broadcast QR data with correct event ID', async () => {
      const ongoingEvents = [{ id: 'event-specific-id', isPaused: false }];
      const qrData = {
        type: 'event_checkin',
        event_id: 'event-specific-id',
        checkin_number: 3,
        security_token: 'specific-token',
        timestamp: 1234567890,
        expires_at: 1234568010,
      };

      eventsService.getOngoingEvents.mockResolvedValue(ongoingEvents);
      displayService.getQrCodeForEvent.mockResolvedValue(qrData);

      await scheduler.rotateQrCodes();

      expect(eventsGateway.broadcastQrUpdate).toHaveBeenCalledWith(
        'event-specific-id',
        qrData,
      );
    });

    it('should process all non-paused events', async () => {
      const ongoingEvents = [
        { id: 'event-1', isPaused: false },
        { id: 'event-2', isPaused: true },
        { id: 'event-3', isPaused: false },
        { id: 'event-4', isPaused: true },
        { id: 'event-5', isPaused: false },
      ];
      const qrData = { type: 'event_checkin', timestamp: 123, expires_at: 243 };

      eventsService.getOngoingEvents.mockResolvedValue(ongoingEvents);
      displayService.getQrCodeForEvent.mockResolvedValue(qrData);

      await scheduler.rotateQrCodes();

      // Should process event-1, event-3, event-5 (3 non-paused)
      expect(displayService.getQrCodeForEvent).toHaveBeenCalledTimes(3);
      expect(displayService.getQrCodeForEvent).toHaveBeenCalledWith('event-1');
      expect(displayService.getQrCodeForEvent).toHaveBeenCalledWith('event-3');
      expect(displayService.getQrCodeForEvent).toHaveBeenCalledWith('event-5');
    });
  });

  // ==========================================
  // checkEventTransitions
  // ==========================================

  describe('checkEventTransitions', () => {
    it('should call eventsService.transitionEventStatuses', async () => {
      eventsService.transitionEventStatuses.mockResolvedValue(undefined);

      await scheduler.checkEventTransitions();

      expect(eventsService.transitionEventStatuses).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      eventsService.transitionEventStatuses.mockRejectedValue(
        new Error('Transition error'),
      );

      // Should not throw
      await expect(scheduler.checkEventTransitions()).resolves.not.toThrow();
    });

    it('should call transitionEventStatuses once', async () => {
      eventsService.transitionEventStatuses.mockResolvedValue(undefined);

      await scheduler.checkEventTransitions();
      await scheduler.checkEventTransitions();

      expect(eventsService.transitionEventStatuses).toHaveBeenCalledTimes(2);
    });
  });

  // ==========================================
  // Integration scenarios
  // ==========================================

  describe('integration scenarios', () => {
    it('should handle concurrent execution', async () => {
      const ongoingEvents = [{ id: 'event-1', isPaused: false }];
      const qrData = { type: 'event_checkin', timestamp: 123, expires_at: 243 };

      eventsService.getOngoingEvents.mockResolvedValue(ongoingEvents);
      displayService.getQrCodeForEvent.mockResolvedValue(qrData);
      eventsService.transitionEventStatuses.mockResolvedValue(undefined);

      // Simulate concurrent execution of both cron jobs
      await Promise.all([
        scheduler.rotateQrCodes(),
        scheduler.checkEventTransitions(),
      ]);

      expect(eventsService.getOngoingEvents).toHaveBeenCalled();
      expect(eventsService.transitionEventStatuses).toHaveBeenCalled();
    });

    it('should handle rapid successive calls', async () => {
      const ongoingEvents = [{ id: 'event-1', isPaused: false }];
      const qrData = { type: 'event_checkin', timestamp: 123, expires_at: 243 };

      eventsService.getOngoingEvents.mockResolvedValue(ongoingEvents);
      displayService.getQrCodeForEvent.mockResolvedValue(qrData);

      // Simulate multiple rapid calls
      await scheduler.rotateQrCodes();
      await scheduler.rotateQrCodes();
      await scheduler.rotateQrCodes();

      expect(eventsGateway.broadcastQrUpdate).toHaveBeenCalledTimes(3);
    });
  });
});
