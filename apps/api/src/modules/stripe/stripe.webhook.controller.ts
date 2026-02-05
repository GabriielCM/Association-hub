import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  Logger,
  RawBodyRequest,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';
import { PdvCheckoutService } from '../pdv/pdv-checkout.service';
import { CheckoutService } from '../store/services/checkout.service';
import Stripe from 'stripe';

@ApiTags('webhooks')
@Controller('webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    @Inject(forwardRef(() => PdvCheckoutService))
    private readonly pdvCheckoutService: PdvCheckoutService,
    @Inject(forwardRef(() => CheckoutService))
    private readonly storeCheckoutService: CheckoutService,
  ) {}

  @Post('stripe')
  @ApiExcludeEndpoint() // Hide from Swagger - internal endpoint
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      this.logger.warn('Missing Stripe signature header');
      return res.status(400).send('Missing signature');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.warn('Missing raw body');
      return res.status(400).send('Missing body');
    }

    const event = this.stripeService.constructWebhookEvent(rawBody, signature);
    if (!event) {
      this.logger.warn('Invalid webhook signature');
      return res.status(400).send('Invalid signature');
    }

    this.logger.log(`Received Stripe webhook: ${event.type}`);

    try {
      await this.processEvent(event);
      return res.status(200).json({ received: true });
    } catch (error) {
      this.logger.error(`Error processing webhook ${event.type}`, error);
      return res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  private async processEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { source, sourceId, userId } = paymentIntent.metadata;

    this.logger.log(
      `Payment succeeded: ${paymentIntent.id} - ${source}/${sourceId} - User: ${userId}`,
    );

    try {
      if (source === 'pdv') {
        this.logger.log(`PDV payment confirmed for checkout ${sourceId}`);
        await this.pdvCheckoutService.confirmPixPayment(sourceId, paymentIntent.id);
      } else if (source === 'store') {
        this.logger.log(`Store payment confirmed for cart/order ${sourceId}`);
        await this.storeCheckoutService.confirmStripePayment(paymentIntent.id, userId);
      }
    } catch (error) {
      this.logger.error(`Error processing payment success for ${source}/${sourceId}`, error);
      throw error;
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const { source, sourceId, userId } = paymentIntent.metadata;

    this.logger.warn(
      `Payment failed: ${paymentIntent.id} - ${source}/${sourceId} - User: ${userId}`,
    );

    try {
      if (source === 'pdv') {
        this.logger.log(`PDV payment failed for checkout ${sourceId}`);
        await this.pdvCheckoutService.cancelCheckout(sourceId);
      } else if (source === 'store') {
        this.logger.log(`Store payment failed for cart/order ${sourceId}`);
        // Cart will auto-release on timeout, but log the failure
        await this.storeCheckoutService.handlePaymentFailure(paymentIntent.id, userId);
      }
    } catch (error) {
      this.logger.error(`Error processing payment failure for ${source}/${sourceId}`, error);
    }
  }

  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    this.logger.log(`Charge refunded: ${charge.id} - Amount: ${charge.amount_refunded}`);

    // Refunds are handled through OrdersService.cancelOrder
    // which is called directly by admin endpoints, not through webhooks
  }
}
