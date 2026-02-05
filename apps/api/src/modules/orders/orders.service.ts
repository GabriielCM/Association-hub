import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PointsService } from '../points/points.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StripeService } from '../stripe/stripe.service';
import { OrderStatus, OrderSource, OrderPaymentMethod, NotificationType, NotificationCategory } from '@prisma/client';
import { OrdersQueryDto, AdminOrdersQueryDto } from './dto/orders-query.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Decimal } from '@prisma/client/runtime/library';

interface CreateOrderInput {
  userId: string;
  source: OrderSource;
  sourceId: string;
  sourceName: string;
  items: Array<{
    productId: string;
    variantId?: string;
    productName: string;
    variantName?: string;
    productImage?: string;
    quantity: number;
    unitPricePoints: number;
    unitPriceMoney: number;
    type: 'PHYSICAL' | 'VOUCHER' | 'SERVICE';
    voucherValidityDays?: number;
  }>;
  paymentMethod: OrderPaymentMethod;
  pointsUsed?: number;
  moneyPaid?: number;
  cashbackEarned?: number;
  stripePaymentId?: string;
  pointsTransactionId?: string;
  cashbackTransactionId?: string;
  pickupLocation?: string;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService,
    private readonly notificationsService: NotificationsService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Generate unique order code
   */
  private generateOrderCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Generate pickup QR code data
   */
  private generatePickupCode(orderId: string, orderCode: string): string {
    return JSON.stringify({
      type: 'order_pickup',
      orderId,
      code: orderCode,
      timestamp: Date.now(),
    });
  }

  /**
   * Create a new order
   */
  async createOrder(input: CreateOrderInput): Promise<any> {
    const code = this.generateOrderCode();

    // Calculate totals
    let subtotalPoints = 0;
    let subtotalMoney = 0;

    for (const item of input.items) {
      subtotalPoints += item.unitPricePoints * item.quantity;
      subtotalMoney += item.unitPriceMoney * item.quantity;
    }

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        code,
        userId: input.userId,
        source: input.source,
        sourceId: input.sourceId,
        sourceName: input.sourceName,
        subtotalPoints,
        subtotalMoney: new Decimal(subtotalMoney),
        paymentMethod: input.paymentMethod,
        pointsUsed: input.pointsUsed,
        moneyPaid: input.moneyPaid ? new Decimal(input.moneyPaid) : null,
        cashbackEarned: input.cashbackEarned,
        stripePaymentId: input.stripePaymentId,
        pointsTransactionId: input.pointsTransactionId,
        cashbackTransactionId: input.cashbackTransactionId,
        pickupCode: '', // Will be set after creation
        pickupLocation: input.pickupLocation,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            productImage: item.productImage,
            quantity: item.quantity,
            unitPricePoints: item.unitPricePoints,
            unitPriceMoney: new Decimal(item.unitPriceMoney),
            totalPoints: item.unitPricePoints * item.quantity,
            totalMoney: new Decimal(item.unitPriceMoney * item.quantity),
            type: item.type,
            voucherCode: item.type === 'VOUCHER' ? this.generateVoucherCode() : null,
            voucherExpiresAt:
              item.type === 'VOUCHER' && item.voucherValidityDays
                ? new Date(Date.now() + item.voucherValidityDays * 24 * 60 * 60 * 1000)
                : null,
          })),
        },
        statusHistory: {
          create: {
            status: OrderStatus.PENDING,
            changedByName: 'Sistema',
            notes: 'Pedido criado',
          },
        },
      },
      include: {
        items: true,
      },
    });

    // Update pickup code
    const pickupCode = this.generatePickupCode(order.id, code);
    await this.prisma.order.update({
      where: { id: order.id },
      data: { pickupCode },
    });

    this.logger.log(`Order created: ${code} for user ${input.userId}`);

    // Send notification
    await this.notificationsService.create({
      userId: input.userId,
      type: NotificationType.POINTS_SPENT,
      category: NotificationCategory.POINTS,
      title: 'Pedido Confirmado',
      body: `Seu pedido #${code} foi confirmado!`,
      data: { orderId: order.id, orderCode: code },
    });

    return { ...order, pickupCode };
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string, query: OrdersQueryDto) {
    const { status, source, startDate, endDate, page = 1, limit = 10 } = query;

    const where: any = { userId };

    if (status) where.status = status;
    if (source) where.source = source;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        receipt: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    // If userId is provided, verify ownership
    if (userId && order.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return order;
  }

  /**
   * Get order by code
   */
  async getOrderByCode(code: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { code },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (userId && order.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return order;
  }

  /**
   * Get order receipt
   */
  async getReceipt(orderId: string, userId: string) {
    const order = await this.getOrderById(orderId, userId);

    let receipt = order.receipt;

    // Generate receipt if not exists
    if (!receipt) {
      receipt = await this.generateReceipt(order);
    }

    return receipt;
  }

  /**
   * Generate order receipt
   */
  private async generateReceipt(order: any) {
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const receiptData = {
      orderCode: order.code,
      createdAt: order.createdAt,
      items: order.items.map((item: any) => ({
        name: item.productName,
        variant: item.variantName,
        quantity: item.quantity,
        unitPricePoints: item.unitPricePoints,
        unitPriceMoney: item.unitPriceMoney,
        totalPoints: item.totalPoints,
        totalMoney: item.totalMoney,
      })),
      subtotalPoints: order.subtotalPoints,
      subtotalMoney: order.subtotalMoney,
      paymentMethod: order.paymentMethod,
      pointsUsed: order.pointsUsed,
      moneyPaid: order.moneyPaid,
      cashbackEarned: order.cashbackEarned,
    };

    const receipt = await this.prisma.orderReceipt.create({
      data: {
        orderId: order.id,
        receiptNumber,
        data: receiptData,
      },
    });

    return receipt;
  }

  /**
   * Get vouchers from an order
   */
  async getOrderVouchers(orderId: string, userId: string) {
    const order = await this.getOrderById(orderId, userId);

    const vouchers = order.items.filter((item: any) => item.type === 'VOUCHER');

    return vouchers.map((item: any) => ({
      id: item.id,
      productName: item.productName,
      voucherCode: item.voucherCode,
      isUsed: item.voucherUsed,
      usedAt: item.voucherUsedAt,
      expiresAt: item.voucherExpiresAt,
    }));
  }

  /**
   * Update order status (Admin)
   */
  async updateStatus(orderId: string, dto: UpdateStatusDto, adminId: string, adminName: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    // Validate status transition
    this.validateStatusTransition(order.status, dto.status);

    // Update order
    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      // Update status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: dto.status },
      });

      // Add to history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: dto.status,
          changedBy: adminId,
          changedByName: adminName,
          notes: dto.notes,
        },
      });

      return updated;
    });

    // Send notification based on new status
    await this.sendStatusNotification(order.userId, order.code, dto.status);

    this.logger.log(`Order ${orderId} status updated to ${dto.status} by ${adminId}`);

    return updatedOrder;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, dto: CancelOrderDto, cancelledBy: string, isAdmin: boolean) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    // Validate cancellation
    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Não é possível cancelar pedido já entregue');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Pedido já está cancelado');
    }

    // User can only cancel PENDING orders
    if (!isAdmin && order.status !== OrderStatus.PENDING) {
      throw new ForbiddenException('Usuário só pode cancelar pedidos pendentes');
    }

    // Process refunds
    const refundResults: any = {};

    if (dto.refundPoints && order.pointsUsed && order.pointsUsed > 0) {
      // Refund points
      const refund = await this.pointsService.creditPoints(
        order.userId,
        order.pointsUsed,
        'REFUND',
        `Estorno do pedido #${order.code}`,
        { orderId: order.id, reason: dto.reason },
        order.id,
      );
      refundResults.pointsRefunded = order.pointsUsed;
      refundResults.pointsTransactionId = refund.id;
    }

    if (dto.refundMoney && order.stripePaymentId) {
      // Refund Stripe payment
      const refund = await this.stripeService.createRefund(
        order.stripePaymentId,
        undefined, // Full refund
        'requested_by_customer',
      );
      if (refund) {
        refundResults.moneyRefunded = Number(order.moneyPaid);
        refundResults.stripeRefundId = refund.id;
      }
    }

    // Update order
    const cancelledOrder = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledBy,
          cancelledReason: dto.reason,
          cancelledAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.CANCELLED,
          changedBy: cancelledBy,
          changedByName: isAdmin ? 'Administrador' : 'Usuário',
          notes: `Cancelado: ${dto.reason}`,
        },
      });

      return updated;
    });

    // Send notification
    await this.notificationsService.create({
      userId: order.userId,
      type: NotificationType.ADMIN_ANNOUNCEMENT,
      category: NotificationCategory.SYSTEM,
      title: 'Pedido Cancelado',
      body: `Seu pedido #${order.code} foi cancelado. ${dto.refundPoints ? 'Pontos foram estornados.' : ''}`,
      data: { orderId: order.id, ...refundResults },
    });

    this.logger.log(`Order ${orderId} cancelled by ${cancelledBy}`);

    return { order: cancelledOrder, refunds: refundResults };
  }

  /**
   * Validate pickup (Admin)
   */
  async validatePickup(code: string) {
    // Try to find by order code first
    let order = await this.prisma.order.findUnique({
      where: { code },
      include: { items: true },
    });

    // If not found, try to parse QR code data
    if (!order) {
      try {
        const qrData = JSON.parse(code);
        if (qrData.type === 'order_pickup' && qrData.orderId) {
          order = await this.prisma.order.findUnique({
            where: { id: qrData.orderId },
            include: { items: true },
          });
        }
      } catch {
        // Not a valid QR code JSON
      }
    }

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Pedido está cancelado');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Pedido já foi retirado');
    }

    return {
      order,
      canComplete: order.status === OrderStatus.READY,
    };
  }

  /**
   * Complete order (mark as picked up)
   */
  async completeOrder(orderId: string, adminId: string, adminName: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (order.status !== OrderStatus.READY) {
      throw new BadRequestException('Pedido precisa estar pronto para ser retirado');
    }

    const completedOrder = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.COMPLETED },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.COMPLETED,
          changedBy: adminId,
          changedByName: adminName,
          notes: 'Pedido retirado pelo cliente',
        },
      });

      return updated;
    });

    this.logger.log(`Order ${orderId} completed by ${adminId}`);

    return completedOrder;
  }

  /**
   * Get all orders (Admin)
   */
  async getAllOrders(query: AdminOrdersQueryDto) {
    const { status, source, userId, startDate, endDate, page = 1, limit = 10 } = query;

    const where: any = {};

    if (status) where.status = status;
    if (source) where.source = source;
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(current: OrderStatus, next: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [], // Final state
      [OrderStatus.CANCELLED]: [], // Final state
    };

    if (!validTransitions[current].includes(next)) {
      throw new BadRequestException(
        `Transição de status inválida: ${current} -> ${next}`,
      );
    }
  }

  /**
   * Send notification based on status change
   */
  private async sendStatusNotification(userId: string, orderCode: string, status: OrderStatus) {
    const notifications: Record<OrderStatus, { title: string; body: string }> = {
      [OrderStatus.PENDING]: { title: '', body: '' },
      [OrderStatus.CONFIRMED]: {
        title: 'Pedido em Preparação',
        body: `Seu pedido #${orderCode} está sendo preparado.`,
      },
      [OrderStatus.READY]: {
        title: 'Pedido Pronto!',
        body: `Seu pedido #${orderCode} está pronto para retirada!`,
      },
      [OrderStatus.COMPLETED]: {
        title: 'Pedido Entregue',
        body: `Seu pedido #${orderCode} foi entregue. Obrigado!`,
      },
      [OrderStatus.CANCELLED]: { title: '', body: '' }, // Handled separately
    };

    const notification = notifications[status];
    if (notification.title) {
      await this.notificationsService.create({
        userId,
        type: NotificationType.ADMIN_ANNOUNCEMENT,
        category: NotificationCategory.SYSTEM,
        title: notification.title,
        body: notification.body,
      });
    }
  }

  /**
   * Generate voucher code
   */
  private generateVoucherCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'VCH-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
