import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckoutService } from '../services/checkout.service';
import { BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let prisma: any;
  let pointsService: any;
  let stripeService: any;
  let ordersService: any;
  let notificationsService: any;
  let cartService: any;

  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
    subtotalPoints: 200,
    subtotalMoney: new Decimal(20.0),
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        quantity: 2,
        unitPricePoints: 100,
        unitPriceMoney: new Decimal(10.0),
        product: {
          id: 'prod-1',
          name: 'Produto',
          type: 'PHYSICAL',
          isActive: true,
          stockType: 'limited',
          stockCount: 50,
          paymentOptions: 'BOTH',
          cashbackPercent: new Decimal(5),
          images: [{ url: 'https://example.com/img.jpg' }],
          eligiblePlans: [],
          allowMixedPayment: true,
        },
        variant: null,
      },
    ],
  };

  beforeEach(() => {
    prisma = {
      cart: {
        findUnique: vi.fn(),
      },
      storeProduct: {
        update: vi.fn(),
      },
      productVariant: {
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      subscriptionPlan: {
        findUnique: vi.fn(),
      },
    };

    pointsService = {
      getBalance: vi.fn().mockResolvedValue({ balance: 1000 }),
      debitPoints: vi.fn().mockResolvedValue({ id: 'tx-1' }),
      creditPoints: vi.fn().mockResolvedValue({ id: 'tx-2' }),
    };

    stripeService = {
      createCardPayment: vi.fn().mockResolvedValue({
        paymentIntentId: 'pi_test',
        clientSecret: 'secret_test',
      }),
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

    cartService = {
      clearCart: vi.fn().mockResolvedValue({ success: true }),
      reserveStock: vi.fn().mockResolvedValue({ reservedUntil: new Date() }),
      releaseReservation: vi.fn().mockResolvedValue(undefined),
    };

    service = new CheckoutService(
      prisma,
      pointsService,
      stripeService,
      ordersService,
      notificationsService,
      cartService,
    );
  });

  // ===========================================
  // validateCheckout
  // ===========================================

  describe('validateCheckout', () => {
    it('should validate cart and return checkout info', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.user.findUnique.mockResolvedValue({ subscription: null });

      const result = await service.validateCheckout('user-1');

      expect(result.isValid).toBe(true);
      expect(result.totalPoints).toBe(200);
      expect(result.totalMoney).toBe(20);
      expect(result.userBalance).toBe(1000);
      expect(result.canPayWithPoints).toBe(true);
    });

    it('should return invalid when cart is empty', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      const result = await service.validateCheckout('user-1');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Carrinho vazio');
    });

    it('should return invalid when product is inactive', async () => {
      const cartWithInactive = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            product: { ...mockCart.items[0].product, isActive: false },
          },
        ],
      };
      prisma.cart.findUnique.mockResolvedValue(cartWithInactive);
      prisma.user.findUnique.mockResolvedValue({ subscription: null });

      const result = await service.validateCheckout('user-1');

      expect(result.isValid).toBe(false);
      expect(result.errors?.[0]).toContain('disponível');
    });

    it('should return invalid when stock is insufficient', async () => {
      const cartWithLowStock = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            quantity: 100,
            product: { ...mockCart.items[0].product, stockCount: 5 },
          },
        ],
      };
      prisma.cart.findUnique.mockResolvedValue(cartWithLowStock);
      prisma.user.findUnique.mockResolvedValue({ subscription: null });

      const result = await service.validateCheckout('user-1');

      expect(result.isValid).toBe(false);
      expect(result.errors?.[0]).toContain('Estoque');
    });

    it('should apply subscription discount', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.subscriptionPlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        storeDiscount: 10,
      });

      const result = await service.validateCheckout('user-1', 'plan-1');

      expect(result.subscriptionDiscount).toBe(10);
      expect(result.totalPoints).toBeLessThan(200);
    });

    it('should return available payment methods', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.user.findUnique.mockResolvedValue({ subscription: null });

      const result = await service.validateCheckout('user-1');

      expect(result.availablePaymentMethods).toContain('POINTS');
      expect(result.availablePaymentMethods).toContain('MONEY');
      expect(result.availablePaymentMethods).toContain('MIXED');
    });
  });

  // ===========================================
  // processCheckout
  // ===========================================

  describe('processCheckout', () => {
    beforeEach(() => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.user.findUnique.mockResolvedValue({ subscription: null });
    });

    it('should process payment with points', async () => {
      const result = await service.processCheckout('user-1', { paymentMethod: 'POINTS' } as any) as any;

      expect(result.success).toBe(true);
      expect(result.orderId).toBe('order-1');
      expect(pointsService.debitPoints).toHaveBeenCalled();
      expect(ordersService.createOrder).toHaveBeenCalled();
      expect(cartService.clearCart).toHaveBeenCalled();
    });

    it('should throw when cart is empty', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      await expect(service.processCheckout('user-1', { paymentMethod: 'POINTS' } as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw when balance is insufficient for points payment', async () => {
      pointsService.getBalance.mockResolvedValue({ balance: 50 });

      await expect(service.processCheckout('user-1', { paymentMethod: 'POINTS' } as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should process payment with money', async () => {
      const result = await service.processCheckout('user-1', { paymentMethod: 'MONEY' } as any) as any;

      expect(result.requiresPayment).toBe(true);
      expect(result.paymentIntentId).toBe('pi_test');
      expect(stripeService.createCardPayment).toHaveBeenCalled();
      expect(cartService.reserveStock).toHaveBeenCalled();
    });

    it('should process mixed payment', async () => {
      const result = await service.processCheckout('user-1', { paymentMethod: 'MIXED', pointsToUse: 100 } as any) as any;

      expect(result.requiresPayment).toBe(true);
      expect(result.pointsUsed).toBe(100);
      expect(pointsService.debitPoints).toHaveBeenCalled();
      expect(stripeService.createCardPayment).toHaveBeenCalled();
    });

    it('should throw when points exceed balance in mixed payment', async () => {
      pointsService.getBalance.mockResolvedValue({ balance: 50 });

      await expect(service.processCheckout('user-1', { paymentMethod: 'MIXED', pointsToUse: 100 } as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw when points exceed order total in mixed payment', async () => {
      await expect(service.processCheckout('user-1', { paymentMethod: 'MIXED', pointsToUse: 500 } as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw for invalid payment method', async () => {
      await expect(service.processCheckout('user-1', { paymentMethod: 'INVALID' } as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ===========================================
  // processMoneyPayment (creates Stripe intent internally)
  // ===========================================

  describe('processMoneyPayment', () => {
    beforeEach(() => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.user.findUnique.mockResolvedValue({ subscription: null });
    });

    it('should create stripe payment intent for money payment', async () => {
      const result = await service.processCheckout('user-1', { paymentMethod: 'MONEY' } as any) as any;

      expect(result.requiresPayment).toBe(true);
      expect(result.paymentIntentId).toBe('pi_test');
      expect(stripeService.createCardPayment).toHaveBeenCalled();
      expect(cartService.reserveStock).toHaveBeenCalled();
    });
  });

  // ===========================================
  // confirmStripePayment
  // ===========================================

  describe('confirmStripePayment', () => {
    it('should confirm payment and create order', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);

      await service.confirmStripePayment('pi_test', 'user-1');

      expect(ordersService.createOrder).toHaveBeenCalled();
      expect(cartService.clearCart).toHaveBeenCalled();
      expect(notificationsService.create).toHaveBeenCalled();
    });

    it('should credit cashback when applicable', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);

      await service.confirmStripePayment('pi_test', 'user-1');

      expect(pointsService.creditPoints).toHaveBeenCalledWith(
        'user-1',
        expect.any(Number),
        'SHOP_CASHBACK',
        expect.any(String),
        expect.any(Object),
        expect.any(String),
      );
    });

    it('should handle cart not found gracefully', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      // Should not throw, just log warning
      await expect(service.confirmStripePayment('pi_test', 'user-1')).resolves.not.toThrow();
    });
  });

  // ===========================================
  // handlePaymentFailure
  // ===========================================

  describe('handlePaymentFailure', () => {
    it('should release cart reservation on payment failure', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);

      await service.handlePaymentFailure('pi_test', 'user-1');

      expect(cartService.releaseReservation).toHaveBeenCalledWith('user-1');
      expect(notificationsService.create).toHaveBeenCalled();
    });

    it('should handle cart not found gracefully', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      await expect(service.handlePaymentFailure('pi_test', 'user-1')).resolves.not.toThrow();
    });
  });
});
