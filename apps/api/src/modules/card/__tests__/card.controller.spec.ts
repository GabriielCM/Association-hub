import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CardController, AdminCardController } from '../card.controller';
import { CardService } from '../card.service';
import { JwtPayload } from '../../../common/types';

describe('CardController', () => {
  let controller: CardController;
  let service: CardService;

  const mockUser: JwtPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    role: 'USER',
    associationId: 'assoc-1',
  };

  const mockCard = {
    id: 'card-123',
    userId: 'user-123',
    cardNumber: 'ASSOC-2024-00001',
    status: 'ACTIVE',
    statusReason: null,
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
      },
    },
  };

  const mockQrCode = {
    qrCodeData: JSON.stringify({
      user_id: 'user-123',
      card_number: 'ASSOC-2024-00001',
      timestamp: Date.now(),
      type: 'member_card',
    }),
    qrCodeHash: 'hash123',
    cardNumber: 'ASSOC-2024-00001',
  };

  const mockHistory = {
    data: [
      {
        id: 'log-1',
        type: 'CHECKIN',
        location: 'Sede Principal',
        scannedAt: new Date(),
        partner: null,
      },
    ],
    meta: {
      total: 1,
      page: 1,
      perPage: 20,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    service = {
      getCard: vi.fn().mockResolvedValue(mockCard),
      getCardStatus: vi.fn().mockResolvedValue({
        status: 'ACTIVE',
        statusReason: null,
        expiresAt: null,
      }),
      getQrCode: vi.fn().mockResolvedValue(mockQrCode),
      getCardHistory: vi.fn().mockResolvedValue(mockHistory),
      listCards: vi.fn(),
      updateCardStatus: vi.fn(),
    } as unknown as CardService;

    controller = new CardController(service);
  });

  // ===========================================
  // getCard
  // ===========================================

  describe('getCard', () => {
    it('should return card data wrapped in data object', async () => {
      const result = await controller.getCard(mockUser);

      expect(result).toEqual({ data: mockCard });
      expect(service.getCard).toHaveBeenCalledWith('user-123');
    });

    it('should auto-create card on first access', async () => {
      const newCard = { ...mockCard, id: 'new-card' };
      service.getCard = vi.fn().mockResolvedValue(newCard);

      const result = await controller.getCard(mockUser);

      expect(result.data).toEqual(newCard);
      expect(service.getCard).toHaveBeenCalledWith('user-123');
    });
  });

  // ===========================================
  // getCardStatus
  // ===========================================

  describe('getCardStatus', () => {
    it('should return card status wrapped in data object', async () => {
      const result = await controller.getCardStatus(mockUser);

      expect(result).toEqual({
        data: {
          status: 'ACTIVE',
          statusReason: null,
          expiresAt: null,
        },
      });
      expect(service.getCardStatus).toHaveBeenCalledWith('user-123');
    });
  });

  // ===========================================
  // getQrCode
  // ===========================================

  describe('getQrCode', () => {
    it('should return QR code data wrapped in data object', async () => {
      const result = await controller.getQrCode(mockUser);

      expect(result).toEqual({ data: mockQrCode });
      expect(service.getQrCode).toHaveBeenCalledWith('user-123');
    });

    it('should propagate BadRequestException for inactive card', async () => {
      service.getQrCode = vi.fn().mockRejectedValue(
        new BadRequestException('Carteirinha inativa'),
      );

      await expect(controller.getQrCode(mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // getCardHistory
  // ===========================================

  describe('getCardHistory', () => {
    it('should return paginated history directly', async () => {
      const query = { page: 1, perPage: 20 };

      const result = await controller.getCardHistory(mockUser, query);

      expect(result).toEqual(mockHistory);
      expect(service.getCardHistory).toHaveBeenCalledWith('user-123', query);
    });

    it('should pass type filter to service', async () => {
      const query = { page: 1, perPage: 10, type: 'CHECKIN' as any };

      await controller.getCardHistory(mockUser, query);

      expect(service.getCardHistory).toHaveBeenCalledWith('user-123', query);
    });
  });
});

// ===========================================
// AdminCardController
// ===========================================

describe('AdminCardController', () => {
  let controller: AdminCardController;
  let service: CardService;

  const mockAdminUser: JwtPayload = {
    sub: 'admin-123',
    email: 'admin@example.com',
    role: 'ADMIN',
    associationId: 'assoc-1',
  };

  const mockCardsList = {
    data: [
      {
        id: 'card-1',
        cardNumber: 'ASSOC-2024-00001',
        status: 'ACTIVE',
        user: { id: 'user-1', name: 'João Silva' },
      },
      {
        id: 'card-2',
        cardNumber: 'ASSOC-2024-00002',
        status: 'INACTIVE',
        user: { id: 'user-2', name: 'Maria Santos' },
      },
    ],
    meta: {
      total: 2,
      page: 1,
      perPage: 20,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    service = {
      listCards: vi.fn().mockResolvedValue(mockCardsList),
      updateCardStatus: vi.fn().mockResolvedValue({
        id: 'card-1',
        status: 'INACTIVE',
        statusReason: 'Inadimplência',
      }),
    } as unknown as CardService;

    controller = new AdminCardController(service);
  });

  // ===========================================
  // listCards
  // ===========================================

  describe('listCards', () => {
    it('should return paginated list of cards', async () => {
      const query = { page: 1, perPage: 20 };

      const result = await controller.listCards(mockAdminUser, query);

      expect(result).toEqual(mockCardsList);
      expect(service.listCards).toHaveBeenCalledWith('assoc-1', query);
    });

    it('should pass search and status filters to service', async () => {
      const query = { page: 1, perPage: 10, search: 'João', status: 'ACTIVE' as any };

      await controller.listCards(mockAdminUser, query);

      expect(service.listCards).toHaveBeenCalledWith('assoc-1', query);
    });

    it('should use associationId from JWT', async () => {
      const query = { page: 1, perPage: 20 };

      await controller.listCards(mockAdminUser, query);

      expect(service.listCards).toHaveBeenCalledWith('assoc-1', query);
    });
  });

  // ===========================================
  // updateCardStatus
  // ===========================================

  describe('updateCardStatus', () => {
    it('should update status and return success with data', async () => {
      const dto = { status: 'INACTIVE' as const, statusReason: 'Inadimplência' };

      const result = await controller.updateCardStatus('card-1', dto);

      expect(result).toEqual({
        success: true,
        data: {
          id: 'card-1',
          status: 'INACTIVE',
          statusReason: 'Inadimplência',
        },
      });
      expect(service.updateCardStatus).toHaveBeenCalledWith('card-1', dto);
    });

    it('should propagate NotFoundException for invalid card', async () => {
      service.updateCardStatus = vi.fn().mockRejectedValue(
        new NotFoundException('Carteirinha não encontrada'),
      );

      const dto = { status: 'INACTIVE' as const };

      await expect(controller.updateCardStatus('invalid-card', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
