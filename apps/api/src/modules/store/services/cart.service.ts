import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from '../dto/cart.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly RESERVATION_MINUTES = 30;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create cart for user
   */
  async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { displayOrder: 'asc' } },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1, orderBy: { displayOrder: 'asc' } },
                },
              },
              variant: true,
            },
          },
        },
      });
    }

    return this.formatCart(cart);
  }

  /**
   * Add item to cart
   */
  async addItem(userId: string, dto: AddToCartDto) {
    // Get or create cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Get product
    const product = await this.prisma.storeProduct.findUnique({
      where: { id: dto.productId },
      include: {
        variants: dto.variantId ? { where: { id: dto.variantId } } : undefined,
      },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Validate variant if provided
    let variant = null;
    if (dto.variantId) {
      variant = product.variants?.[0];
      if (!variant) {
        throw new NotFoundException('Variação não encontrada');
      }
      if (!variant.isActive) {
        throw new BadRequestException('Variação não disponível');
      }
    }

    // Check stock
    const availableStock = variant ? variant.stockCount : (product.stockCount || 0);
    if (product.stockType === 'limited' && availableStock < dto.quantity) {
      throw new BadRequestException('Estoque insuficiente');
    }

    // Check user limit
    if (product.limitPerUser) {
      const existingItem = await this.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: dto.productId,
          variantId: dto.variantId || null,
        },
      });

      const totalQuantity = (existingItem?.quantity || 0) + dto.quantity;
      if (totalQuantity > product.limitPerUser) {
        throw new BadRequestException(
          `Limite de ${product.limitPerUser} unidades por usuário`,
        );
      }
    }

    // Get prices (check for promotional)
    const isPromotionalActive =
      product.isPromotional &&
      product.promotionalEndsAt &&
      new Date() < product.promotionalEndsAt;

    let unitPricePoints = variant?.pricePoints || product.pricePoints || 0;
    let unitPriceMoney = variant?.priceMoney
      ? Number(variant.priceMoney)
      : Number(product.priceMoney) || 0;

    if (isPromotionalActive && !variant) {
      unitPricePoints = product.promotionalPricePoints || unitPricePoints;
      unitPriceMoney = product.promotionalPriceMoney
        ? Number(product.promotionalPriceMoney)
        : unitPriceMoney;
    }

    // Upsert cart item
    const variantIdValue = dto.variantId || Prisma.DbNull;
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId: dto.productId,
          variantId: variantIdValue as string,
        },
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + dto.quantity,
          unitPricePoints,
          unitPriceMoney: new Decimal(unitPriceMoney),
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          variantId: dto.variantId || null,
          quantity: dto.quantity,
          unitPricePoints,
          unitPriceMoney: new Decimal(unitPriceMoney),
        },
      });
    }

    // Recalculate totals
    await this.recalculateTotals(cart.id);

    return this.getOrCreateCart(userId);
  }

  /**
   * Update cart item quantity
   */
  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: {
        product: true,
        variant: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho');
    }

    // Check stock
    const availableStock = item.variant
      ? item.variant.stockCount
      : (item.product.stockCount || 0);

    if (item.product.stockType === 'limited' && availableStock < dto.quantity) {
      throw new BadRequestException('Estoque insuficiente');
    }

    // Check user limit
    if (item.product.limitPerUser && dto.quantity > item.product.limitPerUser) {
      throw new BadRequestException(
        `Limite de ${item.product.limitPerUser} unidades por usuário`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    await this.recalculateTotals(cart.id);

    return this.getOrCreateCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    await this.recalculateTotals(cart.id);

    return this.getOrCreateCart(userId);
  }

  /**
   * Clear cart
   */
  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return { success: true };
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        subtotalPoints: 0,
        subtotalMoney: new Decimal(0),
        reservedUntil: null,
      },
    });

    return { success: true };
  }

  /**
   * Reserve stock for checkout
   */
  async reserveStock(userId: string) {
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
      throw new BadRequestException('Carrinho vazio');
    }

    // Check all items have stock
    for (const item of cart.items) {
      const availableStock = item.variant
        ? item.variant.stockCount
        : (item.product.stockCount || 0);

      if (item.product.stockType === 'limited' && availableStock < item.quantity) {
        throw new BadRequestException(`Estoque insuficiente para "${item.product.name}"`);
      }
    }

    // Set reservation
    const reservedUntil = new Date(Date.now() + this.RESERVATION_MINUTES * 60 * 1000);

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { reservedUntil },
    });

    // Mark items as reserved
    await this.prisma.cartItem.updateMany({
      where: { cartId: cart.id },
      data: { reservedStock: true },
    });

    return { reservedUntil };
  }

  /**
   * Release stock reservation
   */
  async releaseReservation(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) return;

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { reservedUntil: null },
    });

    await this.prisma.cartItem.updateMany({
      where: { cartId: cart.id },
      data: { reservedStock: false },
    });
  }

  // ===========================================
  // SCHEDULED JOBS (called by scheduler)
  // ===========================================

  /**
   * Expire stock reservations that have passed their reserved time
   * Called by scheduler to clean up abandoned carts
   */
  async expireReservations(): Promise<number> {
    const now = new Date();

    // Find all carts with expired reservations
    const expiredCarts = await this.prisma.cart.findMany({
      where: {
        reservedUntil: {
          not: null,
          lt: now,
        },
      },
      select: { id: true },
    });

    if (expiredCarts.length === 0) {
      return 0;
    }

    const cartIds = expiredCarts.map((cart) => cart.id);

    // Clear reservation on items
    await this.prisma.cartItem.updateMany({
      where: { cartId: { in: cartIds } },
      data: { reservedStock: false },
    });

    // Clear reservation timestamp on carts
    await this.prisma.cart.updateMany({
      where: { id: { in: cartIds } },
      data: { reservedUntil: null },
    });

    if (expiredCarts.length > 0) {
      this.logger.log(`Released ${expiredCarts.length} expired cart reservations`);
    }

    return expiredCarts.length;
  }

  /**
   * Cleanup abandoned carts that haven't been updated for a specified number of days
   * Called by scheduler to remove old empty carts
   */
  async cleanupAbandonedCarts(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Find abandoned carts (no items, old updatedAt)
    const abandonedCarts = await this.prisma.cart.findMany({
      where: {
        updatedAt: { lt: cutoffDate },
        items: { none: {} },
      },
      select: { id: true },
    });

    if (abandonedCarts.length === 0) {
      return 0;
    }

    const cartIds = abandonedCarts.map((cart) => cart.id);

    // Delete abandoned carts
    await this.prisma.cart.deleteMany({
      where: { id: { in: cartIds } },
    });

    if (abandonedCarts.length > 0) {
      this.logger.log(`Cleaned up ${abandonedCarts.length} abandoned carts`);
    }

    return abandonedCarts.length;
  }

  /**
   * Recalculate cart totals
   */
  private async recalculateTotals(cartId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
    });

    let subtotalPoints = 0;
    let subtotalMoney = 0;

    for (const item of items) {
      subtotalPoints += item.unitPricePoints * item.quantity;
      subtotalMoney += Number(item.unitPriceMoney) * item.quantity;
    }

    await this.prisma.cart.update({
      where: { id: cartId },
      data: {
        subtotalPoints,
        subtotalMoney: new Decimal(subtotalMoney),
      },
    });
  }

  /**
   * Format cart for response
   */
  private formatCart(cart: any) {
    const items = cart.items.map((item: any) => ({
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        imageUrl: item.product.images?.[0]?.url,
        type: item.product.type,
      },
      variant: item.variant
        ? {
            id: item.variant.id,
            name: item.variant.name,
            imageUrl: item.variant.imageUrl,
          }
        : null,
      quantity: item.quantity,
      unitPricePoints: item.unitPricePoints,
      unitPriceMoney: Number(item.unitPriceMoney),
      totalPoints: item.unitPricePoints * item.quantity,
      totalMoney: Number(item.unitPriceMoney) * item.quantity,
    }));

    return {
      id: cart.id,
      items,
      subtotalPoints: cart.subtotalPoints,
      subtotalMoney: Number(cart.subtotalMoney),
      itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      reservedUntil: cart.reservedUntil,
    };
  }
}
