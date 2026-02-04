import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DisplayService, QrCodeData } from '../display.service';
import { EventsService } from '../events.service';

const mockEvent = {
  id: 'event-123',
  title: 'Evento Teste',
  description: 'Descricao do evento',
  category: 'SOCIAL',
  color: '#6366F1',
  startDate: new Date('2025-01-15T10:00:00Z'),
  endDate: new Date('2025-01-15T18:00:00Z'),
  locationName: 'Salao Principal',
  bannerDisplay: ['https://example.com/img1.jpg'],
  pointsTotal: 100,
  checkinsCount: 4,
  checkinInterval: 30,
  status: 'ONGOING',
  isPaused: false,
  qrSecret: 'secret-123',
  association: {
    name: 'Associacao Teste',
    logoUrl: 'https://example.com/logo.png',
  },
  _count: {
    checkIns: 25,
  },
};

describe('DisplayService', () => {
  let service: DisplayService;
  let eventsService: any;

  beforeEach(() => {
    eventsService = {
      getEventForDisplay: vi.fn(),
      generateSecurityToken: vi.fn().mockReturnValue('mock-token-hash'),
    };

    service = new DisplayService(eventsService);
  });

  // ==========================================
  // getDisplayData
  // ==========================================

  describe('getDisplayData', () => {
    it('should return complete display data for ongoing event', async () => {
      eventsService.getEventForDisplay.mockResolvedValue(mockEvent);

      const result = await service.getDisplayData('event-123');

      expect(result.event.id).toBe('event-123');
      expect(result.event.title).toBe('Evento Teste');
      expect(result.association.name).toBe('Associacao Teste');
      expect(result.currentCheckin.number).toBeGreaterThanOrEqual(1);
      expect(result.qrCode).toBeDefined();
      expect(result.stats.totalCheckIns).toBe(25);
    });

    it('should throw NotFoundException for non-existent event', async () => {
      eventsService.getEventForDisplay.mockResolvedValue(null);

      await expect(service.getDisplayData('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should calculate points per check-in correctly', async () => {
      eventsService.getEventForDisplay.mockResolvedValue(mockEvent);

      const result = await service.getDisplayData('event-123');

      // 100 points / 4 check-ins = 25 points per check-in
      expect(result.currentCheckin.points).toBe(25);
    });

    it('should include event color in display data', async () => {
      eventsService.getEventForDisplay.mockResolvedValue(mockEvent);

      const result = await service.getDisplayData('event-123');

      expect(result.event.color).toBe('#6366F1');
    });

    it('should include banner display images', async () => {
      eventsService.getEventForDisplay.mockResolvedValue(mockEvent);

      const result = await service.getDisplayData('event-123');

      expect(result.event.bannerDisplay).toHaveLength(1);
      expect(result.event.bannerDisplay[0]).toBe('https://example.com/img1.jpg');
    });

    it('should include association logo', async () => {
      eventsService.getEventForDisplay.mockResolvedValue(mockEvent);

      const result = await service.getDisplayData('event-123');

      expect(result.association.logoUrl).toBe('https://example.com/logo.png');
    });

    it('should handle event with null association logo', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        association: { name: 'Teste', logoUrl: null },
      });

      const result = await service.getDisplayData('event-123');

      expect(result.association.logoUrl).toBeNull();
    });

    it('should return isPaused status', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        isPaused: true,
      });

      const result = await service.getDisplayData('event-123');

      expect(result.event.isPaused).toBe(true);
    });

    it('should handle event with empty banner display array', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        bannerDisplay: [],
      });

      const result = await service.getDisplayData('event-123');

      expect(result.event.bannerDisplay).toEqual([]);
    });

    it('should return all event fields', async () => {
      eventsService.getEventForDisplay.mockResolvedValue(mockEvent);

      const result = await service.getDisplayData('event-123');

      expect(result.event.description).toBe('Descricao do evento');
      expect(result.event.category).toBe('SOCIAL');
      expect(result.event.locationName).toBe('Salao Principal');
      expect(result.event.checkinsCount).toBe(4);
      expect(result.event.checkinInterval).toBe(30);
      expect(result.event.status).toBe('ONGOING');
    });

    it('should include event dates', async () => {
      eventsService.getEventForDisplay.mockResolvedValue(mockEvent);

      const result = await service.getDisplayData('event-123');

      expect(result.event.startDate).toEqual(new Date('2025-01-15T10:00:00Z'));
      expect(result.event.endDate).toEqual(new Date('2025-01-15T18:00:00Z'));
    });

    it('should handle multiple banner images', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        bannerDisplay: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
      });

      const result = await service.getDisplayData('event-123');

      expect(result.event.bannerDisplay).toHaveLength(3);
    });
  });

  // ==========================================
  // generateQrCode
  // ==========================================

  describe('generateQrCode', () => {
    it('should generate QR code with correct structure', () => {
      const qrCode = service.generateQrCode('event-123', 1, 'secret-123');

      expect(qrCode.type).toBe('event_checkin');
      expect(qrCode.event_id).toBe('event-123');
      expect(qrCode.checkin_number).toBe(1);
      expect(qrCode.security_token).toBeDefined();
      expect(qrCode.timestamp).toBeDefined();
      expect(qrCode.expires_at).toBeDefined();
    });

    it('should set expires_at to 2 minutes after timestamp', () => {
      const qrCode = service.generateQrCode('event-123', 1, 'secret-123');

      expect(qrCode.expires_at - qrCode.timestamp).toBe(120);
    });

    it('should call eventsService.generateSecurityToken', () => {
      service.generateQrCode('event-123', 2, 'secret-123');

      expect(eventsService.generateSecurityToken).toHaveBeenCalledWith(
        'event-123',
        2,
        expect.any(Number),
        'secret-123',
      );
    });

    it('should generate different QR codes for different check-in numbers', () => {
      const qr1 = service.generateQrCode('event-123', 1, 'secret-123');
      const qr2 = service.generateQrCode('event-123', 2, 'secret-123');

      expect(qr1.checkin_number).toBe(1);
      expect(qr2.checkin_number).toBe(2);
    });

    it('should generate timestamps close to current time', () => {
      const now = Math.floor(Date.now() / 1000);
      const qrCode = service.generateQrCode('event-123', 1, 'secret-123');

      // Timestamp should be within 2 seconds of now
      expect(Math.abs(qrCode.timestamp - now)).toBeLessThanOrEqual(2);
    });

    it('should use correct event_id in QR code', () => {
      const qr1 = service.generateQrCode('event-123', 1, 'secret-123');
      const qr2 = service.generateQrCode('event-456', 1, 'secret-456');

      expect(qr1.event_id).toBe('event-123');
      expect(qr2.event_id).toBe('event-456');
    });

    it('should always return type as event_checkin', () => {
      const qr1 = service.generateQrCode('event-1', 1, 'secret-1');
      const qr2 = service.generateQrCode('event-2', 5, 'secret-2');

      expect(qr1.type).toBe('event_checkin');
      expect(qr2.type).toBe('event_checkin');
    });

    it('should handle high check-in numbers', () => {
      const qrCode = service.generateQrCode('event-123', 100, 'secret-123');

      expect(qrCode.checkin_number).toBe(100);
    });
  });

  // ==========================================
  // getQrCodeForEvent
  // ==========================================

  describe('getQrCodeForEvent', () => {
    it('should return QR code for ongoing event', async () => {
      eventsService.getEventForDisplay.mockResolvedValue(mockEvent);

      const result = await service.getQrCodeForEvent('event-123');

      expect(result).not.toBeNull();
      expect(result?.type).toBe('event_checkin');
    });

    it('should return null for paused event', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        isPaused: true,
      });

      const result = await service.getQrCodeForEvent('event-123');

      expect(result).toBeNull();
    });

    it('should return null for SCHEDULED event', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        status: 'SCHEDULED',
      });

      const result = await service.getQrCodeForEvent('event-123');

      expect(result).toBeNull();
    });

    it('should return null for ENDED event', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        status: 'ENDED',
      });

      const result = await service.getQrCodeForEvent('event-123');

      expect(result).toBeNull();
    });

    it('should return null for DRAFT event', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        status: 'DRAFT',
      });

      const result = await service.getQrCodeForEvent('event-123');

      expect(result).toBeNull();
    });

    it('should return null for CANCELED event', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        status: 'CANCELED',
      });

      const result = await service.getQrCodeForEvent('event-123');

      expect(result).toBeNull();
    });

    it('should return null for non-existent event', async () => {
      eventsService.getEventForDisplay.mockResolvedValue(null);

      const result = await service.getQrCodeForEvent('invalid-id');

      expect(result).toBeNull();
    });

    it('should include correct check-in number based on elapsed time', async () => {
      const startDate = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        startDate,
        checkinInterval: 30,
      });

      const result = await service.getQrCodeForEvent('event-123');

      // 45 min / 30 min interval = 1.5, floor + 1 = 2
      expect(result?.checkin_number).toBe(2);
    });

    it('should return QR code with security token', async () => {
      eventsService.getEventForDisplay.mockResolvedValue(mockEvent);

      const result = await service.getQrCodeForEvent('event-123');

      expect(result?.security_token).toBe('mock-token-hash');
    });

    it('should return QR code with expiration', async () => {
      eventsService.getEventForDisplay.mockResolvedValue(mockEvent);

      const result = await service.getQrCodeForEvent('event-123');

      expect(result?.expires_at).toBeDefined();
      expect(result?.expires_at).toBeGreaterThan(result?.timestamp ?? 0);
    });
  });

  // ==========================================
  // calculateCurrentCheckinNumber (private, tested through getDisplayData)
  // ==========================================

  describe('current check-in calculation', () => {
    it('should return 1 for non-ongoing event (SCHEDULED)', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        status: 'SCHEDULED',
      });

      const result = await service.getDisplayData('event-123');

      expect(result.currentCheckin.number).toBe(1);
    });

    it('should return 1 for DRAFT event', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        status: 'DRAFT',
      });

      const result = await service.getDisplayData('event-123');

      expect(result.currentCheckin.number).toBe(1);
    });

    it('should return 1 for ENDED event', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        status: 'ENDED',
      });

      const result = await service.getDisplayData('event-123');

      expect(result.currentCheckin.number).toBe(1);
    });

    it('should return 1 for CANCELED event', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        status: 'CANCELED',
      });

      const result = await service.getDisplayData('event-123');

      expect(result.currentCheckin.number).toBe(1);
    });

    it('should calculate based on elapsed time', async () => {
      const startDate = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        startDate,
        checkinInterval: 30, // 30 minutes per check-in
      });

      const result = await service.getDisplayData('event-123');

      // 45 minutes elapsed / 30 minute interval = 1.5, floor + 1 = 2
      expect(result.currentCheckin.number).toBe(2);
    });

    it('should not exceed total check-ins count', async () => {
      const startDate = new Date(Date.now() - 300 * 60 * 1000); // 5 hours ago
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        startDate,
        checkinsCount: 4,
        checkinInterval: 30,
      });

      const result = await service.getDisplayData('event-123');

      expect(result.currentCheckin.number).toBeLessThanOrEqual(4);
    });

    it('should return 1 when event just started', async () => {
      const startDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        startDate,
        checkinInterval: 30,
      });

      const result = await service.getDisplayData('event-123');

      // 5 minutes elapsed / 30 minute interval = 0.16, floor + 1 = 1
      expect(result.currentCheckin.number).toBe(1);
    });

    it('should handle check-in number at exact interval boundary', async () => {
      const startDate = new Date(Date.now() - 60 * 60 * 1000); // 60 minutes ago
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        startDate,
        checkinInterval: 30,
        checkinsCount: 4,
      });

      const result = await service.getDisplayData('event-123');

      // 60 minutes elapsed / 30 minute interval = 2, floor + 1 = 3
      expect(result.currentCheckin.number).toBe(3);
    });

    it('should cap at max check-ins for very long events', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        startDate,
        checkinInterval: 30,
        checkinsCount: 10,
      });

      const result = await service.getDisplayData('event-123');

      expect(result.currentCheckin.number).toBe(10);
    });

    it('should handle short interval events', async () => {
      const startDate = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        startDate,
        checkinInterval: 5, // 5 minutes per check-in
        checkinsCount: 10,
      });

      const result = await service.getDisplayData('event-123');

      // 15 minutes elapsed / 5 minute interval = 3, floor + 1 = 4
      expect(result.currentCheckin.number).toBe(4);
    });

    it('should return 1 when elapsed time is 0', async () => {
      const startDate = new Date(Date.now()); // Just started
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        startDate,
        checkinInterval: 30,
      });

      const result = await service.getDisplayData('event-123');

      expect(result.currentCheckin.number).toBe(1);
    });
  });

  // ==========================================
  // Edge cases and error handling
  // ==========================================

  describe('edge cases', () => {
    it('should handle event with single check-in', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        checkinsCount: 1,
        pointsTotal: 50,
      });

      const result = await service.getDisplayData('event-123');

      expect(result.currentCheckin.points).toBe(50);
      expect(result.currentCheckin.number).toBe(1);
    });

    it('should handle event with many check-ins', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        checkinsCount: 100,
        pointsTotal: 1000,
      });

      const result = await service.getDisplayData('event-123');

      expect(result.currentCheckin.points).toBe(10);
    });

    it('should handle event where points dont divide evenly', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        checkinsCount: 3,
        pointsTotal: 100,
      });

      const result = await service.getDisplayData('event-123');

      // 100 / 3 = 33.33, floored to 33
      expect(result.currentCheckin.points).toBe(33);
    });

    it('should handle event with zero total check-ins recorded', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        _count: { checkIns: 0 },
      });

      const result = await service.getDisplayData('event-123');

      expect(result.stats.totalCheckIns).toBe(0);
    });

    it('should handle very large points per check-in', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        checkinsCount: 1,
        pointsTotal: 10000,
      });

      const result = await service.getDisplayData('event-123');

      expect(result.currentCheckin.points).toBe(10000);
    });

    it('should handle minimum points per check-in', async () => {
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        checkinsCount: 100,
        pointsTotal: 10,
      });

      const result = await service.getDisplayData('event-123');

      // 10 / 100 = 0.1, floored to 0
      expect(result.currentCheckin.points).toBe(0);
    });

    it('should handle event with very short interval', async () => {
      const startDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      eventsService.getEventForDisplay.mockResolvedValue({
        ...mockEvent,
        startDate,
        checkinInterval: 1, // 1 minute per check-in
        checkinsCount: 100,
      });

      const result = await service.getDisplayData('event-123');

      // 10 minutes / 1 minute interval = 10, floor + 1 = 11
      expect(result.currentCheckin.number).toBe(11);
    });
  });
});
