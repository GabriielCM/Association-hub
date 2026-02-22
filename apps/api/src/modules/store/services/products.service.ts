import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  CreateVariantDto,
  UpdateVariantDto,
  SetPromotionDto,
} from '../dto/product.dto';
import { Decimal } from '@prisma/client/runtime/library';

const LOW_STOCK_THRESHOLD = 10;

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all products with filters (public)
   */
  async findAll(query: ProductQueryDto, associationId?: string) {
    return this.getProducts(query, associationId);
  }

  /**
   * Find product by slug
   */
  async findBySlug(slug: string) {
    return this.getProductBySlug(slug);
  }

  /**
   * Find product by ID
   */
  async findById(productId: string) {
    return this.getProductById(productId);
  }

  /**
   * Find all products for admin (including inactive)
   */
  async findAllAdmin() {
    const products = await this.prisma.storeProduct.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { take: 1, orderBy: { displayOrder: 'asc' } },
        _count: { select: { variants: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => ({
      ...this.formatProductSummary(p),
      isActive: p.isActive,
      stockCount: p.stockCount,
      stockType: p.stockType,
    }));
  }

  /**
   * Create product
   */
  async create(dto: CreateProductDto) {
    return this.createProduct(dto);
  }

  /**
   * Update product
   */
  async update(productId: string, dto: UpdateProductDto) {
    return this.updateProduct(productId, dto);
  }

  /**
   * Delete product
   */
  async delete(productId: string) {
    return this.deleteProduct(productId);
  }

  /**
   * Create variant
   */
  async createVariant(productId: string, dto: CreateVariantDto) {
    return this.addVariant(productId, dto);
  }

  /**
   * Update variant (with productId for consistency)
   */
  async updateVariantById(productId: string, variantId: string, dto: UpdateVariantDto) {
    // Verify variant belongs to product
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });

    if (!variant) {
      throw new NotFoundException('Variação não encontrada');
    }

    return this.updateVariant(variantId, dto);
  }

  /**
   * Delete variant (with productId for consistency)
   */
  async deleteVariantById(productId: string, variantId: string) {
    // Verify variant belongs to product
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });

    if (!variant) {
      throw new NotFoundException('Variação não encontrada');
    }

    return this.deleteVariant(variantId);
  }

  /**
   * Get product reviews (approved only)
   */
  async getProductReviews(productId: string) {
    const reviews = await this.prisma.productReview.findMany({
      where: {
        productId,
        status: 'APPROVED',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get user info separately
    const userIds = reviews.map((r) => r.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatarUrl: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return reviews.map((review) => {
      const user = userMap.get(review.userId);
      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: user
          ? {
              id: user.id,
              name: user.name,
              avatarUrl: user.avatarUrl,
            }
          : null,
      };
    });
  }

  /**
   * Update variant stock
   */
  async updateVariantStock(productId: string, variantId: string, stockCount: number) {
    // Verify variant belongs to product
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });

    if (!variant) {
      throw new NotFoundException('Variação não encontrada');
    }

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { stockCount },
    });
  }

  /**
   * Get products with filters
   */
  async getProducts(query: ProductQueryDto, associationId?: string) {
    const { categoryId, type, search, featured, promotional, page = 1, limit = 20, sort } = query;

    const where: any = {
      isActive: true,
    };

    if (associationId) where.category = { associationId };
    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;
    if (featured) where.isFeatured = true;
    if (promotional) where.isPromotional = true;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any[];
    switch (sort) {
      case 'price_asc':
        orderBy = [{ pricePoints: 'asc' }];
        break;
      case 'price_desc':
        orderBy = [{ pricePoints: 'desc' }];
        break;
      case 'best_selling':
        orderBy = [{ averageRating: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'name_asc':
        orderBy = [{ name: 'asc' }];
        break;
      case 'recent':
      default:
        orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    const [products, total] = await Promise.all([
      this.prisma.storeProduct.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { take: 1, orderBy: { displayOrder: 'asc' } },
          _count: { select: { variants: true, reviews: { where: { status: 'APPROVED' } } } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.storeProduct.count({ where }),
    ]);

    return {
      data: products.map((p) => this.formatProductSummary(p)),
      meta: {
        currentPage: page,
        perPage: limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string) {
    const product = await this.prisma.storeProduct.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: { where: { isActive: true }, orderBy: { name: 'asc' } },
        images: { orderBy: { displayOrder: 'asc' } },
        specifications: { orderBy: { displayOrder: 'asc' } },
        reviews: {
          where: { status: 'APPROVED' },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            // Note: We need to get user info but user relation isn't in schema
            // This would need a join or separate query
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.formatProductDetails(product);
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string) {
    const product = await this.prisma.storeProduct.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: { orderBy: { name: 'asc' } },
        images: { orderBy: { displayOrder: 'asc' } },
        specifications: { orderBy: { displayOrder: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  /**
   * Create product
   */
  async createProduct(dto: CreateProductDto) {
    // Check slug uniqueness
    const existing = await this.prisma.storeProduct.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Slug já existe');
    }

    // Verify category exists
    const category = await this.prisma.storeCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return this.prisma.storeProduct.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        longDescription: dto.longDescription,
        type: dto.type || 'PHYSICAL',
        pricePoints: dto.pricePoints,
        priceMoney: dto.priceMoney ? new Decimal(dto.priceMoney) : null,
        paymentOptions: dto.paymentOptions || 'BOTH',
        allowMixedPayment: dto.allowMixedPayment ?? true,
        stockType: dto.stockType || 'limited',
        stockCount: dto.stockCount,
        limitPerUser: dto.limitPerUser,
        cashbackPercent: dto.cashbackPercent ? new Decimal(dto.cashbackPercent) : null,
        voucherValidityDays: dto.voucherValidityDays,
        pickupLocation: dto.pickupLocation,
        eligiblePlans: dto.eligiblePlans || [],
        isFeatured: dto.isFeatured ?? false,
      },
      include: {
        category: true,
      },
    });
  }

  /**
   * Update product
   */
  async updateProduct(productId: string, dto: UpdateProductDto) {
    const product = await this.prisma.storeProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.prisma.storeProduct.update({
      where: { id: productId },
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        longDescription: dto.longDescription,
        type: dto.type,
        pricePoints: dto.pricePoints,
        priceMoney: dto.priceMoney !== undefined ? new Decimal(dto.priceMoney) : undefined,
        paymentOptions: dto.paymentOptions,
        allowMixedPayment: dto.allowMixedPayment,
        stockType: dto.stockType,
        stockCount: dto.stockCount,
        limitPerUser: dto.limitPerUser,
        cashbackPercent: dto.cashbackPercent !== undefined ? new Decimal(dto.cashbackPercent) : undefined,
        voucherValidityDays: dto.voucherValidityDays,
        pickupLocation: dto.pickupLocation,
        eligiblePlans: dto.eligiblePlans,
        isActive: dto.isActive,
        isFeatured: dto.isFeatured,
      },
      include: {
        category: true,
      },
    });
  }

  /**
   * Delete (deactivate) product
   */
  async deleteProduct(productId: string) {
    const product = await this.prisma.storeProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.prisma.storeProduct.update({
      where: { id: productId },
      data: { isActive: false },
    });
  }

  /**
   * Add variant to product
   */
  async addVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.prisma.storeProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Check SKU uniqueness
    const existingSku = await this.prisma.productVariant.findUnique({
      where: { sku: dto.sku },
    });

    if (existingSku) {
      throw new ConflictException('SKU já existe');
    }

    return this.prisma.productVariant.create({
      data: {
        productId,
        sku: dto.sku,
        name: dto.name,
        attributes: dto.attributes,
        pricePoints: dto.pricePoints,
        priceMoney: dto.priceMoney ? new Decimal(dto.priceMoney) : null,
        stockCount: dto.stockCount || 0,
        imageUrl: dto.imageUrl,
      },
    });
  }

  /**
   * Update variant
   */
  async updateVariant(variantId: string, dto: UpdateVariantDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Variação não encontrada');
    }

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        name: dto.name,
        pricePoints: dto.pricePoints,
        priceMoney: dto.priceMoney !== undefined ? new Decimal(dto.priceMoney) : undefined,
        stockCount: dto.stockCount,
        isActive: dto.isActive,
      },
    });
  }

  /**
   * Delete variant
   */
  async deleteVariant(variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Variação não encontrada');
    }

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { isActive: false },
    });
  }

  // =====================
  // IMAGES
  // =====================

  async addImage(productId: string, url: string, altText?: string) {
    const product = await this.prisma.storeProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const maxOrder = await this.prisma.productImage.aggregate({
      where: { productId },
      _max: { displayOrder: true },
    });

    return this.prisma.productImage.create({
      data: {
        productId,
        url,
        altText,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
      },
    });
  }

  async deleteImage(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    return this.prisma.productImage.delete({
      where: { id: imageId },
    });
  }

  async getProductImages(productId: string) {
    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Set promotion
   */
  async setPromotion(productId: string, dto: SetPromotionDto) {
    const product = await this.prisma.storeProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.prisma.storeProduct.update({
      where: { id: productId },
      data: {
        isPromotional: true,
        promotionalPricePoints: dto.promotionalPricePoints,
        promotionalPriceMoney: dto.promotionalPriceMoney
          ? new Decimal(dto.promotionalPriceMoney)
          : null,
        promotionalEndsAt: new Date(dto.endsAt),
      },
    });
  }

  /**
   * Remove promotion
   */
  async removePromotion(productId: string) {
    const product = await this.prisma.storeProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.prisma.storeProduct.update({
      where: { id: productId },
      data: {
        isPromotional: false,
        promotionalPricePoints: null,
        promotionalPriceMoney: null,
        promotionalEndsAt: null,
      },
    });
  }

  /**
   * Update stock
   */
  async updateStock(productId: string, quantity: number, variantId?: string) {
    if (variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant) {
        throw new NotFoundException('Variação não encontrada');
      }

      const newStock = variant.stockCount + quantity;
      if (newStock < 0) {
        throw new BadRequestException('Estoque não pode ficar negativo');
      }

      return this.prisma.productVariant.update({
        where: { id: variantId },
        data: { stockCount: newStock },
      });
    } else {
      const product = await this.prisma.storeProduct.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Produto não encontrado');
      }

      const newStock = (product.stockCount || 0) + quantity;
      if (newStock < 0) {
        throw new BadRequestException('Estoque não pode ficar negativo');
      }

      const updated = await this.prisma.storeProduct.update({
        where: { id: productId },
        data: { stockCount: newStock },
      });

      // Check for low stock alert
      if (newStock > 0 && newStock <= LOW_STOCK_THRESHOLD) {
        this.logger.warn(`Low stock alert: product ${productId} has ${newStock} units remaining`);
      }

      return updated;
    }
  }

  /**
   * Get products with low stock
   */
  async getLowStockProducts(associationId: string) {
    return this.prisma.storeProduct.findMany({
      where: {
        category: { associationId },
        isActive: true,
        stockType: 'limited',
        stockCount: { lte: LOW_STOCK_THRESHOLD, gt: 0 },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        stockCount: true,
        images: { take: 1, select: { url: true } },
      },
      orderBy: { stockCount: 'asc' },
    });
  }

  /**
   * Format product for listing
   */
  private formatProductSummary(product: any) {
    const thumbnailUrl = product.images?.[0]?.url;

    // Check if promotional and if promotion is active
    const isPromotionalActive =
      product.isPromotional &&
      product.promotionalEndsAt &&
      new Date() < new Date(product.promotionalEndsAt);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      type: product.type,
      category: product.category,
      pricePoints: isPromotionalActive
        ? product.promotionalPricePoints
        : product.pricePoints,
      priceMoney: isPromotionalActive
        ? Number(product.promotionalPriceMoney)
        : Number(product.priceMoney),
      originalPricePoints: isPromotionalActive ? product.pricePoints : null,
      originalPriceMoney: isPromotionalActive ? Number(product.priceMoney) : null,
      isPromotional: isPromotionalActive,
      promotionalEndsAt: isPromotionalActive ? product.promotionalEndsAt : null,
      isFeatured: product.isFeatured,
      thumbnailUrl,
      averageRating: product.averageRating ? Number(product.averageRating) : null,
      reviewCount: product._count?.reviews || 0,
      hasVariants: (product._count?.variants || 0) > 0,
      isAvailable:
        product.stockType === 'unlimited' ||
        (product.stockCount !== null && product.stockCount > 0),
    };
  }

  /**
   * Format product details
   */
  private formatProductDetails(product: any) {
    const isPromotionalActive =
      product.isPromotional &&
      product.promotionalEndsAt &&
      new Date() < new Date(product.promotionalEndsAt);

    return {
      ...product,
      averageRating: product.averageRating ? Number(product.averageRating) : null,
      cashbackPercent: product.cashbackPercent ? Number(product.cashbackPercent) : null,
      pricePoints: isPromotionalActive
        ? product.promotionalPricePoints
        : product.pricePoints,
      priceMoney: isPromotionalActive
        ? Number(product.promotionalPriceMoney)
        : Number(product.priceMoney),
      originalPricePoints: isPromotionalActive ? product.pricePoints : null,
      originalPriceMoney: isPromotionalActive ? Number(product.priceMoney) : null,
      isPromotional: isPromotionalActive,
      isAvailable:
        product.stockType === 'unlimited' ||
        (product.stockCount !== null && product.stockCount > 0),
      variants: product.variants?.map((v: any) => ({
        ...v,
        priceMoney: v.priceMoney ? Number(v.priceMoney) : null,
        isAvailable: v.stockCount > 0,
      })),
    };
  }
}
