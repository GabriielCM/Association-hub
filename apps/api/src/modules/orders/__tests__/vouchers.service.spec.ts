import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VouchersService } from '../vouchers.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('VouchersService', () => {
  let service: VouchersService;
  let prisma: any;
  let notificationsService: any;

  const mockVoucher = {
    id: 'item-1',
    orderId: 'order-1',
    productName: 'Voucher Almoço',
    productImage: 'https://example.com/img.jpg',
    voucherCode: 'VOUCHER-ABC123',
    voucherUsed: false,
    voucherUsedAt: null,
    voucherExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    type: 'VOUCHER',
    createdAt: new Date(),
    order: {
      id: 'order-1',
      code: 'ORD-001',
      userId: 'user-1',
      status: 'CONFIRMED',
      createdAt: new Date(),
    },
  };

  beforeEach(() => {
    prisma = {
      orderItem: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    };

    notificationsService = {
      create: vi.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    service = new VouchersService(prisma, notificationsService);
  });

  // ===========================================
  // getVoucherByCode
  // ===========================================

  describe('getVoucherByCode', () => {
    it('should return voucher by code', async () => {
      prisma.orderItem.findFirst.mockResolvedValue(mockVoucher);

      const result = await service.getVoucherByCode('VOUCHER-ABC123');

      expect(result.voucherCode).toBe('VOUCHER-ABC123');
      expect(result.productName).toBe('Voucher Almoço');
    });

    it('should throw NotFoundException when voucher not found', async () => {
      prisma.orderItem.findFirst.mockResolvedValue(null);

      await expect(service.getVoucherByCode('INVALID')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // validateVoucher
  // ===========================================

  describe('validateVoucher', () => {
    it('should validate an active voucher', async () => {
      prisma.orderItem.findFirst.mockResolvedValue(mockVoucher);

      const result = await service.validateVoucher('VOUCHER-ABC123');

      expect(result.valid).toBe(true);
      expect(result.voucher.voucherCode).toBe('VOUCHER-ABC123');
    });

    it('should return invalid when voucher not found', async () => {
      prisma.orderItem.findFirst.mockResolvedValue(null);

      await expect(service.validateVoucher('INVALID')).rejects.toThrow(NotFoundException);
    });

    it('should return invalid when voucher is already used', async () => {
      prisma.orderItem.findFirst.mockResolvedValue({
        ...mockVoucher,
        voucherUsed: true,
        voucherUsedAt: new Date(),
      });

      const result = await service.validateVoucher('VOUCHER-ABC123');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('utilizado');
    });

    it('should return invalid when voucher is expired', async () => {
      prisma.orderItem.findFirst.mockResolvedValue({
        ...mockVoucher,
        voucherExpiresAt: new Date(Date.now() - 1000),
      });

      const result = await service.validateVoucher('VOUCHER-ABC123');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('expirado');
    });

    it('should return invalid when order is cancelled', async () => {
      prisma.orderItem.findFirst.mockResolvedValue({
        ...mockVoucher,
        order: { ...mockVoucher.order, status: 'CANCELLED' },
      });

      const result = await service.validateVoucher('VOUCHER-ABC123');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('cancelado');
    });
  });

  // ===========================================
  // markVoucherAsUsed
  // ===========================================

  describe('markVoucherAsUsed', () => {
    it('should mark voucher as used', async () => {
      prisma.orderItem.findFirst.mockResolvedValue(mockVoucher);
      prisma.orderItem.update.mockResolvedValue({
        ...mockVoucher,
        voucherUsed: true,
        voucherUsedAt: new Date(),
      });

      const result = await service.markVoucherAsUsed('VOUCHER-ABC123', 'admin-1');

      expect(result.voucherUsed).toBe(true);
      expect(prisma.orderItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: expect.objectContaining({
          voucherUsed: true,
        }),
      });
    });

    it('should throw NotFoundException when voucher not found', async () => {
      prisma.orderItem.findFirst.mockResolvedValue(null);

      await expect(service.markVoucherAsUsed('INVALID', 'admin-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when voucher is already used', async () => {
      prisma.orderItem.findFirst.mockResolvedValue({
        ...mockVoucher,
        voucherUsed: true,
      });

      await expect(service.markVoucherAsUsed('VOUCHER-ABC123', 'admin-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when voucher is expired', async () => {
      prisma.orderItem.findFirst.mockResolvedValue({
        ...mockVoucher,
        voucherExpiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.markVoucherAsUsed('VOUCHER-ABC123', 'admin-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should send notification when voucher is used', async () => {
      prisma.orderItem.findFirst.mockResolvedValue(mockVoucher);
      prisma.orderItem.update.mockResolvedValue({
        ...mockVoucher,
        voucherUsed: true,
      });

      await service.markVoucherAsUsed('VOUCHER-ABC123', 'admin-1');

      expect(notificationsService.create).toHaveBeenCalled();
    });
  });

  // ===========================================
  // getUserVouchers
  // ===========================================

  describe('getUserVouchers', () => {
    it('should return user vouchers', async () => {
      prisma.orderItem.findMany.mockResolvedValue([mockVoucher]);

      const result = await service.getUserVouchers('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].voucherCode).toBe('VOUCHER-ABC123');
    });

    it('should filter used vouchers by default', async () => {
      prisma.orderItem.findMany.mockResolvedValue([]);

      await service.getUserVouchers('user-1');

      expect(prisma.orderItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            voucherUsed: false,
          }),
        }),
      );
    });

    it('should include used vouchers when specified', async () => {
      prisma.orderItem.findMany.mockResolvedValue([]);

      await service.getUserVouchers('user-1', { includeUsed: true });

      expect(prisma.orderItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            voucherUsed: false,
          }),
        }),
      );
    });

    it('should return empty array when no vouchers', async () => {
      prisma.orderItem.findMany.mockResolvedValue([]);

      const result = await service.getUserVouchers('user-1');

      expect(result).toHaveLength(0);
    });
  });

  // ===========================================
  // getVouchersExpiringSoon
  // ===========================================

  describe('getVouchersExpiringSoon', () => {
    it('should return vouchers expiring soon', async () => {
      prisma.orderItem.findMany.mockResolvedValue([mockVoucher]);

      const result = await service.getVouchersExpiringSoon(7);

      expect(result).toHaveLength(1);
    });

    it('should filter by days until expiration', async () => {
      prisma.orderItem.findMany.mockResolvedValue([]);

      await service.getVouchersExpiringSoon(3);

      expect(prisma.orderItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'VOUCHER',
            voucherUsed: false,
            voucherExpiresAt: expect.objectContaining({
              not: null,
              lte: expect.any(Date),
              gt: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });

  // ===========================================
  // sendExpirationWarnings
  // ===========================================

  describe('sendExpirationWarnings', () => {
    it('should send warnings for expiring vouchers', async () => {
      prisma.orderItem.findMany.mockResolvedValue([{
        ...mockVoucher,
        voucherExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      }]);

      const count = await service.sendExpirationWarnings();

      expect(count).toBe(1);
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          title: expect.stringContaining('Expirando'),
        }),
      );
    });

    it('should not send notifications when no expiring vouchers', async () => {
      prisma.orderItem.findMany.mockResolvedValue([]);

      const count = await service.sendExpirationWarnings();

      expect(count).toBe(0);
      expect(notificationsService.create).not.toHaveBeenCalled();
    });
  });
});
