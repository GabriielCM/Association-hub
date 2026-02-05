import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FavoritesService } from '../services/favorites.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let prisma: any;

  const mockProduct = {
    id: 'prod-1',
    name: 'Produto Teste',
    slug: 'produto-teste',
    shortDescription: 'Descrição',
    pricePoints: 100,
    priceMoney: new Decimal(10.0),
    type: 'PHYSICAL',
    isActive: true,
    stockType: 'limited',
    stockCount: 50,
    images: [{ url: 'https://example.com/img.jpg' }],
  };

  const mockFavorite = {
    id: 'fav-1',
    userId: 'user-1',
    productId: 'prod-1',
    createdAt: new Date(),
    product: mockProduct,
  };

  beforeEach(() => {
    prisma = {
      productFavorite: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      storeProduct: {
        findUnique: vi.fn(),
      },
    };

    service = new FavoritesService(prisma);
  });

  // ===========================================
  // getFavorites
  // ===========================================

  describe('getFavorites', () => {
    it('should return user favorites', async () => {
      prisma.productFavorite.findMany.mockResolvedValue([mockFavorite]);

      const result = await service.getFavorites('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].product.id).toBe('prod-1');
      expect(result[0].product.name).toBe('Produto Teste');
    });

    it('should return empty array when no favorites', async () => {
      prisma.productFavorite.findMany.mockResolvedValue([]);

      const result = await service.getFavorites('user-1');

      expect(result).toHaveLength(0);
    });

    it('should include product availability', async () => {
      prisma.productFavorite.findMany.mockResolvedValue([mockFavorite]);

      const result = await service.getFavorites('user-1');

      expect(result[0].product.isAvailable).toBe(true);
    });

    it('should mark product as unavailable when out of stock', async () => {
      const unavailableFavorite = {
        ...mockFavorite,
        product: { ...mockProduct, stockCount: 0 },
      };
      prisma.productFavorite.findMany.mockResolvedValue([unavailableFavorite]);

      const result = await service.getFavorites('user-1');

      expect(result[0].product.isAvailable).toBe(false);
    });

    it('should mark product as unavailable when inactive', async () => {
      const inactiveFavorite = {
        ...mockFavorite,
        product: { ...mockProduct, isActive: false },
      };
      prisma.productFavorite.findMany.mockResolvedValue([inactiveFavorite]);

      const result = await service.getFavorites('user-1');

      expect(result[0].product.isAvailable).toBe(false);
    });
  });

  // ===========================================
  // isFavorited
  // ===========================================

  describe('isFavorited', () => {
    it('should return true when product is favorited', async () => {
      prisma.productFavorite.findUnique.mockResolvedValue(mockFavorite);

      const result = await service.isFavorited('user-1', 'prod-1');

      expect(result).toBe(true);
    });

    it('should return false when product is not favorited', async () => {
      prisma.productFavorite.findUnique.mockResolvedValue(null);

      const result = await service.isFavorited('user-1', 'prod-1');

      expect(result).toBe(false);
    });
  });

  // ===========================================
  // addFavorite
  // ===========================================

  describe('addFavorite', () => {
    it('should add product to favorites', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.productFavorite.findUnique.mockResolvedValue(null);
      prisma.productFavorite.create.mockResolvedValue(mockFavorite);

      const result = await service.addFavorite('user-1', 'prod-1');

      expect(result.success).toBe(true);
      expect(prisma.productFavorite.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          productId: 'prod-1',
        },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(null);

      await expect(service.addFavorite('user-1', 'invalid')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when already favorited', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.productFavorite.findUnique.mockResolvedValue(mockFavorite);

      await expect(service.addFavorite('user-1', 'prod-1')).rejects.toThrow(ConflictException);
    });
  });

  // ===========================================
  // removeFavorite
  // ===========================================

  describe('removeFavorite', () => {
    it('should remove product from favorites', async () => {
      prisma.productFavorite.findUnique.mockResolvedValue(mockFavorite);
      prisma.productFavorite.delete.mockResolvedValue(mockFavorite);

      const result = await service.removeFavorite('user-1', 'prod-1');

      expect(result.success).toBe(true);
      expect(prisma.productFavorite.delete).toHaveBeenCalledWith({
        where: {
          userId_productId: { userId: 'user-1', productId: 'prod-1' },
        },
      });
    });

    it('should throw NotFoundException when favorite not found', async () => {
      prisma.productFavorite.findUnique.mockResolvedValue(null);

      await expect(service.removeFavorite('user-1', 'invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // toggleFavorite
  // ===========================================

  describe('toggleFavorite', () => {
    it('should add favorite when not favorited', async () => {
      prisma.productFavorite.findUnique
        .mockResolvedValueOnce(null) // isFavorited check
        .mockResolvedValueOnce(null); // addFavorite check
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.productFavorite.create.mockResolvedValue(mockFavorite);

      const result = await service.toggleFavorite('user-1', 'prod-1');

      expect(result.favorited).toBe(true);
    });

    it('should remove favorite when already favorited', async () => {
      prisma.productFavorite.findUnique
        .mockResolvedValueOnce(mockFavorite) // isFavorited check
        .mockResolvedValueOnce(mockFavorite); // removeFavorite check
      prisma.productFavorite.delete.mockResolvedValue(mockFavorite);

      const result = await service.toggleFavorite('user-1', 'prod-1');

      expect(result.favorited).toBe(false);
    });
  });
});
