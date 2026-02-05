import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { PointsService } from '../../points/points.service';
import { StripeService } from '../../stripe/stripe.service';
import { OrdersService } from '../../orders/orders.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CartService } from './cart.service';
import { OrderPaymentMethod, NotificationType, NotificationCategory } from '@prisma/client';
import { ProcessCheckoutDto } from '../dto/checkout.dto';
import { PaymentSource } from '../../stripe/dto/create-payment-intent.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService,
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
    private readonly notificationsService: NotificationsService,
    private readonly cartService: CartService,
  ) {}

  /**
   * Validate checkout (before payment)
   */
  async validateCheckout(userId: string, subscriptionPlanId?: string) {
    // Get cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return {
        isValid: false,
        errors: ['Carrinho vazio'],
        items: [],
        subtotalPoints: 0,
        subtotalMoney: 0,
        totalPoints: 0,
        totalMoney: 0,
        availablePaymentMethods: [],
        userBalance: 0,
        canPayWithPoints: false,
      };
    }

    const errors: string[] = [];
    let subtotalPoints = 0;
    let subtotalMoney = 0;
    const paymentMethodsSet = new Set<string>();

    // Validate each item
    for (const item of cart.items) {
      // Check if product is active
      if (!item.product.isActive) {
        errors.push(`Produto "${item.product.name}" não está mais disponível`);
        continue;
      }

      // Check stock
      const availableStock = item.variant
        ? item.variant.stockCount
        : (item.product.stockCount || 0);

      if (item.product.stockType === 'limited' && availableStock < item.quantity) {
        errors.push(`Estoque insuficiente para "${item.product.name}"`);
      }

      // Check eligible plans
      if (
        item.product.eligiblePlans.length > 0 &&
        subscriptionPlanId &&
        !item.product.eligiblePlans.includes(subscriptionPlanId)
      ) {
        errors.push(`"${item.product.name}" não está disponível para seu plano`);
      }

      // Calculate totals
      subtotalPoints += item.unitPricePoints * item.quantity;
      subtotalMoney += Number(item.unitPriceMoney) * item.quantity;

      // Determine payment options
      if (item.product.paymentOptions === 'POINTS_ONLY') {
        paymentMethodsSet.add('POINTS');
      } else if (item.product.paymentOptions === 'MONEY_ONLY') {
        paymentMethodsSet.add('MONEY');
      } else {
        paymentMethodsSet.add('POINTS');
        paymentMethodsSet.add('MONEY');
        if (item.product.allowMixedPayment) {
          paymentMethodsSet.add('MIXED');
        }
      }
    }

    // Get subscription discount
    let subscriptionDiscount = 0;
    if (subscriptionPlanId) {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: subscriptionPlanId },
      });
      if (plan) {
        subscriptionDiscount = plan.storeDiscount;
      }
    }

    // Apply discount
    const discountPoints = Math.floor(subtotalPoints * (subscriptionDiscount / 100));
    const discountMoney = subtotalMoney * (subscriptionDiscount / 100);
    const totalPoints = subtotalPoints - discountPoints;
    const totalMoney = subtotalMoney - discountMoney;

    // Get user balance
    const balance = await this.pointsService.getBalance(userId);

    // Determine available payment methods
    const availablePaymentMethods = Array.from(paymentMethodsSet);

    // If cart has mixed payment options, only allow common ones
    if (paymentMethodsSet.size === 1 && paymentMethodsSet.has('POINTS')) {
      // Only points allowed
    } else if (paymentMethodsSet.size === 1 && paymentMethodsSet.has('MONEY')) {
      // Only money allowed
    }

    return {
      isValid: errors.length === 0,
      errors,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        variantId: item.variantId,
        variantName: item.variant?.name,
        quantity: item.quantity,
        unitPricePoints: item.unitPricePoints,
        unitPriceMoney: Number(item.unitPriceMoney),
      })),
      subtotalPoints,
      subtotalMoney,
      subscriptionDiscount,
      discountPoints,
      discountMoney,
      totalPoints,
      totalMoney,
      availablePaymentMethods,
      userBalance: balance.balance,
      canPayWithPoints: balance.balance >= totalPoints,
    };
  }

  /**
   * Process checkout
   */
  async processCheckout(userId: string, dto: ProcessCheckoutDto) {
    // Validate first
    const validation = await this.validateCheckout(userId);

    if (!validation.isValid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Validate payment method
    if (!(validation.availablePaymentMethods as string[]).includes(dto.paymentMethod)) {
      throw new BadRequestException('Método de pagamento não disponível para este carrinho');
    }

    // Get cart with items
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      throw new BadRequestException('Carrinho não encontrado');
    }

    // Process based on payment method
    let result;

    switch (dto.paymentMethod) {
      case 'POINTS':
        result = await this.processPointsPayment(userId, cart, validation);
        break;

      case 'MONEY':
        result = await this.processMoneyPayment(userId, cart, validation);
        break;

      case 'MIXED':
        if (!dto.pointsToUse || dto.pointsToUse <= 0) {
          throw new BadRequestException('Informe a quantidade de pontos a usar');
        }
        result = await this.processMixedPayment(userId, cart, validation, dto.pointsToUse);
        break;

      default:
        throw new BadRequestException('Método de pagamento inválido');
    }

    return result;
  }

  /**
   * Process payment with points only
   */
  private async processPointsPayment(userId: string, cart: any, validation: any) {
    // Check balance
    if (validation.userBalance < validation.totalPoints) {
      throw new BadRequestException('Saldo insuficiente');
    }

    // Debit points
    const pointsTransaction = await this.pointsService.debitPoints(
      userId,
      validation.totalPoints,
      'SHOP_PURCHASE',
      'Compra na loja',
      { cartId: cart.id },
      cart.id,
    );

    // Deduct stock and create order
    const order = await this.completeOrder(
      userId,
      cart,
      validation,
      'POINTS',
      validation.totalPoints,
      0,
      0,
      pointsTransaction.id,
    );

    // Clear cart
    await this.cartService.clearCart(userId);

    // Get new balance
    const newBalance = await this.pointsService.getBalance(userId);

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code,
      pointsUsed: validation.totalPoints,
      newBalance: newBalance.balance,
    };
  }

  /**
   * Process payment with money only (returns PaymentIntent)
   */
  private async processMoneyPayment(userId: string, cart: any, validation: any) {
    const amountCents = Math.round(validation.totalMoney * 100);

    // Create Stripe PaymentIntent
    const paymentIntent = await this.stripeService.createCardPayment({
      amount: amountCents,
      source: PaymentSource.STORE,
      sourceId: cart.id,
      userId,
      description: 'Compra na Loja A-hub',
      metadata: {
        totalPoints: String(validation.totalPoints),
        totalMoney: String(validation.totalMoney),
      },
    });

    // Reserve stock
    await this.cartService.reserveStock(userId);

    return {
      success: true,
      requiresPayment: true,
      paymentIntentId: paymentIntent.paymentIntentId,
      clientSecret: paymentIntent.clientSecret,
      amount: amountCents,
      cartId: cart.id,
    };
  }

  /**
   * Process mixed payment (points + money)
   */
  private async processMixedPayment(
    userId: string,
    cart: any,
    validation: any,
    pointsToUse: number,
  ) {
    // Validate points
    if (pointsToUse > validation.userBalance) {
      throw new BadRequestException('Saldo de pontos insuficiente');
    }

    if (pointsToUse > validation.totalPoints) {
      throw new BadRequestException('Pontos excedem o valor do pedido');
    }

    // Calculate money to pay
    const pointsValue = pointsToUse; // 1 point = 1 unit
    const remainingMoney = validation.totalMoney - (pointsToUse * 0.01); // Assuming 1 point = R$ 0.01

    if (remainingMoney <= 0) {
      // Can pay entirely with points
      return this.processPointsPayment(userId, cart, {
        ...validation,
        totalPoints: pointsToUse,
      });
    }

    const amountCents = Math.round(remainingMoney * 100);

    // Debit points first
    const pointsTransaction = await this.pointsService.debitPoints(
      userId,
      pointsToUse,
      'SHOP_PURCHASE',
      'Compra na loja (parcial em pontos)',
      { cartId: cart.id, mixedPayment: true },
      cart.id,
    );

    // Create Stripe PaymentIntent for remaining
    const paymentIntent = await this.stripeService.createCardPayment({
      amount: amountCents,
      source: PaymentSource.STORE,
      sourceId: cart.id,
      userId,
      description: 'Compra na Loja A-hub (pagamento parcial)',
      metadata: {
        pointsUsed: String(pointsToUse),
        pointsTransactionId: pointsTransaction.id,
      },
    });

    // Reserve stock
    await this.cartService.reserveStock(userId);

    return {
      success: true,
      requiresPayment: true,
      paymentIntentId: paymentIntent.paymentIntentId,
      clientSecret: paymentIntent.clientSecret,
      amount: amountCents,
      pointsUsed: pointsToUse,
      pointsTransactionId: pointsTransaction.id,
      cartId: cart.id,
    };
  }

  /**
   * Complete order after payment
   */
  private async completeOrder(
    userId: string,
    cart: any,
    validation: any,
    paymentMethod: OrderPaymentMethod,
    pointsUsed: number,
    moneyPaid: number,
    cashbackEarned: number,
    pointsTransactionId?: string,
    stripePaymentId?: string,
  ) {
    // Deduct stock
    for (const item of cart.items) {
      if (item.variant) {
        await this.prisma.productVariant.update({
          where: { id: item.variant.id },
          data: { stockCount: { decrement: item.quantity } },
        });
      } else if (item.product.stockType === 'limited') {
        await this.prisma.storeProduct.update({
          where: { id: item.product.id },
          data: { stockCount: { decrement: item.quantity } },
        });
      }

      // Update sold count
      await this.prisma.storeProduct.update({
        where: { id: item.product.id },
        data: { soldCount: { increment: item.quantity } },
      });
    }

    // Create order
    const order = await this.ordersService.createOrder({
      userId,
      source: 'STORE',
      sourceId: cart.id,
      sourceName: 'Loja Online',
      items: cart.items.map((item: any) => ({
        productId: item.product.id,
        variantId: item.variant?.id,
        productName: item.product.name,
        variantName: item.variant?.name,
        productImage: item.product.images?.[0]?.url,
        quantity: item.quantity,
        unitPricePoints: item.unitPricePoints,
        unitPriceMoney: Number(item.unitPriceMoney),
        type: item.product.type,
        voucherValidityDays: item.product.voucherValidityDays,
      })),
      paymentMethod,
      pointsUsed: pointsUsed > 0 ? pointsUsed : undefined,
      moneyPaid: moneyPaid > 0 ? moneyPaid : undefined,
      cashbackEarned: cashbackEarned > 0 ? cashbackEarned : undefined,
      stripePaymentId,
      pointsTransactionId,
      pickupLocation: cart.items[0]?.product?.pickupLocation,
    });

    this.logger.log(`Order created from store checkout: ${order.code}`);

    return order;
  }

  /**
   * Confirm Stripe payment (called from webhook)
   */
  async confirmPayment(cartId: string, stripePaymentId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      this.logger.error(`Cart not found for payment confirmation: ${cartId}`);
      return;
    }

    const userId = cart.userId;

    // Recalculate totals
    let totalMoney = 0;
    let cashbackEarned = 0;

    for (const item of cart.items) {
      const itemTotal = Number(item.unitPriceMoney) * item.quantity;
      totalMoney += itemTotal;

      // Calculate cashback
      if (item.product.cashbackPercent) {
        cashbackEarned += Math.floor(itemTotal * (Number(item.product.cashbackPercent) / 100));
      }
    }

    // Credit cashback
    let cashbackTransactionId: string | undefined;
    if (cashbackEarned > 0) {
      const cashbackTx = await this.pointsService.creditPoints(
        userId,
        cashbackEarned,
        'SHOP_CASHBACK',
        'Cashback da compra na loja',
        { cartId, stripePaymentId },
        cartId,
      );
      cashbackTransactionId = cashbackTx.id;
    }

    // Complete order
    const order = await this.completeOrder(
      userId,
      cart,
      { totalPoints: 0, totalMoney },
      'MONEY',
      0,
      totalMoney,
      cashbackEarned,
      undefined,
      stripePaymentId,
    );

    // Clear cart
    await this.cartService.clearCart(userId);

    // Send notification
    await this.notificationsService.create({
      userId,
      type: NotificationType.POINTS_RECEIVED,
      category: NotificationCategory.POINTS,
      title: 'Compra Confirmada!',
      body: cashbackEarned > 0
        ? `Seu pedido foi confirmado! Você ganhou ${cashbackEarned} pontos de cashback.`
        : 'Seu pedido foi confirmado!',
      data: { orderId: order.id, orderCode: order.code, cashbackEarned },
    });

    this.logger.log(
      `Store payment confirmed for cart ${cartId}. Order: ${order.code}, Cashback: ${cashbackEarned}`,
    );
  }

  /**
   * Confirm Stripe payment (called from webhook with paymentIntentId)
   */
  async confirmStripePayment(paymentIntentId: string, userId: string) {
    // Find cart by user (webhook has userId from metadata)
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      this.logger.warn(`No cart found for user ${userId} during payment confirmation`);
      return;
    }

    await this.confirmPayment(cart.id, paymentIntentId);
  }

  /**
   * Handle payment failure (called from webhook)
   */
  async handlePaymentFailure(paymentIntentId: string, userId: string) {
    this.logger.warn(`Payment failed for user ${userId}, PaymentIntent: ${paymentIntentId}`);

    // Release stock reservation
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await this.cartService.releaseReservation(userId);
      this.logger.log(`Released stock reservation for user ${userId}`);
    }

    // Send notification
    await this.notificationsService.create({
      userId,
      type: NotificationType.ADMIN_ANNOUNCEMENT,
      category: NotificationCategory.SYSTEM,
      title: 'Pagamento Falhou',
      body: 'Seu pagamento não foi processado. Tente novamente.',
      data: { paymentIntentId },
    });
  }
}
