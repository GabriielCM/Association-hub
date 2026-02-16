import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  PdvStatus,
  NotificationType,
  NotificationCategory,
  UserRole,
  UserStatus,
  PdvProduct,
} from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PdvGateway } from './pdv.gateway';
import { CreatePdvDto, UpdatePdvDto } from './dto/create-pdv.dto';
import { CreatePdvProductDto, UpdatePdvProductDto, UpdateStockDto } from './dto/create-pdv-product.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Decimal } from '@prisma/client/runtime/library';

// Stock low alert threshold
const STOCK_LOW_THRESHOLD = 5;

@Injectable()
export class PdvService {
  private readonly logger = new Logger(PdvService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly pdvGateway: PdvGateway,
  ) {}

  /**
   * Generate API credentials for PDV
   */
  private generateApiCredentials(): { apiKey: string; apiSecret: string; hashedSecret: string } {
    const apiKey = `pdv_${crypto.randomBytes(16).toString('hex')}`;
    const apiSecret = crypto.randomBytes(32).toString('hex');
    const hashedSecret = bcrypt.hashSync(apiSecret, 10);

    return { apiKey, apiSecret, hashedSecret };
  }

  /**
   * Create a new PDV
   */
  async createPdv(associationId: string, dto: CreatePdvDto) {
    const { apiKey, apiSecret, hashedSecret } = this.generateApiCredentials();

    const pdv = await this.prisma.pdv.create({
      data: {
        associationId,
        name: dto.name,
        location: dto.location,
        displayConfig: dto.displayConfig || {},
        apiKey,
        apiSecret: hashedSecret,
      },
    });

    this.logger.log(`PDV created: ${pdv.id} - ${dto.name}`);

    // Return with plain API secret (only time it's visible)
    return {
      ...pdv,
      apiSecret, // Plain text, show only once
    };
  }

  /**
   * Get all PDVs for an association
   */
  async getPdvs(associationId: string) {
    return this.prisma.pdv.findMany({
      where: { associationId },
      include: {
        _count: {
          select: { products: true, sales: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get PDV by ID
   */
  async getPdvById(pdvId: string) {
    const pdv = await this.prisma.pdv.findUnique({
      where: { id: pdvId },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { sales: true },
        },
      },
    });

    if (!pdv) {
      throw new NotFoundException('PDV não encontrado');
    }

    return pdv;
  }

  /**
   * Update PDV
   */
  async updatePdv(pdvId: string, dto: UpdatePdvDto) {
    const pdv = await this.prisma.pdv.findUnique({ where: { id: pdvId } });

    if (!pdv) {
      throw new NotFoundException('PDV não encontrado');
    }

    return this.prisma.pdv.update({
      where: { id: pdvId },
      data: {
        name: dto.name,
        location: dto.location,
        status: dto.status,
        displayConfig: dto.displayConfig,
      },
    });
  }

  /**
   * Delete (deactivate) PDV
   */
  async deletePdv(pdvId: string) {
    const pdv = await this.prisma.pdv.findUnique({ where: { id: pdvId } });

    if (!pdv) {
      throw new NotFoundException('PDV não encontrado');
    }

    return this.prisma.pdv.update({
      where: { id: pdvId },
      data: { status: PdvStatus.INACTIVE },
    });
  }

  /**
   * Regenerate API credentials
   */
  async regenerateApiCredentials(pdvId: string) {
    const pdv = await this.prisma.pdv.findUnique({ where: { id: pdvId } });

    if (!pdv) {
      throw new NotFoundException('PDV não encontrado');
    }

    const { apiKey, apiSecret, hashedSecret } = this.generateApiCredentials();

    await this.prisma.pdv.update({
      where: { id: pdvId },
      data: {
        apiKey,
        apiSecret: hashedSecret,
      },
    });

    this.logger.log(`API credentials regenerated for PDV ${pdvId}`);

    return { apiKey, apiSecret };
  }

  // ===============================
  // Products
  // ===============================

  /**
   * Add product to PDV
   */
  async addProduct(pdvId: string, dto: CreatePdvProductDto) {
    const pdv = await this.prisma.pdv.findUnique({ where: { id: pdvId } });

    if (!pdv) {
      throw new NotFoundException('PDV não encontrado');
    }

    const product = await this.prisma.pdvProduct.create({
      data: {
        pdvId,
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        pricePoints: dto.pricePoints,
        priceMoney: new Decimal(dto.priceMoney),
        category: dto.category,
        stock: dto.stock || 0,
      },
    });

    this.pdvGateway.broadcastCatalogUpdated(pdvId, { pdvId, reason: 'product_added' });

    return product;
  }

  /**
   * Get PDV products
   */
  async getProducts(pdvId: string, includeInactive = false) {
    const where: any = { pdvId };
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.prisma.pdvProduct.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Update product
   */
  async updateProduct(productId: string, dto: UpdatePdvProductDto) {
    const product = await this.prisma.pdvProduct.findUnique({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const updated = await this.prisma.pdvProduct.update({
      where: { id: productId },
      data: {
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        pricePoints: dto.pricePoints,
        priceMoney: dto.priceMoney ? new Decimal(dto.priceMoney) : undefined,
        category: dto.category,
        stock: dto.stock,
        isActive: dto.isActive,
      },
    });

    this.pdvGateway.broadcastCatalogUpdated(updated.pdvId, { pdvId: updated.pdvId, reason: 'product_updated' });

    return updated;
  }

  /**
   * Delete (deactivate) product
   */
  async deleteProduct(productId: string) {
    const product = await this.prisma.pdvProduct.findUnique({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const updated = await this.prisma.pdvProduct.update({
      where: { id: productId },
      data: { isActive: false },
    });

    this.pdvGateway.broadcastCatalogUpdated(updated.pdvId, { pdvId: updated.pdvId, reason: 'product_deleted' });

    return updated;
  }

  /**
   * Update stock
   */
  async updateStock(dto: UpdateStockDto) {
    const product = await this.prisma.pdvProduct.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const newStock = product.stock + dto.quantity;

    if (newStock < 0) {
      throw new BadRequestException('Estoque não pode ficar negativo');
    }

    const updated = await this.prisma.pdvProduct.update({
      where: { id: dto.productId },
      data: { stock: newStock },
    });

    this.logger.log(
      `Stock updated for product ${dto.productId}: ${product.stock} -> ${newStock} (${dto.reason || 'manual'})`,
    );

    this.pdvGateway.broadcastCatalogUpdated(updated.pdvId, { pdvId: updated.pdvId, reason: 'stock_updated' });

    // Check stock low alert (async, non-blocking)
    this.checkAndSendStockAlert(updated).catch((err) =>
      this.logger.error('Error sending stock alert:', err),
    );

    return updated;
  }

  /**
   * Check if stock is low and send notification to admins
   */
  private async checkAndSendStockAlert(product: PdvProduct): Promise<void> {
    // Only alert if stock is below threshold
    if (product.stock >= STOCK_LOW_THRESHOLD) {
      return;
    }

    // Get the PDV to find association
    const pdv = await this.prisma.pdv.findUnique({
      where: { id: product.pdvId },
      select: { associationId: true, name: true },
    });

    if (!pdv) {
      return;
    }

    // Find admin users for this association
    const admins = await this.prisma.user.findMany({
      where: {
        associationId: pdv.associationId,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (admins.length === 0) {
      this.logger.debug(`No admins found for association ${pdv.associationId}`);
      return;
    }

    const adminIds = admins.map((a) => a.id);

    // Send notification to all admins
    const count = await this.notificationsService.createBatch({
      userIds: adminIds,
      type: NotificationType.ADMIN_ANNOUNCEMENT,
      category: NotificationCategory.SYSTEM,
      title: 'Estoque Baixo no PDV',
      body: `O produto "${product.name}" está com estoque baixo (${product.stock} unidades) no PDV ${pdv.name}`,
      data: {
        productId: product.id,
        pdvId: product.pdvId,
        pdvName: pdv.name,
        productName: product.name,
        stock: product.stock,
      },
      actionUrl: `/admin/pdv/${product.pdvId}/products`,
      groupKey: `stock-alert-${product.id}`,
    });

    this.logger.log(
      `Stock low alert sent to ${count} admin(s) for product ${product.id}: ${product.stock} units`,
    );
  }

  /**
   * Get stock for all products of a PDV
   */
  async getStock(pdvId: string) {
    return this.prisma.pdvProduct.findMany({
      where: { pdvId, isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        stock: true,
        pricePoints: true,
        priceMoney: true,
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  // ===============================
  // Categories
  // ===============================

  /**
   * Get all categories for an association
   */
  async getCategories(associationId: string) {
    return this.prisma.pdvCategory.findMany({
      where: { associationId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a category for an association
   */
  async createCategory(associationId: string, name: string) {
    return this.prisma.pdvCategory.create({
      data: { associationId, name: name.trim() },
    });
  }

  /**
   * Update a category name
   */
  async updateCategory(categoryId: string, name: string) {
    const category = await this.prisma.pdvCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return this.prisma.pdvCategory.update({
      where: { id: categoryId },
      data: { name: name.trim() },
    });
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string) {
    const category = await this.prisma.pdvCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return this.prisma.pdvCategory.delete({
      where: { id: categoryId },
    });
  }

  // ===============================
  // Sales Reports
  // ===============================

  /**
   * Get sales report for a PDV
   */
  async getSalesReport(pdvId: string, startDate?: Date, endDate?: Date) {
    const where: any = { pdvId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const sales = await this.prisma.pdvSale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    let totalPoints = 0;
    let totalMoney = 0;
    let cashbackTotal = 0;
    let salesByMethod = { POINTS: 0, PIX: 0 };

    for (const sale of sales) {
      if (sale.paymentMethod === 'POINTS') {
        totalPoints += sale.totalPoints || 0;
        salesByMethod.POINTS++;
      } else {
        totalMoney += Number(sale.totalMoney) || 0;
        salesByMethod.PIX++;
      }
      cashbackTotal += sale.cashbackEarned || 0;
    }

    return {
      totalSales: sales.length,
      totalPoints,
      totalMoney,
      cashbackTotal,
      salesByMethod,
      sales,
    };
  }
}
