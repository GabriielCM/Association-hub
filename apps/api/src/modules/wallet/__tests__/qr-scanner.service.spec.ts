import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QrScannerService } from '../qr-scanner.service';
import { QrCodeType } from '../dto';
import { createHmac } from 'crypto';

describe('QrScannerService', () => {
  let service: QrScannerService;
  let prisma: any;
  let cardService: any;
  let pointsService: any;

  const generateHash = (data: string) => {
    const secret = process.env.QR_CODE_SECRET || 'ahub-qr-secret-key';
    return createHmac('sha256', secret).update(data).digest('hex');
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
      },
    };

    cardService = {
      validateQrCode: vi.fn(),
      logCardUsage: vi.fn(),
    };

    pointsService = {
      getBalance: vi.fn().mockResolvedValue({ balance: 1000 }),
    };

    service = new QrScannerService(prisma, cardService, pointsService);
  });

  // ===========================================
  // processQrCode - Invalid QR
  // ===========================================

  describe('processQrCode - Invalid QR', () => {
    it('should reject QR with invalid hash', async () => {
      const qrData = JSON.stringify({ type: 'member_card', user_id: 'user-123' });

      const result = await service.processQrCode(qrData, 'invalid-hash', 'scanner-123');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('inválido');
    });

    it('should reject malformed JSON', async () => {
      const malformedData = 'not-json';
      const hash = generateHash(malformedData);

      const result = await service.processQrCode(malformedData, hash, 'scanner-123');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('mal formatado');
    });
  });

  // ===========================================
  // processQrCode - Member Card
  // ===========================================

  describe('processQrCode - Member Card', () => {
    it('should process member card QR for admin users', async () => {
      const qrData = JSON.stringify({
        type: 'member_card',
        user_id: 'user-123',
        card_number: 'ASSOC-2024-00001',
      });
      const hash = generateHash(qrData);

      prisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
      cardService.validateQrCode.mockResolvedValue({
        valid: true,
        user: { id: 'user-123', name: 'João', avatarUrl: null },
        card: { id: 'card-123', cardNumber: 'ASSOC-2024-00001' },
      });

      const result = await service.processQrCode(qrData, hash, 'admin-123');

      expect(result.valid).toBe(true);
      expect(result.type).toBe(QrCodeType.MEMBER_CARD);
      expect(result.action).toBe('display_member_info');
    });

    it('should reject member card QR for non-admin users', async () => {
      const qrData = JSON.stringify({
        type: 'member_card',
        user_id: 'user-123',
      });
      const hash = generateHash(qrData);

      prisma.user.findUnique.mockResolvedValue({ role: 'USER' });

      const result = await service.processQrCode(qrData, hash, 'user-456');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('permissão');
    });
  });

  // ===========================================
  // processQrCode - User Transfer
  // ===========================================

  describe('processQrCode - User Transfer', () => {
    it('should process transfer QR and return recipient info', async () => {
      const qrData = JSON.stringify({
        type: 'user_transfer',
        user_id: 'recipient-123',
      });
      const hash = generateHash(qrData);

      prisma.user.findUnique.mockResolvedValue({
        id: 'recipient-123',
        name: 'Maria',
        avatarUrl: 'https://example.com/maria.jpg',
        status: 'ACTIVE',
      });

      const result = await service.processQrCode(qrData, hash, 'sender-456');

      expect(result.valid).toBe(true);
      expect(result.type).toBe(QrCodeType.USER_TRANSFER);
      expect(result.action).toBe('open_transfer_flow');
      expect(result.data.recipient.name).toBe('Maria');
      expect(result.data.senderBalance).toBe(1000);
    });

    it('should reject self-transfer', async () => {
      const qrData = JSON.stringify({
        type: 'user_transfer',
        user_id: 'user-123',
      });
      const hash = generateHash(qrData);

      const result = await service.processQrCode(qrData, hash, 'user-123');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('você mesmo');
    });

    it('should reject transfer to non-existent user', async () => {
      const qrData = JSON.stringify({
        type: 'user_transfer',
        user_id: 'invalid-user',
      });
      const hash = generateHash(qrData);

      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.processQrCode(qrData, hash, 'sender-123');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('não encontrado');
    });

    it('should reject transfer to inactive user', async () => {
      const qrData = JSON.stringify({
        type: 'user_transfer',
        user_id: 'inactive-user',
      });
      const hash = generateHash(qrData);

      prisma.user.findUnique.mockResolvedValue({
        id: 'inactive-user',
        name: 'Inactive',
        avatarUrl: null,
        status: 'INACTIVE',
      });

      const result = await service.processQrCode(qrData, hash, 'sender-123');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('inativo');
    });
  });

  // ===========================================
  // processQrCode - Event Check-in (Fase 3)
  // ===========================================

  describe('processQrCode - Event Check-in', () => {
    it('should return pending status for event check-in (Fase 3)', async () => {
      const qrData = JSON.stringify({
        type: 'event_checkin',
        event_id: 'event-123',
        event_name: 'Happy Hour',
      });
      const hash = generateHash(qrData);

      const result = await service.processQrCode(qrData, hash, 'user-123');

      expect(result.type).toBe(QrCodeType.EVENT_CHECKIN);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Fase 3');
      expect(result.action).toBe('event_checkin_pending');
    });
  });

  // ===========================================
  // processQrCode - PDV Payment (Fase 5)
  // ===========================================

  describe('processQrCode - PDV Payment', () => {
    it('should return pending status for PDV payment (Fase 5)', async () => {
      const qrData = JSON.stringify({
        type: 'pdv_payment',
        checkout_code: 'checkout-123',
        pdv_name: 'Bar da Sede',
      });
      const hash = generateHash(qrData);

      const result = await service.processQrCode(qrData, hash, 'user-123');

      expect(result.type).toBe(QrCodeType.PDV_PAYMENT);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Fase 5');
      expect(result.action).toBe('pdv_payment_pending');
    });
  });

  // ===========================================
  // Unknown QR type
  // ===========================================

  describe('processQrCode - Unknown type', () => {
    it('should reject unknown QR type', async () => {
      const qrData = JSON.stringify({
        type: 'unknown_type',
        data: 'something',
      });
      const hash = generateHash(qrData);

      const result = await service.processQrCode(qrData, hash, 'user-123');

      // Unknown types are treated as member_card by default
      expect(result.valid).toBe(false);
    });
  });

  // ===========================================
  // Edge Cases
  // ===========================================

  describe('processQrCode - Edge Cases', () => {
    it('should handle empty qrCodeData', async () => {
      const result = await service.processQrCode('', '', 'user-123');

      expect(result.valid).toBe(false);
    });

    it('should handle JSON with missing type field', async () => {
      const qrData = JSON.stringify({ user_id: 'user-123' }); // No type
      const hash = generateHash(qrData);

      const result = await service.processQrCode(qrData, hash, 'user-123');

      expect(result.valid).toBe(false);
    });

    it('should log card usage after successful member card validation', async () => {
      const qrData = JSON.stringify({
        type: 'member_card',
        user_id: 'user-123',
        card_number: 'ASSOC-2024-00001',
      });
      const hash = generateHash(qrData);

      prisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
      cardService.validateQrCode.mockResolvedValue({
        valid: true,
        user: { id: 'user-123', name: 'João', avatarUrl: null },
        card: { id: 'card-123', cardNumber: 'ASSOC-2024-00001' },
      });

      await service.processQrCode(qrData, hash, 'admin-123');

      expect(cardService.logCardUsage).toHaveBeenCalled();
    });

    it('should handle cardService.validateQrCode returning invalid', async () => {
      const qrData = JSON.stringify({
        type: 'member_card',
        user_id: 'user-123',
        card_number: 'ASSOC-2024-00001',
      });
      const hash = generateHash(qrData);

      prisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
      cardService.validateQrCode.mockResolvedValue({
        valid: false,
        error: 'Carteirinha expirada',
      });

      const result = await service.processQrCode(qrData, hash, 'admin-123');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Carteirinha expirada');
    });

    it('should include sender balance in transfer flow data', async () => {
      const qrData = JSON.stringify({
        type: 'user_transfer',
        user_id: 'recipient-123',
      });
      const hash = generateHash(qrData);

      prisma.user.findUnique.mockResolvedValue({
        id: 'recipient-123',
        name: 'Maria',
        avatarUrl: null,
        status: 'ACTIVE',
      });
      pointsService.getBalance.mockResolvedValue({ balance: 500 });

      const result = await service.processQrCode(qrData, hash, 'sender-456');

      expect(result.data.senderBalance).toBe(500);
    });
  });
});
