import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CardService } from '../card.service';

describe('CardService', () => {
  let service: CardService;
  let prisma: any;

  const mockCard = {
    id: 'card-123',
    userId: 'user-123',
    cardNumber: 'ASSOC-2024-00001',
    status: 'ACTIVE',
    statusReason: null,
    qrCodeData: JSON.stringify({
      user_id: 'user-123',
      card_number: 'ASSOC-2024-00001',
      timestamp: Date.now(),
      type: 'member_card',
    }),
    qrCodeHash: 'hash123',
    issuedAt: new Date('2024-01-01'),
    expiresAt: null,
    user: {
      id: 'user-123',
      name: 'João Silva',
      avatarUrl: 'https://example.com/avatar.jpg',
      memberId: 'M001',
      association: {
        id: 'assoc-1',
        name: 'Associação XYZ',
        logoUrl: 'https://example.com/logo.png',
        phone: '11999999999',
        email: 'contato@assoc.com',
        website: 'https://assoc.com',
        address: 'Rua X, 123',
      },
    },
  };

  const mockUsageLog = {
    id: 'log-1',
    cardId: 'card-123',
    userId: 'user-123',
    type: 'CHECKIN',
    location: 'Sede Principal',
    address: 'Rua X, 123',
    partner: null,
    scannedAt: new Date(),
    metadata: null,
  };

  beforeEach(() => {
    prisma = {
      memberCard: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      cardUsageLog: {
        findMany: vi.fn(),
        create: vi.fn(),
        count: vi.fn(),
      },
    };

    service = new CardService(prisma);
  });

  // ===========================================
  // getCard
  // ===========================================

  describe('getCard', () => {
    it('should return existing card with user and association data', async () => {
      prisma.memberCard.findUnique.mockResolvedValue(mockCard);

      const result = await service.getCard('user-123');

      expect(result).toMatchObject({
        id: 'card-123',
        cardNumber: 'ASSOC-2024-00001',
        status: 'ACTIVE',
        user: {
          id: 'user-123',
          name: 'João Silva',
        },
        association: {
          name: 'Associação XYZ',
        },
      });
    });

    it('should auto-create card if not exists', async () => {
      prisma.memberCard.findUnique
        .mockResolvedValueOnce(null) // First call - no card
        .mockResolvedValueOnce(mockCard); // After creation

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        associationId: 'assoc-1',
        association: { slug: 'assoc' },
      });

      prisma.memberCard.findFirst.mockResolvedValue(null);
      prisma.memberCard.create.mockResolvedValue(mockCard);

      const result = await service.getCard('user-123');

      expect(result.cardNumber).toBeDefined();
    });

    it('should throw NotFoundException when user not found during auto-create', async () => {
      prisma.memberCard.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getCard('invalid-user')).rejects.toThrow(NotFoundException);
    });

    it('should generate card number with association slug prefix', async () => {
      prisma.memberCard.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          ...mockCard,
          cardNumber: 'XYZ-2024-00006',
        });

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        associationId: 'assoc-1',
        association: { slug: 'xyz' },
      });

      prisma.memberCard.findFirst.mockResolvedValue({ cardNumber: 'XYZ-2024-00005' });
      prisma.memberCard.create.mockResolvedValue({
        ...mockCard,
        cardNumber: 'XYZ-2024-00006',
      });

      const result = await service.getCard('user-123');

      expect(result.cardNumber).toMatch(/^XYZ-\d{4}-\d{5}$/);
    });
  });

  // ===========================================
  // getCardStatus
  // ===========================================

  describe('getCardStatus', () => {
    it('should return card status', async () => {
      prisma.memberCard.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        statusReason: null,
        expiresAt: null,
      });

      const result = await service.getCardStatus('user-123');

      expect(result).toEqual({
        status: 'ACTIVE',
        statusReason: null,
        expiresAt: null,
      });
    });

    it('should return default status when card not exists and create it', async () => {
      prisma.memberCard.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        associationId: 'assoc-1',
        association: { slug: 'assoc' },
      });
      prisma.memberCard.findFirst.mockResolvedValue(null);
      prisma.memberCard.create.mockResolvedValue(mockCard);

      const result = await service.getCardStatus('user-123');

      expect(result.status).toBe('ACTIVE');
    });
  });

  // ===========================================
  // getQrCode
  // ===========================================

  describe('getQrCode', () => {
    it('should return QR code data for active card', async () => {
      prisma.memberCard.findUnique.mockResolvedValue({
        id: 'card-123',
        cardNumber: 'ASSOC-2024-00001',
        qrCodeData: mockCard.qrCodeData,
        qrCodeHash: 'hash123',
        status: 'ACTIVE',
      });

      const result = await service.getQrCode('user-123');

      expect(result.qrCodeData).toBeDefined();
      expect(result.qrCodeHash).toBeDefined();
      expect(result.cardNumber).toBe('ASSOC-2024-00001');
    });

    it('should throw BadRequestException for inactive card', async () => {
      prisma.memberCard.findUnique.mockResolvedValue({
        ...mockCard,
        status: 'INACTIVE',
      });

      await expect(service.getQrCode('user-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for suspended card', async () => {
      prisma.memberCard.findUnique.mockResolvedValue({
        ...mockCard,
        status: 'SUSPENDED',
      });

      await expect(service.getQrCode('user-123')).rejects.toThrow(BadRequestException);
    });

    it('should auto-create card and return QR code if card not exists', async () => {
      const newCard = {
        ...mockCard,
        id: 'new-card',
        status: 'ACTIVE',
      };

      prisma.memberCard.findUnique
        .mockResolvedValueOnce(null) // First call in getQrCode
        .mockResolvedValueOnce(newCard); // After auto-create

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        associationId: 'assoc-1',
        association: { slug: 'assoc' },
      });
      prisma.memberCard.findFirst.mockResolvedValue(null);
      prisma.memberCard.create.mockResolvedValue(newCard);

      const result = await service.getQrCode('user-123');

      expect(result.qrCodeData).toBeDefined();
      expect(result.cardNumber).toBeDefined();
    });
  });

  // ===========================================
  // getCardHistory
  // ===========================================

  describe('getCardHistory', () => {
    it('should return paginated card history', async () => {
      prisma.memberCard.findUnique.mockResolvedValue({ id: 'card-123' });
      prisma.cardUsageLog.findMany.mockResolvedValue([mockUsageLog]);
      prisma.cardUsageLog.count.mockResolvedValue(1);

      const result = await service.getCardHistory('user-123', { page: 1, perPage: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalCount).toBe(1);
    });

    it('should filter by type when provided', async () => {
      prisma.memberCard.findUnique.mockResolvedValue({ id: 'card-123' });
      prisma.cardUsageLog.findMany.mockResolvedValue([mockUsageLog]);
      prisma.cardUsageLog.count.mockResolvedValue(1);

      await service.getCardHistory('user-123', { page: 1, perPage: 20, type: 'CHECKIN' as any });

      expect(prisma.cardUsageLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'CHECKIN' }),
        }),
      );
    });

    it('should return empty data when card not exists', async () => {
      prisma.memberCard.findUnique.mockResolvedValue(null);

      const result = await service.getCardHistory('user-123', { page: 1, perPage: 20 });

      expect(result.data).toHaveLength(0);
      expect(result.meta.totalCount).toBe(0);
    });
  });

  // ===========================================
  // listCards (Admin)
  // ===========================================

  describe('listCards', () => {
    it('should return paginated list of cards', async () => {
      prisma.memberCard.findMany.mockResolvedValue([mockCard]);
      prisma.memberCard.count.mockResolvedValue(1);

      const result = await service.listCards('assoc-1', { page: 1, perPage: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalCount).toBe(1);
    });

    it('should filter by status', async () => {
      prisma.memberCard.findMany.mockResolvedValue([]);
      prisma.memberCard.count.mockResolvedValue(0);

      await service.listCards('assoc-1', { page: 1, perPage: 20, status: 'INACTIVE' as any });

      expect(prisma.memberCard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'INACTIVE' }),
        }),
      );
    });

    it('should search by card number or user name', async () => {
      prisma.memberCard.findMany.mockResolvedValue([mockCard]);
      prisma.memberCard.count.mockResolvedValue(1);

      await service.listCards('assoc-1', { page: 1, perPage: 20, search: 'João' });

      expect(prisma.memberCard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  // ===========================================
  // updateCardStatus (Admin)
  // ===========================================

  describe('updateCardStatus', () => {
    it('should update card status successfully', async () => {
      prisma.memberCard.findUnique.mockResolvedValue({ id: 'card-123' });
      prisma.memberCard.update.mockResolvedValue({
        ...mockCard,
        status: 'SUSPENDED',
        statusReason: 'Inadimplente',
      });

      const result = await service.updateCardStatus('card-123', {
        status: 'SUSPENDED' as any,
        reason: 'Inadimplente',
      });

      expect(result.status).toBe('SUSPENDED');
      expect(result.statusReason).toBe('Inadimplente');
    });

    it('should throw NotFoundException when card not found', async () => {
      prisma.memberCard.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCardStatus('invalid-id', { status: 'INACTIVE' as any }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // validateQrCode
  // ===========================================

  describe('validateQrCode', () => {
    it('should validate correct QR code', async () => {
      const qrData = JSON.stringify({
        user_id: 'user-123',
        card_number: 'ASSOC-2024-00001',
        timestamp: Date.now(),
        type: 'member_card',
      });

      prisma.memberCard.findUnique.mockResolvedValue({
        ...mockCard,
        user: {
          id: 'user-123',
          name: 'João Silva',
          avatarUrl: 'https://example.com/avatar.jpg',
          status: 'ACTIVE',
        },
      });

      // Generate valid hash
      const { createHmac } = await import('crypto');
      const secret = process.env.QR_CODE_SECRET || 'ahub-qr-secret-key';
      const validHash = createHmac('sha256', secret).update(qrData).digest('hex');

      const result = await service.validateQrCode(qrData, validHash);

      expect(result.valid).toBe(true);
      expect(result.user?.name).toBe('João Silva');
    });

    it('should reject invalid hash', async () => {
      const qrData = JSON.stringify({
        user_id: 'user-123',
        card_number: 'ASSOC-2024-00001',
        timestamp: Date.now(),
        type: 'member_card',
      });

      const result = await service.validateQrCode(qrData, 'invalid-hash');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('QR Code inválido');
    });

    it('should reject inactive card', async () => {
      const qrData = JSON.stringify({
        user_id: 'user-123',
        card_number: 'ASSOC-2024-00001',
        timestamp: Date.now(),
        type: 'member_card',
      });

      prisma.memberCard.findUnique.mockResolvedValue({
        ...mockCard,
        status: 'INACTIVE',
        user: { id: 'user-123', name: 'João', avatarUrl: null, status: 'ACTIVE' },
      });

      const { createHmac } = await import('crypto');
      const secret = process.env.QR_CODE_SECRET || 'ahub-qr-secret-key';
      const validHash = createHmac('sha256', secret).update(qrData).digest('hex');

      const result = await service.validateQrCode(qrData, validHash);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Carteirinha inativa');
    });

    it('should reject QR code with inactive user', async () => {
      const qrData = JSON.stringify({
        user_id: 'user-123',
        card_number: 'ASSOC-2024-00001',
        timestamp: Date.now(),
        type: 'member_card',
      });

      prisma.memberCard.findUnique.mockResolvedValue({
        ...mockCard,
        status: 'ACTIVE',
        user: { id: 'user-123', name: 'João', avatarUrl: null, status: 'INACTIVE' },
      });

      const { createHmac } = await import('crypto');
      const secret = process.env.QR_CODE_SECRET || 'ahub-qr-secret-key';
      const validHash = createHmac('sha256', secret).update(qrData).digest('hex');

      const result = await service.validateQrCode(qrData, validHash);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Usuário inativo');
    });

    it('should reject malformed QR code JSON', async () => {
      const malformedData = 'not-valid-json{';

      const { createHmac } = await import('crypto');
      const secret = process.env.QR_CODE_SECRET || 'ahub-qr-secret-key';
      const hash = createHmac('sha256', secret).update(malformedData).digest('hex');

      const result = await service.validateQrCode(malformedData, hash);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('QR Code mal formatado');
    });

    it('should reject card not found', async () => {
      const qrData = JSON.stringify({
        user_id: 'user-123',
        card_number: 'INVALID-CARD',
        timestamp: Date.now(),
        type: 'member_card',
      });

      prisma.memberCard.findUnique.mockResolvedValue(null);

      const { createHmac } = await import('crypto');
      const secret = process.env.QR_CODE_SECRET || 'ahub-qr-secret-key';
      const validHash = createHmac('sha256', secret).update(qrData).digest('hex');

      const result = await service.validateQrCode(qrData, validHash);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Carteirinha não encontrada');
    });
  });

  // ===========================================
  // logCardUsage
  // ===========================================

  describe('logCardUsage', () => {
    it('should create usage log', async () => {
      prisma.cardUsageLog.create.mockResolvedValue(mockUsageLog);

      const result = await service.logCardUsage('card-123', 'user-123', 'CHECKIN', {
        location: 'Sede Principal',
      });

      expect(result.type).toBe('CHECKIN');
      expect(prisma.cardUsageLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          cardId: 'card-123',
          userId: 'user-123',
          type: 'CHECKIN',
          location: 'Sede Principal',
        }),
      });
    });
  });
});
