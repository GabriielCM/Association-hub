import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentSource } from './dto/create-payment-intent.dto';

export interface CreatePixPaymentOptions {
  amount: number; // centavos
  source: PaymentSource;
  sourceId: string;
  userId: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface CreateCardPaymentOptions {
  amount: number; // centavos
  source: PaymentSource;
  sourceId: string;
  userId: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PixPaymentResult {
  paymentIntentId: string;
  clientSecret: string;
  pixQrCode: string;
  pixCopyPaste: string;
  expiresAt: Date;
}

export interface CardPaymentResult {
  paymentIntentId: string;
  clientSecret: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured. Stripe features will be disabled.');
      this.stripe = null as any;
    } else {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2026-01-28.clover',
        typescript: true,
      });
    }
  }

  /**
   * Check if Stripe is configured
   */
  isConfigured(): boolean {
    return !!this.stripe;
  }

  /**
   * Create a PIX PaymentIntent
   */
  async createPixPayment(options: CreatePixPaymentOptions): Promise<PixPaymentResult> {
    if (!this.isConfigured()) {
      throw new BadRequestException('Stripe não configurado');
    }

    const { amount, source, sourceId, userId, description, metadata } = options;

    this.logger.log(`Creating PIX payment: ${amount} centavos for ${source}/${sourceId}`);

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'brl',
        payment_method_types: ['pix'],
        payment_method_data: { type: 'pix' as any },
        confirm: true,
        description: description || `Pagamento ${source === PaymentSource.PDV ? 'PDV' : 'Loja'}`,
        metadata: {
          source,
          sourceId,
          userId,
          ...metadata,
        },
      });

      const pixDetails = this.getPixDetailsFromPaymentIntent(paymentIntent);
      if (!pixDetails) {
        this.logger.error('PIX QR code not available after confirmation', {
          status: paymentIntent.status,
          nextAction: paymentIntent.next_action?.type,
        });
        throw new BadRequestException('Falha ao gerar QR Code PIX');
      }

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        pixQrCode: pixDetails.qrCode,
        pixCopyPaste: pixDetails.copyPaste,
        expiresAt: pixDetails.expiresAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Failed to create PIX payment', error);
      throw new BadRequestException('Falha ao criar pagamento PIX');
    }
  }

  /**
   * Create a Card PaymentIntent
   */
  async createCardPayment(options: CreateCardPaymentOptions): Promise<CardPaymentResult> {
    if (!this.isConfigured()) {
      throw new BadRequestException('Stripe não configurado');
    }

    const { amount, source, sourceId, userId, description, metadata } = options;

    this.logger.log(`Creating card payment: ${amount} centavos for ${source}/${sourceId}`);

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'brl',
        payment_method_types: ['card'],
        description: description || `Pagamento ${source === PaymentSource.PDV ? 'PDV' : 'Loja'}`,
        metadata: {
          source,
          sourceId,
          userId,
          ...metadata,
        },
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
      };
    } catch (error) {
      this.logger.error('Failed to create card payment', error);
      throw new BadRequestException('Falha ao criar pagamento com cartão');
    }
  }

  /**
   * Retrieve a PaymentIntent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent ${paymentIntentId}`, error);
      return null;
    }
  }

  /**
   * Cancel a PaymentIntent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId);
      this.logger.log(`Cancelled payment intent ${paymentIntentId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to cancel payment intent ${paymentIntentId}`, error);
      return false;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer',
  ): Promise<Stripe.Refund | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount, // undefined = full refund
        reason,
      });

      this.logger.log(`Created refund for ${paymentIntentId}: ${refund.id}`);
      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund for ${paymentIntentId}`, error);
      return null;
    }
  }

  /**
   * Verify webhook signature
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event | null {
    if (!this.isConfigured()) {
      return null;
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured');
      return null;
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Webhook signature verification failed', error);
      return null;
    }
  }

  /**
   * Get PIX QR code from a confirmed PaymentIntent
   */
  getPixDetailsFromPaymentIntent(paymentIntent: Stripe.PaymentIntent): {
    qrCode: string;
    copyPaste: string;
    expiresAt: Date;
  } | null {
    const nextAction = paymentIntent.next_action;

    if (nextAction?.type === 'pix_display_qr_code') {
      const pixData = nextAction.pix_display_qr_code;
      return {
        qrCode: pixData?.image_url_png || '',
        copyPaste: pixData?.data || '',
        expiresAt: new Date((pixData?.expires_at || 0) * 1000),
      };
    }

    return null;
  }
}
