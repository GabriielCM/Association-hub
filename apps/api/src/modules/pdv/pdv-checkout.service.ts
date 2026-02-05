import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PointsService } from '../points/points.service';
import { StripeService } from '../stripe/stripe.service';
import { OrdersService } from '../orders/orders.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PdvCheckoutStatus, PdvPaymentMethod, NotificationType, NotificationCategory } from '@prisma/client';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { PaymentSource } from '../stripe/dto/create-payment-intent.dto';

@Injectable()
export class PdvCheckoutService {
  private readonly logger = new Logger(PdvCheckoutService.name);
  private readonly CHECKOUT_EXPIRATION_MINUTES = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService,
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Generate unique checkout code
   */
  private generateCheckoutCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create a new checkout
   */
  async createCheckout(pdvId: string, dto: CreateCheckoutDto) {
    // Get PDV and products
    const pdv = await this.prisma.pdv.findUnique({
      where: { id: pdvId },
      include: {
        products: {
          where: { isActive: true },
        },
      },
    });

    if (!pdv) {
      throw new NotFoundException('PDV não encontrado');
    }

    if (pdv.status !== 'ACTIVE') {
      throw new BadRequestException('PDV não está ativo');
    }

    // Validate products and calculate totals
    const productMap = new Map(pdv.products.map((p) => [p.id, p]));
    const checkoutItems: any[] = [];
    let totalPoints = 0;
    let totalMoney = 0;

    for (const item of dto.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new BadRequestException(`Produto ${item.productId} não encontrado`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Estoque insuficiente para ${product.name}`);
      }

      const itemPoints = product.pricePoints * item.quantity;
      const itemMoney = Number(product.priceMoney) * item.quantity;

      checkoutItems.push({
        product_id: product.id,
        name: product.name,
        quantity: item.quantity,
        unit_price_points: product.pricePoints,
        unit_price_money: Number(product.priceMoney),
      });

      totalPoints += itemPoints;
      totalMoney += itemMoney;
    }

    // Generate unique code
    let code = this.generateCheckoutCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await this.prisma.pdvCheckout.findUnique({ where: { code } });
      if (!existing) break;
      code = this.generateCheckoutCode();
      attempts++;
    }

    // Create checkout
    const expiresAt = new Date(Date.now() + this.CHECKOUT_EXPIRATION_MINUTES * 60 * 1000);

    const checkout = await this.prisma.pdvCheckout.create({
      data: {
        code,
        pdvId,
        items: checkoutItems,
        totalPoints,
        totalMoney: new Decimal(totalMoney),
        expiresAt,
      },
    });

    this.logger.log(`Checkout created: ${code} for PDV ${pdvId}`);

    return {
      code: checkout.code,
      items: checkoutItems,
      totalPoints,
      totalMoney,
      expiresAt,
      qrCodeData: JSON.stringify({
        type: 'pdv_checkout',
        code: checkout.code,
        pdvId,
      }),
    };
  }

  /**
   * Get checkout status
   */
  async getCheckoutStatus(code: string) {
    const checkout = await this.prisma.pdvCheckout.findUnique({
      where: { code },
      include: {
        pdv: {
          select: { name: true, location: true },
        },
      },
    });

    if (!checkout) {
      throw new NotFoundException('Checkout não encontrado');
    }

    // Check expiration
    if (checkout.status === 'PENDING' && new Date() > checkout.expiresAt) {
      await this.prisma.pdvCheckout.update({
        where: { id: checkout.id },
        data: { status: PdvCheckoutStatus.EXPIRED },
      });
      checkout.status = PdvCheckoutStatus.EXPIRED;
    }

    return {
      code: checkout.code,
      status: checkout.status,
      items: checkout.items,
      totalPoints: checkout.totalPoints,
      totalMoney: Number(checkout.totalMoney),
      paymentMethod: checkout.paymentMethod,
      expiresAt: checkout.expiresAt,
      pdv: checkout.pdv,
    };
  }

  /**
   * Get checkout details for wallet app
   */
  async getCheckoutDetails(code: string, userId: string) {
    const checkout = await this.prisma.pdvCheckout.findUnique({
      where: { code },
      include: {
        pdv: {
          select: { name: true, location: true },
        },
      },
    });

    if (!checkout) {
      throw new NotFoundException('Checkout não encontrado');
    }

    // Check status
    if (checkout.status !== 'PENDING') {
      if (checkout.status === 'PAID') {
        throw new BadRequestException('Este checkout já foi pago');
      }
      if (checkout.status === 'EXPIRED') {
        throw new BadRequestException('Este checkout expirou');
      }
      if (checkout.status === 'CANCELLED') {
        throw new BadRequestException('Este checkout foi cancelado');
      }
    }

    // Check expiration
    if (new Date() > checkout.expiresAt) {
      await this.prisma.pdvCheckout.update({
        where: { id: checkout.id },
        data: { status: PdvCheckoutStatus.EXPIRED },
      });
      throw new BadRequestException('Este checkout expirou');
    }

    // Get user balance
    const balance = await this.pointsService.getBalance(userId);

    return {
      code: checkout.code,
      items: checkout.items,
      totalPoints: checkout.totalPoints,
      totalMoney: Number(checkout.totalMoney),
      expiresAt: checkout.expiresAt,
      pdv: checkout.pdv,
      user: {
        balance: balance.balance,
        canPayWithPoints: balance.balance >= checkout.totalPoints,
      },
    };
  }

  /**
   * Pay checkout with points
   */
  async payWithPoints(code: string, userId: string) {
    const checkout = await this.prisma.pdvCheckout.findUnique({
      where: { code },
      include: {
        pdv: true,
      },
    });

    if (!checkout) {
      throw new NotFoundException('Checkout não encontrado');
    }

    // Validate checkout
    if (checkout.status !== 'PENDING') {
      throw new BadRequestException(`Checkout não está pendente (status: ${checkout.status})`);
    }

    if (new Date() > checkout.expiresAt) {
      await this.prisma.pdvCheckout.update({
        where: { id: checkout.id },
        data: { status: PdvCheckoutStatus.EXPIRED },
      });
      throw new BadRequestException('Checkout expirou');
    }

    // Check user balance
    const balance = await this.pointsService.getBalance(userId);
    if (balance.balance < checkout.totalPoints) {
      throw new BadRequestException('Saldo insuficiente');
    }

    // Process payment in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Debit points
      const pointsTransaction = await this.pointsService.debitPoints(
        userId,
        checkout.totalPoints,
        'PDV_PURCHASE',
        `Compra no ${checkout.pdv.name}`,
        {
          pdvId: checkout.pdvId,
          checkoutCode: checkout.code,
        },
        checkout.id,
      );

      // Update checkout
      await tx.pdvCheckout.update({
        where: { id: checkout.id },
        data: {
          status: PdvCheckoutStatus.PAID,
          paymentMethod: PdvPaymentMethod.POINTS,
          paidByUserId: userId,
          paidAt: new Date(),
        },
      });

      // Deduct stock
      for (const item of checkout.items as any[]) {
        await tx.pdvProduct.update({
          where: { id: item.product_id },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // Create sale record
      const sale = await tx.pdvSale.create({
        data: {
          checkoutId: checkout.id,
          pdvId: checkout.pdvId,
          userId,
          items: checkout.items ?? [],
          paymentMethod: PdvPaymentMethod.POINTS,
          totalPoints: checkout.totalPoints,
          pointsTransactionId: pointsTransaction.id,
        },
      });

      return { pointsTransaction, sale };
    });

    // Create order
    const order = await this.ordersService.createOrder({
      userId,
      source: 'PDV',
      sourceId: result.sale.id,
      sourceName: checkout.pdv.name,
      items: (checkout.items as any[]).map((item) => ({
        productId: item.product_id,
        productName: item.name,
        quantity: item.quantity,
        unitPricePoints: item.unit_price_points,
        unitPriceMoney: item.unit_price_money,
        type: 'PHYSICAL',
      })),
      paymentMethod: 'POINTS',
      pointsUsed: checkout.totalPoints,
      pointsTransactionId: result.pointsTransaction.id,
      pickupLocation: checkout.pdv.location,
    });

    // Link order to sale
    await this.prisma.pdvSale.update({
      where: { id: result.sale.id },
      data: { orderId: order.id },
    });

    // Get new balance
    const newBalance = await this.pointsService.getBalance(userId);

    this.logger.log(`PDV checkout ${code} paid with points by user ${userId}`);

    return {
      success: true,
      transactionId: result.pointsTransaction.id,
      newBalance: newBalance.balance,
      orderId: order.id,
      orderCode: order.code,
    };
  }

  /**
   * Initiate PIX payment
   */
  async initiatePixPayment(code: string, userId: string) {
    const checkout = await this.prisma.pdvCheckout.findUnique({
      where: { code },
      include: {
        pdv: true,
      },
    });

    if (!checkout) {
      throw new NotFoundException('Checkout não encontrado');
    }

    // Validate checkout
    if (checkout.status !== 'PENDING') {
      throw new BadRequestException(`Checkout não está pendente (status: ${checkout.status})`);
    }

    if (new Date() > checkout.expiresAt) {
      await this.prisma.pdvCheckout.update({
        where: { id: checkout.id },
        data: { status: PdvCheckoutStatus.EXPIRED },
      });
      throw new BadRequestException('Checkout expirou');
    }

    // Create PIX payment
    const amountCents = Math.round(Number(checkout.totalMoney) * 100);

    const pixResult = await this.stripeService.createPixPayment({
      amount: amountCents,
      source: PaymentSource.PDV,
      sourceId: checkout.id,
      userId,
      description: `Compra PDV - ${checkout.pdv.name}`,
      metadata: {
        checkoutCode: checkout.code,
        pdvName: checkout.pdv.name,
      },
    });

    // Update checkout with PIX info
    await this.prisma.pdvCheckout.update({
      where: { id: checkout.id },
      data: {
        status: PdvCheckoutStatus.AWAITING_PIX,
        paymentMethod: PdvPaymentMethod.PIX,
        paidByUserId: userId,
        stripePaymentIntentId: pixResult.paymentIntentId,
        pixQrCode: pixResult.pixQrCode,
        pixExpiresAt: pixResult.expiresAt,
      },
    });

    this.logger.log(`PIX payment initiated for checkout ${code}`);

    return {
      paymentIntentId: pixResult.paymentIntentId,
      clientSecret: pixResult.clientSecret,
      pixQrCode: pixResult.pixQrCode,
      pixCopyPaste: pixResult.pixCopyPaste,
      expiresAt: pixResult.expiresAt,
    };
  }

  /**
   * Confirm PIX payment (called from webhook)
   */
  async confirmPixPayment(checkoutId: string, stripePaymentId: string) {
    const checkout = await this.prisma.pdvCheckout.findUnique({
      where: { id: checkoutId },
      include: {
        pdv: true,
      },
    });

    if (!checkout) {
      this.logger.error(`Checkout not found for PIX confirmation: ${checkoutId}`);
      return;
    }

    if (checkout.status !== 'AWAITING_PIX') {
      this.logger.warn(`Checkout ${checkout.code} is not awaiting PIX (status: ${checkout.status})`);
      return;
    }

    const userId = checkout.paidByUserId!;

    // Get association cashback config
    const association = await this.prisma.association.findFirst();
    const cashbackPercent = association?.cashbackPercent || 5;
    const cashbackAmount = Math.floor(Number(checkout.totalMoney) * (cashbackPercent / 100));

    // Process in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update checkout
      await tx.pdvCheckout.update({
        where: { id: checkout.id },
        data: {
          status: PdvCheckoutStatus.PAID,
          paidAt: new Date(),
          cashbackEarned: cashbackAmount,
        },
      });

      // Deduct stock
      for (const item of checkout.items as any[]) {
        await tx.pdvProduct.update({
          where: { id: item.product_id },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // Credit cashback
      let cashbackTransactionId: string | undefined;
      if (cashbackAmount > 0) {
        const cashbackTx = await this.pointsService.creditPoints(
          userId,
          cashbackAmount,
          'PDV_CASHBACK',
          `Cashback da compra no ${checkout.pdv.name}`,
          {
            pdvId: checkout.pdvId,
            checkoutCode: checkout.code,
            originalAmount: Number(checkout.totalMoney),
            cashbackPercent,
          },
          checkout.id,
        );
        cashbackTransactionId = cashbackTx.id;
      }

      // Create sale record
      const sale = await tx.pdvSale.create({
        data: {
          checkoutId: checkout.id,
          pdvId: checkout.pdvId,
          userId,
          items: checkout.items ?? [],
          paymentMethod: PdvPaymentMethod.PIX,
          totalMoney: checkout.totalMoney,
          stripePaymentId,
          cashbackEarned: cashbackAmount,
          cashbackTransactionId,
        },
      });

      return { sale, cashbackTransactionId, cashbackAmount };
    });

    // Create order
    const order = await this.ordersService.createOrder({
      userId,
      source: 'PDV',
      sourceId: result.sale.id,
      sourceName: checkout.pdv.name,
      items: (checkout.items as any[]).map((item) => ({
        productId: item.product_id,
        productName: item.name,
        quantity: item.quantity,
        unitPricePoints: item.unit_price_points,
        unitPriceMoney: item.unit_price_money,
        type: 'PHYSICAL',
      })),
      paymentMethod: 'MONEY',
      moneyPaid: Number(checkout.totalMoney),
      cashbackEarned: result.cashbackAmount,
      stripePaymentId,
      cashbackTransactionId: result.cashbackTransactionId,
      pickupLocation: checkout.pdv.location,
    });

    // Link order to sale
    await this.prisma.pdvSale.update({
      where: { id: result.sale.id },
      data: { orderId: order.id },
    });

    // Send notifications
    await this.notificationsService.create({
      userId,
      type: NotificationType.POINTS_RECEIVED,
      category: NotificationCategory.POINTS,
      title: 'Compra Confirmada + Cashback',
      body: `Sua compra no ${checkout.pdv.name} foi confirmada! Você ganhou ${result.cashbackAmount} pontos de cashback.`,
      data: {
        checkoutCode: checkout.code,
        orderId: order.id,
        cashbackAmount: result.cashbackAmount,
      },
    });

    this.logger.log(
      `PDV checkout ${checkout.code} PIX confirmed. Cashback: ${result.cashbackAmount} pts`,
    );
  }

  /**
   * Cancel checkout
   */
  async cancelCheckout(code: string) {
    const checkout = await this.prisma.pdvCheckout.findUnique({
      where: { code },
    });

    if (!checkout) {
      throw new NotFoundException('Checkout não encontrado');
    }

    if (checkout.status === 'PAID') {
      throw new BadRequestException('Não é possível cancelar checkout já pago');
    }

    // Cancel Stripe payment if exists
    if (checkout.stripePaymentIntentId) {
      await this.stripeService.cancelPaymentIntent(checkout.stripePaymentIntentId);
    }

    await this.prisma.pdvCheckout.update({
      where: { id: checkout.id },
      data: { status: PdvCheckoutStatus.CANCELLED },
    });

    this.logger.log(`Checkout ${code} cancelled`);

    return { success: true };
  }

  /**
   * Get PIX status for checkout
   */
  async getPixStatus(code: string) {
    const checkout = await this.prisma.pdvCheckout.findUnique({
      where: { code },
    });

    if (!checkout) {
      throw new NotFoundException('Checkout não encontrado');
    }

    if (!checkout.stripePaymentIntentId) {
      throw new BadRequestException('Este checkout não tem pagamento PIX');
    }

    const paymentIntent = await this.stripeService.getPaymentIntent(
      checkout.stripePaymentIntentId,
    );

    return {
      checkoutStatus: checkout.status,
      paymentStatus: paymentIntent?.status || 'unknown',
      pixQrCode: checkout.pixQrCode,
      pixExpiresAt: checkout.pixExpiresAt,
    };
  }
}
