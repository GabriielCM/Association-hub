import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersService } from '../orders.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: any;
  let pointsService: any;
  let notificationsService: any;
  let stripeService: any;

  const mockOrder = {
    id: 'order-1',
    code: 'ABC123',
    userId: 'user-1',
    source: 'STORE',
    sourceId: 'cart-1',
    sourceName: 'Loja Online',
    status: 'CONFIRMED',
    paymentMethod: 'POINTS',
    subtotalPoints: 200,
    subtotalMoney: new Decimal(20.0),
    pointsUsed: 200,
    moneyPaid: null,
    cashbackEarned: 10,
    stripePaymentId: null,
    pointsTransactionId: 'tx-1',
    pickupCode: '{"type":"order_pickup","orderId":"order-1"}',
    createdAt: new Date(),
    items: [
      {
        id: 'item-1',
        productName: 'Produto Teste',
        quantity: 2,
        unitPricePoints: 100,
        unitPriceMoney: new Decimal(10.0),
        totalPoints: 200,
        totalMoney: new Decimal(20.0),
        type: 'PHYSICAL',
      },
    ],
    statusHistory: [],
    receipt: null,
  };

  beforeEach(() => {
    prisma = {
      order: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      orderStatusHistory: {
        create: vi.fn(),
      },
      orderReceipt: {
        create: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(prisma)),
    };

    pointsService = {
      creditPoints: vi.fn().mockResolvedValue({ id: 'tx-refund' }),
    };

    notificationsService = {
      create: vi.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    stripeService = {
      createRefund: vi.fn().mockResolvedValue({ id: 're_test' }),
    };

    service = new OrdersService(prisma, pointsService, notificationsService, stripeService);
  });

  // ===========================================
  // getUserOrders
  // ===========================================

  describe('getUserOrders', () => {
    it('should return user orders', async () => {
      prisma.order.findMany.mockResolvedValue([mockOrder]);
      prisma.order.count.mockResolvedValue(1);

      const result = await service.getUserOrders('user-1', {});

      expect(result.data).toHaveLength(1);
      expect(result.data[0].code).toBe('ABC123');
    });

    it('should filter by status', async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      await service.getUserOrders('user-1', { status: 'COMPLETED' as any });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'COMPLETED' }),
        }),
      );
    });

    it('should paginate results', async () => {
      prisma.order.findMany.mockResolvedValue([mockOrder]);
      prisma.order.count.mockResolvedValue(25);

      const result = await service.getUserOrders('user-1', { page: 2, limit: 10 });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  // ===========================================
  // getOrderById
  // ===========================================

  describe('getOrderById', () => {
    it('should return order by id', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getOrderById('order-1', 'user-1');

      expect(result.code).toBe('ABC123');
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.getOrderById('invalid', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when order belongs to another user', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, userId: 'other-user' });

      await expect(service.getOrderById('order-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should return order without userId check when not provided', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getOrderById('order-1');

      expect(result.code).toBe('ABC123');
    });
  });

  // ===========================================
  // getOrderByCode
  // ===========================================

  describe('getOrderByCode', () => {
    it('should return order by code', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getOrderByCode('ABC123', 'user-1');

      expect(result.id).toBe('order-1');
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.getOrderByCode('INVALID', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // createOrder
  // ===========================================

  describe('createOrder', () => {
    const createInput = {
      userId: 'user-1',
      source: 'STORE' as const,
      sourceId: 'cart-1',
      sourceName: 'Loja Online',
      items: [
        {
          productId: 'prod-1',
          productName: 'Produto',
          quantity: 2,
          unitPricePoints: 100,
          unitPriceMoney: 10.0,
          type: 'PHYSICAL' as const,
        },
      ],
      paymentMethod: 'POINTS' as const,
      pointsUsed: 200,
    };

    it('should create an order', async () => {
      prisma.order.create.mockResolvedValue(mockOrder);
      prisma.order.update.mockResolvedValue(mockOrder);

      const result = await service.createOrder(createInput);

      expect(result.code).toBe('ABC123');
      expect(prisma.order.create).toHaveBeenCalled();
      expect(notificationsService.create).toHaveBeenCalled();
    });

    it('should create vouchers for VOUCHER type items', async () => {
      const voucherInput = {
        ...createInput,
        items: [
          {
            ...createInput.items[0],
            type: 'VOUCHER' as const,
            voucherValidityDays: 30,
          },
        ],
      };

      prisma.order.create.mockResolvedValue({
        ...mockOrder,
        items: [{ ...mockOrder.items[0], type: 'VOUCHER', voucherCode: 'VCH-ABC123' }],
      });
      prisma.order.update.mockResolvedValue(mockOrder);

      await service.createOrder(voucherInput);

      expect(prisma.order.create).toHaveBeenCalled();
    });
  });

  // ===========================================
  // updateStatus
  // ===========================================

  describe('updateStatus', () => {
    it('should update order status', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' });
      prisma.order.update.mockResolvedValue({ ...mockOrder, status: 'READY' });
      prisma.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });

      const result = await service.updateStatus('order-1', { status: 'READY' as any }, 'admin-1', 'Admin');

      expect(result.status).toBe('READY');
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('invalid', { status: 'READY' as any }, 'admin-1', 'Admin'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should send notification on status update', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' });
      prisma.order.update.mockResolvedValue({ ...mockOrder, status: 'READY' });
      prisma.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });

      await service.updateStatus('order-1', { status: 'READY' as any }, 'admin-1', 'Admin');

      expect(notificationsService.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'COMPLETED' });

      await expect(
        service.updateStatus('order-1', { status: 'READY' as any }, 'admin-1', 'Admin'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // cancelOrder
  // ===========================================

  describe('cancelOrder', () => {
    it('should cancel order and refund points', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.order.update.mockResolvedValue({ ...mockOrder, status: 'CANCELLED' });
      prisma.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });

      const result = await service.cancelOrder(
        'order-1',
        { reason: 'Customer request', refundPoints: true },
        'admin-1',
        true,
      );

      expect(result.order.status).toBe('CANCELLED');
      expect(pointsService.creditPoints).toHaveBeenCalledWith(
        'user-1',
        200,
        'REFUND',
        expect.any(String),
        expect.any(Object),
        'order-1',
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelOrder('invalid', { reason: 'Test' }, 'admin-1', true),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when order is already cancelled', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'CANCELLED' });

      await expect(
        service.cancelOrder('order-1', { reason: 'Test' }, 'admin-1', true),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when order is completed', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'COMPLETED' });

      await expect(
        service.cancelOrder('order-1', { reason: 'Test' }, 'admin-1', true),
      ).rejects.toThrow(BadRequestException);
    });

    it('should refund via Stripe when money was paid', async () => {
      const moneyOrder = {
        ...mockOrder,
        paymentMethod: 'MONEY',
        pointsUsed: null,
        moneyPaid: new Decimal(20.0),
        stripePaymentId: 'pi_test',
      };
      prisma.order.findUnique.mockResolvedValue(moneyOrder);
      prisma.order.update.mockResolvedValue({ ...moneyOrder, status: 'CANCELLED' });
      prisma.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });

      await service.cancelOrder(
        'order-1',
        { reason: 'Customer request', refundMoney: true },
        'admin-1',
        true,
      );

      expect(stripeService.createRefund).toHaveBeenCalledWith('pi_test', undefined, 'requested_by_customer');
    });

    it('should throw ForbiddenException when user tries to cancel non-pending order', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' });

      await expect(
        service.cancelOrder('order-1', { reason: 'Test' }, 'user-1', false),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ===========================================
  // getOrderVouchers
  // ===========================================

  describe('getOrderVouchers', () => {
    it('should return order vouchers', async () => {
      const orderWithVouchers = {
        ...mockOrder,
        items: [
          {
            id: 'item-1',
            productName: 'Voucher Produto',
            type: 'VOUCHER',
            voucherCode: 'VCH-ABC123',
            voucherUsed: false,
            voucherUsedAt: null,
            voucherExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        ],
      };
      prisma.order.findUnique.mockResolvedValue(orderWithVouchers);

      const result = await service.getOrderVouchers('order-1', 'user-1');

      expect(result).toHaveLength(1);
      expect(result[0].voucherCode).toBe('VCH-ABC123');
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.getOrderVouchers('invalid', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // getReceipt
  // ===========================================

  describe('getReceipt', () => {
    it('should return existing receipt', async () => {
      const mockReceipt = { id: 'receipt-1', orderId: 'order-1', data: {} };
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, receipt: mockReceipt });

      const result = await service.getReceipt('order-1', 'user-1');

      expect(result.id).toBe('receipt-1');
    });

    it('should create receipt if not exists', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, receipt: null });
      prisma.orderReceipt.create.mockResolvedValue({ id: 'receipt-new', orderId: 'order-1', data: {} });

      const result = await service.getReceipt('order-1', 'user-1');

      expect(prisma.orderReceipt.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.getReceipt('invalid', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // validatePickup
  // ===========================================

  describe('validatePickup', () => {
    it('should validate pickup with order code', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'READY' });

      const result = await service.validatePickup('ABC123');

      expect(result.order.id).toBe('order-1');
      expect(result.canComplete).toBe(true);
    });

    it('should validate pickup with QR code data', async () => {
      prisma.order.findUnique
        .mockResolvedValueOnce(null) // First try by code
        .mockResolvedValueOnce({ ...mockOrder, status: 'READY' }); // Then by orderId

      const qrData = JSON.stringify({ type: 'order_pickup', orderId: 'order-1' });
      const result = await service.validatePickup(qrData);

      expect(result.order.id).toBe('order-1');
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.validatePickup('INVALID')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when order is cancelled', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'CANCELLED' });

      await expect(service.validatePickup('ABC123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when order is already completed', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'COMPLETED' });

      await expect(service.validatePickup('ABC123')).rejects.toThrow(BadRequestException);
    });

    it('should return canComplete false when order is not ready', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' });

      const result = await service.validatePickup('ABC123');

      expect(result.canComplete).toBe(false);
    });
  });

  // ===========================================
  // completeOrder
  // ===========================================

  describe('completeOrder', () => {
    it('should complete order', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'READY' });
      prisma.order.update.mockResolvedValue({ ...mockOrder, status: 'COMPLETED' });
      prisma.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });

      const result = await service.completeOrder('order-1', 'admin-1', 'Admin');

      expect(result.status).toBe('COMPLETED');
    });

    it('should throw NotFoundException when order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.completeOrder('invalid', 'admin-1', 'Admin')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when order is not ready', async () => {
      prisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: 'CONFIRMED' });

      await expect(service.completeOrder('order-1', 'admin-1', 'Admin')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ===========================================
  // getAllOrders (Admin)
  // ===========================================

  describe('getAllOrders', () => {
    it('should return all orders with pagination', async () => {
      prisma.order.findMany.mockResolvedValue([mockOrder]);
      prisma.order.count.mockResolvedValue(100);

      const result = await service.getAllOrders({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(100);
    });

    it('should filter by source', async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      await service.getAllOrders({ source: 'PDV' as any });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ source: 'PDV' }),
        }),
      );
    });

    it('should filter by userId', async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      await service.getAllOrders({ userId: 'user-1' });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-1' }),
        }),
      );
    });
  });
});
