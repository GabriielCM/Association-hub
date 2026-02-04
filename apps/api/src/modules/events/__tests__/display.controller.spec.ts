import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DisplayController } from '../display.controller';
import { DisplayService, DisplayData } from '../display.service';
import { Response } from 'express';

const createMockResponse = () => {
  return {
    setHeader: vi.fn(),
    send: vi.fn(),
    status: vi.fn().mockReturnThis(),
  } as unknown as Response;
};

const mockDisplayData: DisplayData = {
  event: {
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
  },
  association: {
    name: 'Associacao Teste',
    logoUrl: 'https://example.com/logo.png',
  },
  currentCheckin: {
    number: 1,
    points: 25,
  },
  qrCode: {
    type: 'event_checkin',
    event_id: 'event-123',
    checkin_number: 1,
    security_token: 'token-123',
    timestamp: 1234567890,
    expires_at: 1234568010,
  },
  stats: {
    totalCheckIns: 25,
  },
};

describe('DisplayController', () => {
  let controller: DisplayController;
  let displayService: any;

  beforeEach(() => {
    displayService = {
      getDisplayData: vi.fn(),
    };

    controller = new DisplayController(displayService);
  });

  // ==========================================
  // getDisplayPage
  // ==========================================

  describe('getDisplayPage', () => {
    it('should return HTML page for valid event', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      await controller.getDisplayPage('event-123', res);

      expect(displayService.getDisplayData).toHaveBeenCalledWith('event-123');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('<!DOCTYPE html>'));
    });

    it('should include event title in HTML', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      await controller.getDisplayPage('event-123', res);

      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('Evento Teste'));
    });

    it('should include QR code container for ongoing events', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      await controller.getDisplayPage('event-123', res);

      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('id="qrcode"'));
    });

    it('should return 404 HTML for non-existent event', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockRejectedValue(new NotFoundException());

      await controller.getDisplayPage('invalid-id', res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining('Evento nao encontrado'),
      );
    });

    it('should include association logo when available', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      await controller.getDisplayPage('event-123', res);

      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining('https://example.com/logo.png'),
      );
    });

    it('should not include logo when association has no logo', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue({
        ...mockDisplayData,
        association: { name: 'Test', logoUrl: null },
      });

      await controller.getDisplayPage('event-123', res);

      expect(res.send).toHaveBeenCalledWith(expect.not.stringContaining('class="logo"'));
    });

    it('should show paused message for paused events', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue({
        ...mockDisplayData,
        event: { ...mockDisplayData.event, isPaused: true },
      });

      await controller.getDisplayPage('event-123', res);

      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining('Check-ins temporariamente pausados'),
      );
    });

    it('should show scheduled message for scheduled events', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue({
        ...mockDisplayData,
        event: { ...mockDisplayData.event, status: 'SCHEDULED' },
      });

      await controller.getDisplayPage('event-123', res);

      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining('Evento comeca em breve'),
      );
    });

    it('should show ended message for ended events', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue({
        ...mockDisplayData,
        event: { ...mockDisplayData.event, status: 'ENDED' },
      });

      await controller.getDisplayPage('event-123', res);

      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining('Evento encerrado'),
      );
    });

    it('should include check-in number and points', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      await controller.getDisplayPage('event-123', res);

      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining('CHECK-IN 1'),
      );
      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining('+25 pontos'),
      );
    });

    it('should include total check-ins counter', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      await controller.getDisplayPage('event-123', res);

      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining('25 check-ins realizados'),
      );
    });

    it('should include event color in styles', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      await controller.getDisplayPage('event-123', res);

      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining('#6366F1'),
      );
    });

    it('should include QRCode library script', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      await controller.getDisplayPage('event-123', res);

      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining('qrcode.min.js'),
      );
    });

    it('should include WebSocket connection script', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      await controller.getDisplayPage('event-123', res);

      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining('connectWebSocket'),
      );
    });

    it('should include polling fallback script', async () => {
      const res = createMockResponse();
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      await controller.getDisplayPage('event-123', res);

      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining('setInterval'),
      );
    });
  });

  // ==========================================
  // getDisplayData
  // ==========================================

  describe('getDisplayData', () => {
    it('should call displayService.getDisplayData with correct params', async () => {
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      await controller.getDisplayData('event-123');

      expect(displayService.getDisplayData).toHaveBeenCalledWith('event-123');
    });

    it('should return display data', async () => {
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      const result = await controller.getDisplayData('event-123');

      expect(result).toEqual(mockDisplayData);
    });

    it('should propagate NotFoundException', async () => {
      displayService.getDisplayData.mockRejectedValue(
        new NotFoundException('Evento nao encontrado'),
      );

      await expect(controller.getDisplayData('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return all display data fields', async () => {
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      const result = await controller.getDisplayData('event-123');

      expect(result.event).toBeDefined();
      expect(result.association).toBeDefined();
      expect(result.currentCheckin).toBeDefined();
      expect(result.qrCode).toBeDefined();
      expect(result.stats).toBeDefined();
    });

    it('should return qrCode with security token', async () => {
      displayService.getDisplayData.mockResolvedValue(mockDisplayData);

      const result = await controller.getDisplayData('event-123');

      expect(result.qrCode.security_token).toBe('token-123');
      expect(result.qrCode.type).toBe('event_checkin');
    });
  });
});
