import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { StripeService, CreatePixPaymentOptions, CreateCardPaymentOptions } from '../stripe.service';
import { PaymentSource } from '../dto/create-payment-intent.dto';

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      paymentIntents: {
        create: vi.fn(),
        retrieve: vi.fn(),
        cancel: vi.fn(),
      },
      refunds: {
        create: vi.fn(),
      },
      webhooks: {
        constructEvent: vi.fn(),
      },
    })),
  };
});

describe('StripeService', () => {
  let service: StripeService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: vi.fn((key: string) => {
        if (key === 'STRIPE_SECRET_KEY') return 'sk_test_xxx';
        if (key === 'STRIPE_WEBHOOK_SECRET') return 'whsec_xxx';
        return undefined;
      }),
    } as any;

    service = new StripeService(configService);
  });

  describe('isConfigured', () => {
    it('should return true when Stripe is configured', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('should return false when Stripe key is missing', () => {
      const configWithoutKey = {
        get: vi.fn(() => undefined),
      } as any;
      const serviceWithoutKey = new StripeService(configWithoutKey);
      expect(serviceWithoutKey.isConfigured()).toBe(false);
    });
  });

  describe('createPixPayment', () => {
    it('should create a PIX payment intent', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
      };

      // Access internal stripe instance
      const stripe = (service as any).stripe;
      stripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const options: CreatePixPaymentOptions = {
        amount: 1000,
        source: PaymentSource.PDV,
        sourceId: 'checkout_123',
        userId: 'user_123',
        description: 'Test payment',
      };

      const result = await service.createPixPayment(options);

      expect(result.paymentIntentId).toBe('pi_test_123');
      expect(result.clientSecret).toBe('pi_test_123_secret');
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'brl',
        payment_method_types: ['pix'],
        description: 'Test payment',
        metadata: {
          source: PaymentSource.PDV,
          sourceId: 'checkout_123',
          userId: 'user_123',
        },
      });
    });

    it('should throw error when Stripe is not configured', async () => {
      const configWithoutKey = {
        get: vi.fn(() => undefined),
      } as any;
      const serviceWithoutKey = new StripeService(configWithoutKey);

      const options: CreatePixPaymentOptions = {
        amount: 1000,
        source: PaymentSource.PDV,
        sourceId: 'checkout_123',
        userId: 'user_123',
      };

      await expect(serviceWithoutKey.createPixPayment(options)).rejects.toThrow(
        'Stripe não configurado',
      );
    });
  });

  describe('createCardPayment', () => {
    it('should create a card payment intent', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_456',
        client_secret: 'pi_test_456_secret',
      };

      const stripe = (service as any).stripe;
      stripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const options: CreateCardPaymentOptions = {
        amount: 5000,
        source: PaymentSource.STORE,
        sourceId: 'cart_789',
        userId: 'user_456',
      };

      const result = await service.createCardPayment(options);

      expect(result.paymentIntentId).toBe('pi_test_456');
      expect(result.clientSecret).toBe('pi_test_456_secret');
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 5000,
        currency: 'brl',
        payment_method_types: ['card'],
        description: 'Pagamento Loja',
        metadata: {
          source: PaymentSource.STORE,
          sourceId: 'cart_789',
          userId: 'user_456',
        },
      });
    });
  });

  describe('getPaymentIntent', () => {
    it('should retrieve a payment intent', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        status: 'succeeded',
      };

      const stripe = (service as any).stripe;
      stripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      const result = await service.getPaymentIntent('pi_test_123');

      expect(result).toEqual(mockPaymentIntent);
      expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_test_123');
    });

    it('should return null on error', async () => {
      const stripe = (service as any).stripe;
      stripe.paymentIntents.retrieve.mockRejectedValue(new Error('Not found'));

      const result = await service.getPaymentIntent('pi_invalid');

      expect(result).toBeNull();
    });
  });

  describe('cancelPaymentIntent', () => {
    it('should cancel a payment intent', async () => {
      const stripe = (service as any).stripe;
      stripe.paymentIntents.cancel.mockResolvedValue({ id: 'pi_test_123' });

      const result = await service.cancelPaymentIntent('pi_test_123');

      expect(result).toBe(true);
      expect(stripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_test_123');
    });

    it('should return false on error', async () => {
      const stripe = (service as any).stripe;
      stripe.paymentIntents.cancel.mockRejectedValue(new Error('Cannot cancel'));

      const result = await service.cancelPaymentIntent('pi_test_123');

      expect(result).toBe(false);
    });
  });

  describe('createRefund', () => {
    it('should create a full refund', async () => {
      const mockRefund = {
        id: 're_test_123',
        amount: 1000,
      };

      const stripe = (service as any).stripe;
      stripe.refunds.create.mockResolvedValue(mockRefund);

      const result = await service.createRefund('pi_test_123');

      expect(result).toEqual(mockRefund);
      expect(stripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_test_123',
        amount: undefined,
        reason: undefined,
      });
    });

    it('should create a partial refund with reason', async () => {
      const mockRefund = {
        id: 're_test_456',
        amount: 500,
      };

      const stripe = (service as any).stripe;
      stripe.refunds.create.mockResolvedValue(mockRefund);

      const result = await service.createRefund('pi_test_123', 500, 'requested_by_customer');

      expect(result).toEqual(mockRefund);
      expect(stripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_test_123',
        amount: 500,
        reason: 'requested_by_customer',
      });
    });
  });

  describe('getPixDetailsFromPaymentIntent', () => {
    it('should extract PIX details from payment intent', () => {
      const paymentIntent = {
        next_action: {
          type: 'pix_display_qr_code',
          pix_display_qr_code: {
            image_url_png: 'https://example.com/qr.png',
            data: '00020126580014br.gov.bcb.pix...',
            expires_at: 1700000000,
          },
        },
      } as any;

      const result = service.getPixDetailsFromPaymentIntent(paymentIntent);

      expect(result).toEqual({
        qrCode: 'https://example.com/qr.png',
        copyPaste: '00020126580014br.gov.bcb.pix...',
        expiresAt: new Date(1700000000 * 1000),
      });
    });

    it('should return null when no PIX action', () => {
      const paymentIntent = {
        next_action: null,
      } as any;

      const result = service.getPixDetailsFromPaymentIntent(paymentIntent);

      expect(result).toBeNull();
    });
  });
});
