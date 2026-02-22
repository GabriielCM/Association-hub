import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductsService } from '../services/products.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: any;

  const mockProduct = {
    id: 'prod-1',
    name: 'Produto Teste',
    slug: 'produto-teste',
    shortDescription: 'Descrição curta',
    type: 'PHYSICAL',
    pricePoints: 100,
    priceMoney: new Decimal(10.0),
    isActive: true,
    isFeatured: false,
    isPromotional: false,
    stockType: 'limited',
    stockCount: 50,
    category: { id: 'cat-1', name: 'Categoria', slug: 'categoria' },
    images: [{ url: 'https://example.com/img.jpg' }],
    _count: { variants: 0, reviews: 3 },
  };

  beforeEach(() => {
    prisma = {
      storeProduct: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      storeCategory: {
        findUnique: vi.fn(),
      },
      productVariant: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      productReview: {
        findMany: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
    };

    service = new ProductsService(prisma);
  });

  // ===========================================
  // findAll / getProducts
  // ===========================================

  describe('findAll', () => {
    it('should return paginated products', async () => {
      prisma.storeProduct.findMany.mockResolvedValue([mockProduct]);
      prisma.storeProduct.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalCount).toBe(1);
      expect(result.meta.currentPage).toBe(1);
    });

    it('should filter by categoryId', async () => {
      prisma.storeProduct.findMany.mockResolvedValue([mockProduct]);
      prisma.storeProduct.count.mockResolvedValue(1);

      await service.findAll({ categoryId: 'cat-1' });

      expect(prisma.storeProduct.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: 'cat-1' }),
        }),
      );
    });

    it('should filter by type', async () => {
      prisma.storeProduct.findMany.mockResolvedValue([]);
      prisma.storeProduct.count.mockResolvedValue(0);

      await service.findAll({ type: 'VOUCHER' as any });

      expect(prisma.storeProduct.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'VOUCHER' }),
        }),
      );
    });

    it('should filter featured products', async () => {
      prisma.storeProduct.findMany.mockResolvedValue([]);
      prisma.storeProduct.count.mockResolvedValue(0);

      await service.findAll({ featured: true });

      expect(prisma.storeProduct.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isFeatured: true }),
        }),
      );
    });

    it('should search by name', async () => {
      prisma.storeProduct.findMany.mockResolvedValue([mockProduct]);
      prisma.storeProduct.count.mockResolvedValue(1);

      await service.findAll({ search: 'teste' });

      expect(prisma.storeProduct.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: { contains: 'teste', mode: 'insensitive' } }),
            ]),
          }),
        }),
      );
    });
  });

  // ===========================================
  // findBySlug / getProductBySlug
  // ===========================================

  describe('findBySlug', () => {
    it('should return product by slug', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findBySlug('produto-teste');

      expect(result.id).toBe('prod-1');
      expect(prisma.storeProduct.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: 'produto-teste' } }),
      );
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('invalid')).rejects.toThrow(NotFoundException);
    });

    it('should handle promotional pricing', async () => {
      const promotionalProduct = {
        ...mockProduct,
        isPromotional: true,
        promotionalPricePoints: 80,
        promotionalPriceMoney: new Decimal(8.0),
        promotionalEndsAt: new Date(Date.now() + 86400000), // Tomorrow
      };
      prisma.storeProduct.findUnique.mockResolvedValue(promotionalProduct);

      const result = await service.findBySlug('produto-teste');

      expect(result.pricePoints).toBe(80);
      expect(result.originalPricePoints).toBe(100);
    });
  });

  // ===========================================
  // findById / getProductById
  // ===========================================

  describe('findById', () => {
    it('should return product by id', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findById('prod-1');

      expect(result.id).toBe('prod-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(null);

      await expect(service.findById('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // findAllAdmin
  // ===========================================

  describe('findAllAdmin', () => {
    it('should return all products including inactive', async () => {
      const products = [
        mockProduct,
        { ...mockProduct, id: 'prod-2', isActive: false },
      ];
      prisma.storeProduct.findMany.mockResolvedValue(products);

      const result = await service.findAllAdmin();

      expect(result).toHaveLength(2);
      expect(prisma.storeProduct.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  // ===========================================
  // create / createProduct
  // ===========================================

  describe('create', () => {
    const createDto = {
      categoryId: 'cat-1',
      name: 'Novo Produto',
      slug: 'novo-produto',
      pricePoints: 200,
    };

    it('should create a product', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(null);
      prisma.storeCategory.findUnique.mockResolvedValue({ id: 'cat-1' });
      prisma.storeProduct.create.mockResolvedValue({ id: 'prod-new', ...createDto });

      const result = await service.create(createDto);

      expect(result.id).toBe('prod-new');
      expect(prisma.storeProduct.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when slug exists', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when category not found', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(null);
      prisma.storeCategory.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // update / updateProduct
  // ===========================================

  describe('update', () => {
    it('should update a product', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.storeProduct.update.mockResolvedValue({ ...mockProduct, name: 'Atualizado' });

      const result = await service.update('prod-1', { name: 'Atualizado' });

      expect(result.name).toBe('Atualizado');
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(null);

      await expect(service.update('invalid', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // delete / deleteProduct
  // ===========================================

  describe('delete', () => {
    it('should deactivate a product', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.storeProduct.update.mockResolvedValue({ ...mockProduct, isActive: false });

      const result = await service.delete('prod-1');

      expect(result.isActive).toBe(false);
      expect(prisma.storeProduct.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(null);

      await expect(service.delete('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // createVariant / addVariant
  // ===========================================

  describe('createVariant', () => {
    const variantDto = {
      sku: 'SKU-001',
      name: 'M - Azul',
      attributes: { size: 'M', color: 'Azul' },
    };

    it('should create a variant', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.productVariant.findUnique.mockResolvedValue(null);
      prisma.productVariant.create.mockResolvedValue({ id: 'var-1', ...variantDto });

      const result = await service.createVariant('prod-1', variantDto);

      expect(result.sku).toBe('SKU-001');
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(null);

      await expect(service.createVariant('invalid', variantDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when SKU exists', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.productVariant.findUnique.mockResolvedValue({ id: 'existing', sku: 'SKU-001' });

      await expect(service.createVariant('prod-1', variantDto)).rejects.toThrow(ConflictException);
    });
  });

  // ===========================================
  // updateVariantById
  // ===========================================

  describe('updateVariantById', () => {
    it('should update a variant', async () => {
      const mockVariant = { id: 'var-1', productId: 'prod-1', name: 'M - Azul' };
      // findFirst for initial verification, findUnique for updateVariant internal call
      prisma.productVariant.findFirst.mockResolvedValue(mockVariant);
      prisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      prisma.productVariant.update.mockResolvedValue({ ...mockVariant, name: 'L - Azul' });

      const result = await service.updateVariantById('prod-1', 'var-1', { name: 'L - Azul' });

      expect(result.name).toBe('L - Azul');
    });

    it('should throw NotFoundException when variant not found', async () => {
      prisma.productVariant.findFirst.mockResolvedValue(null);

      await expect(
        service.updateVariantById('prod-1', 'invalid', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // deleteVariantById
  // ===========================================

  describe('deleteVariantById', () => {
    it('should deactivate a variant', async () => {
      const mockVariant = { id: 'var-1', productId: 'prod-1', isActive: true };
      // findFirst for initial verification, findUnique for deleteVariant internal call
      prisma.productVariant.findFirst.mockResolvedValue(mockVariant);
      prisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      prisma.productVariant.update.mockResolvedValue({ ...mockVariant, isActive: false });

      const result = await service.deleteVariantById('prod-1', 'var-1');

      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when variant not found', async () => {
      prisma.productVariant.findFirst.mockResolvedValue(null);

      await expect(service.deleteVariantById('prod-1', 'invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // getProductReviews
  // ===========================================

  describe('getProductReviews', () => {
    it('should return approved reviews with user info', async () => {
      const mockReviews = [
        { id: 'rev-1', productId: 'prod-1', userId: 'user-1', rating: 5, comment: 'Ótimo!' },
      ];
      const mockUsers = [{ id: 'user-1', name: 'João', avatarUrl: 'https://example.com/avatar.jpg' }];

      prisma.productReview.findMany.mockResolvedValue(mockReviews);
      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getProductReviews('prod-1');

      expect(result).toHaveLength(1);
      expect(result[0].user?.name).toBe('João');
    });

    it('should handle reviews without user info', async () => {
      const mockReviews = [
        { id: 'rev-1', productId: 'prod-1', userId: 'deleted-user', rating: 4, comment: 'Bom' },
      ];
      prisma.productReview.findMany.mockResolvedValue(mockReviews);
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.getProductReviews('prod-1');

      expect(result[0].user).toBeNull();
    });
  });

  // ===========================================
  // setPromotion
  // ===========================================

  describe('setPromotion', () => {
    it('should set promotional pricing', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.storeProduct.update.mockResolvedValue({
        ...mockProduct,
        isPromotional: true,
        promotionalPricePoints: 80,
      });

      const result = await service.setPromotion('prod-1', {
        promotionalPricePoints: 80,
        endsAt: '2025-12-31',
      });

      expect(result.isPromotional).toBe(true);
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(null);

      await expect(
        service.setPromotion('invalid', { endsAt: '2025-12-31' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // removePromotion
  // ===========================================

  describe('removePromotion', () => {
    it('should remove promotional pricing', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue({
        ...mockProduct,
        isPromotional: true,
      });
      prisma.storeProduct.update.mockResolvedValue({
        ...mockProduct,
        isPromotional: false,
        promotionalPricePoints: null,
      });

      const result = await service.removePromotion('prod-1');

      expect(result.isPromotional).toBe(false);
    });
  });

  // ===========================================
  // updateStock
  // ===========================================

  describe('updateStock', () => {
    it('should update product stock', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue({ ...mockProduct, stockCount: 50 });
      prisma.storeProduct.update.mockResolvedValue({ ...mockProduct, stockCount: 60 });

      const result = await service.updateStock('prod-1', 10);

      expect(result.stockCount).toBe(60);
    });

    it('should throw BadRequestException for negative stock', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue({ ...mockProduct, stockCount: 5 });

      await expect(service.updateStock('prod-1', -10)).rejects.toThrow(BadRequestException);
    });

    it('should update variant stock', async () => {
      prisma.productVariant.findUnique.mockResolvedValue({ id: 'var-1', stockCount: 20 });
      prisma.productVariant.update.mockResolvedValue({ id: 'var-1', stockCount: 25 });

      const result = await service.updateStock('prod-1', 5, 'var-1');

      expect(result.stockCount).toBe(25);
    });
  });

  // ===========================================
  // updateVariantStock
  // ===========================================

  describe('updateVariantStock', () => {
    it('should set variant stock to specific value', async () => {
      prisma.productVariant.findFirst.mockResolvedValue({ id: 'var-1', productId: 'prod-1' });
      prisma.productVariant.update.mockResolvedValue({ id: 'var-1', stockCount: 100 });

      const result = await service.updateVariantStock('prod-1', 'var-1', 100);

      expect(result.stockCount).toBe(100);
    });

    it('should throw NotFoundException when variant not found', async () => {
      prisma.productVariant.findFirst.mockResolvedValue(null);

      await expect(service.updateVariantStock('prod-1', 'invalid', 100)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
