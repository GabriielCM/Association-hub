import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PdvCheckoutService } from '../pdv-checkout.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('PdvCheckoutService', () => {
  let service: PdvCheckoutService;
  let prisma: any;
  let pointsService: any;
  let stripeService: any;
  let ordersService: any;
  let notificationsService: any;

  const mockProduct = {
    id: 'pdvprod-1',
    pdvId: 'pdv-1',
    name: 'Café',
    pricePoints: 50,
    priceMoney: new Decimal(5.0),
    stock: 100,
    isActive: true,
  };

  const mockPdv = {
    id: 'pdv-1',
    name: 'PDV Central',
    location: 'Entrada',
    status: 'ACTIVE',
    products: [mockProduct],
  };

  const mockCheckout = {
    id: 'checkout-1',
    pdvId: 'pdv-1',
    code: 'ABCD1234',
    status: 'PENDING',
    totalPoints: 100,
    totalMoney: new Decimal(10.0),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    items: [
      {
        product_id: 'pdvprod-1',
        name: 'Café',
        quantity: 2,
        unit_price_points: 50,
        unit_price_money: 5.0,
      },
    ],
    pdv: mockPdv,
    paidByUserId: null,
    stripePaymentIntentId: null,
  };

  beforeEach(() => {
    prisma = {
      pdv: {
        findUnique: vi.fn(),
      },
      pdvProduct: {
        update: vi.fn(),
      },
      pdvCheckout: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      pdvSale: {
        create: vi.fn(),
        update: vi.fn(),
      },
      association: {
        findFirst: vi.fn().mockResolvedValue({ cashbackPercent: 5 }),
      },
      userSubscription: {
        findUnique: vi.fn().mockResolvedValue(null), // No active subscription by default
      },
      $transaction: vi.fn((callback) => callback(prisma)),
    };

    pointsService = {
      getBalance: vi.fn().mockResolvedValue({ balance: 1000 }),
      debitPoints: vi.fn().mockResolvedValue({ id: 'tx-1' }),
      creditPoints: vi.fn().mockResolvedValue({ id: 'tx-2' }),
    };

    stripeService = {
      createPixPayment: vi.fn().mockResolvedValue({
        paymentIntentId: 'pi_test',
        clientSecret: 'secret_test',
        pixQrCode: 'qrcode_data',
        pixCopyPaste: 'copy_paste_data',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      }),
      cancelPaymentIntent: vi.fn().mockResolvedValue(undefined),
    };

    ordersService = {
      createOrder: vi.fn().mockResolvedValue({
        id: 'order-1',
        code: 'ORD-001',
      }),
    };

    notificationsService = {
      create: vi.fn().mockResolvedValue({ id: 'notif-1' }),
    };

    service = new PdvCheckoutService(
      prisma,
      pointsService,
      stripeService,
      ordersService,
      notificationsService,
    );
  });

  // ===========================================
  // createCheckout
  // ===========================================

  describe('createCheckout', () => {
    const createDto = {
      items: [{ productId: 'pdvprod-1', quantity: 2 }],
    };

    it('should create a checkout', async () => {
      prisma.pdv.findUnique.mockResolvedValue(mockPdv);
      prisma.pdvCheckout.findUnique.mockResolvedValue(null); // No existing code
      prisma.pdvCheckout.create.mockResolvedValue(mockCheckout);

      const result = await service.createCheckout('pdv-1', createDto);

      expect(result.totalPoints).toBe(100);
      expect(result.qrCodeData).toBeDefined();
    });

    it('should throw NotFoundException when PDV not found', async () => {
      prisma.pdv.findUnique.mockResolvedValue(null);

      await expect(service.createCheckout('invalid', createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when PDV is not active', async () => {
      prisma.pdv.findUnique.mockResolvedValue({ ...mockPdv, status: 'MAINTENANCE' });

      await expect(service.createCheckout('pdv-1', createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when product not found', async () => {
      prisma.pdv.findUnique.mockResolvedValue({ ...mockPdv, products: [] });

      await expect(service.createCheckout('pdv-1', createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      prisma.pdv.findUnique.mockResolvedValue({
        ...mockPdv,
        products: [{ ...mockProduct, stock: 1 }],
      });

      await expect(service.createCheckout('pdv-1', createDto)).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // getCheckoutStatus
  // ===========================================

  describe('getCheckoutStatus', () => {
    it('should return checkout status', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(mockCheckout);

      const result = await service.getCheckoutStatus('ABCD1234');

      expect(result.status).toBe('PENDING');
      expect(result.totalPoints).toBe(100);
    });

    it('should throw NotFoundException when checkout not found', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(null);

      await expect(service.getCheckoutStatus('INVALID')).rejects.toThrow(NotFoundException);
    });

    it('should return expired status when checkout is expired', async () => {
      const expiredCheckout = {
        ...mockCheckout,
        expiresAt: new Date(Date.now() - 1000),
      };
      prisma.pdvCheckout.findUnique.mockResolvedValue(expiredCheckout);
      prisma.pdvCheckout.update.mockResolvedValue({ ...expiredCheckout, status: 'EXPIRED' });

      const result = await service.getCheckoutStatus('ABCD1234');

      expect(result.status).toBe('EXPIRED');
    });
  });

  // ===========================================
  // getCheckoutDetails
  // ===========================================

  describe('getCheckoutDetails', () => {
    it('should return checkout details for user', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(mockCheckout);

      const result = await service.getCheckoutDetails('ABCD1234', 'user-1');

      expect(result.pdv.name).toBe('PDV Central');
      expect(result.items).toHaveLength(1);
      expect(result.user.canPayWithPoints).toBe(true);
    });

    it('should throw NotFoundException when checkout not found', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(null);

      await expect(service.getCheckoutDetails('INVALID', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should indicate insufficient balance', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(mockCheckout);
      pointsService.getBalance.mockResolvedValue({ balance: 50 });

      const result = await service.getCheckoutDetails('ABCD1234', 'user-1');

      expect(result.user.canPayWithPoints).toBe(false);
    });

    it('should throw BadRequestException when checkout is already paid', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue({ ...mockCheckout, status: 'PAID' });

      await expect(service.getCheckoutDetails('ABCD1234', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when checkout is expired', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue({
        ...mockCheckout,
        expiresAt: new Date(Date.now() - 1000),
      });
      prisma.pdvCheckout.update.mockResolvedValue({ ...mockCheckout, status: 'EXPIRED' });

      await expect(service.getCheckoutDetails('ABCD1234', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ===========================================
  // payWithPoints
  // ===========================================

  describe('payWithPoints', () => {
    it('should process payment with points', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(mockCheckout);
      prisma.pdvCheckout.update.mockResolvedValue({ ...mockCheckout, status: 'PAID' });
      prisma.pdvProduct.update.mockResolvedValue(mockProduct);
      prisma.pdvSale.create.mockResolvedValue({ id: 'sale-1' });
      prisma.pdvSale.update.mockResolvedValue({ id: 'sale-1' });

      const result = await service.payWithPoints('ABCD1234', 'user-1');

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('tx-1');
      expect(pointsService.debitPoints).toHaveBeenCalled();
      expect(ordersService.createOrder).toHaveBeenCalled();
    });

    it('should throw NotFoundException when checkout not found', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(null);

      await expect(service.payWithPoints('INVALID', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when checkout is not pending', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue({ ...mockCheckout, status: 'PAID' });

      await expect(service.payWithPoints('ABCD1234', 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when balance is insufficient', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(mockCheckout);
      pointsService.getBalance.mockResolvedValue({ balance: 50 });

      await expect(service.payWithPoints('ABCD1234', 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should deduct stock on successful payment', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(mockCheckout);
      prisma.pdvCheckout.update.mockResolvedValue({ ...mockCheckout, status: 'PAID' });
      prisma.pdvProduct.update.mockResolvedValue(mockProduct);
      prisma.pdvSale.create.mockResolvedValue({ id: 'sale-1' });
      prisma.pdvSale.update.mockResolvedValue({ id: 'sale-1' });

      await service.payWithPoints('ABCD1234', 'user-1');

      expect(prisma.pdvProduct.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { stock: { decrement: 2 } },
        }),
      );
    });

    it('should throw BadRequestException when checkout is expired', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue({
        ...mockCheckout,
        expiresAt: new Date(Date.now() - 1000),
      });
      prisma.pdvCheckout.update.mockResolvedValue({ ...mockCheckout, status: 'EXPIRED' });

      await expect(service.payWithPoints('ABCD1234', 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // initiatePixPayment
  // ===========================================

  describe('initiatePixPayment', () => {
    it('should initiate PIX payment', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(mockCheckout);
      prisma.pdvCheckout.update.mockResolvedValue({ ...mockCheckout, status: 'AWAITING_PIX' });

      const result = await service.initiatePixPayment('ABCD1234', 'user-1');

      expect(result.paymentIntentId).toBe('pi_test');
      expect(result.pixQrCode).toBe('qrcode_data');
      expect(stripeService.createPixPayment).toHaveBeenCalled();
    });

    it('should throw NotFoundException when checkout not found', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(null);

      await expect(service.initiatePixPayment('INVALID', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when checkout is not pending', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue({ ...mockCheckout, status: 'PAID' });

      await expect(service.initiatePixPayment('ABCD1234', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when checkout is expired', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue({
        ...mockCheckout,
        expiresAt: new Date(Date.now() - 1000),
      });
      prisma.pdvCheckout.update.mockResolvedValue({ ...mockCheckout, status: 'EXPIRED' });

      await expect(service.initiatePixPayment('ABCD1234', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ===========================================
  // confirmPixPayment
  // ===========================================

  describe('confirmPixPayment', () => {
    it('should confirm PIX payment', async () => {
      const awaitingCheckout = {
        ...mockCheckout,
        status: 'AWAITING_PIX',
        paidByUserId: 'user-1',
      };
      prisma.pdvCheckout.findUnique.mockResolvedValue(awaitingCheckout);
      prisma.pdvCheckout.update.mockResolvedValue({ ...awaitingCheckout, status: 'PAID' });
      prisma.pdvProduct.update.mockResolvedValue(mockProduct);
      prisma.pdvSale.create.mockResolvedValue({ id: 'sale-1' });
      prisma.pdvSale.update.mockResolvedValue({ id: 'sale-1' });

      await service.confirmPixPayment('checkout-1', 'pi_test');

      expect(prisma.pdvCheckout.update).toHaveBeenCalled();
      expect(ordersService.createOrder).toHaveBeenCalled();
    });

    it('should handle checkout not found gracefully', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(null);

      // Should not throw, just return
      await expect(service.confirmPixPayment('invalid', 'pi_test')).resolves.not.toThrow();
    });

    it('should skip if checkout is not awaiting PIX', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue({ ...mockCheckout, status: 'PAID' });

      await service.confirmPixPayment('checkout-1', 'pi_test');

      expect(prisma.pdvCheckout.update).not.toHaveBeenCalled();
    });

    it('should credit cashback when applicable', async () => {
      const checkoutWithCashback = {
        ...mockCheckout,
        status: 'AWAITING_PIX',
        paidByUserId: 'user-1',
        totalMoney: new Decimal(100.0), // Higher value so cashback = 5 pts
      };
      prisma.pdvCheckout.findUnique.mockResolvedValue(checkoutWithCashback);
      prisma.pdvCheckout.update.mockResolvedValue({ ...checkoutWithCashback, status: 'PAID' });
      prisma.pdvProduct.update.mockResolvedValue(mockProduct);
      prisma.pdvSale.create.mockResolvedValue({ id: 'sale-1' });
      prisma.pdvSale.update.mockResolvedValue({ id: 'sale-1' });

      await service.confirmPixPayment('checkout-1', 'pi_test');

      expect(pointsService.creditPoints).toHaveBeenCalled();
    });
  });

  // ===========================================
  // cancelCheckout
  // ===========================================

  describe('cancelCheckout', () => {
    it('should cancel a checkout', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(mockCheckout);
      prisma.pdvCheckout.update.mockResolvedValue({ ...mockCheckout, status: 'CANCELLED' });

      const result = await service.cancelCheckout('ABCD1234');

      expect(result.success).toBe(true);
      expect(prisma.pdvCheckout.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'CANCELLED' },
        }),
      );
    });

    it('should throw NotFoundException when checkout not found', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue(null);

      await expect(service.cancelCheckout('invalid')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when checkout is already paid', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue({ ...mockCheckout, status: 'PAID' });

      await expect(service.cancelCheckout('ABCD1234')).rejects.toThrow(BadRequestException);
    });

    it('should cancel Stripe payment intent if exists', async () => {
      prisma.pdvCheckout.findUnique.mockResolvedValue({
        ...mockCheckout,
        stripePaymentIntentId: 'pi_test',
      });
      prisma.pdvCheckout.update.mockResolvedValue({ ...mockCheckout, status: 'CANCELLED' });

      await service.cancelCheckout('ABCD1234');

      expect(stripeService.cancelPaymentIntent).toHaveBeenCalledWith('pi_test');
    });
  });
});
