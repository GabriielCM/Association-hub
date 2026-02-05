import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReviewsService } from '../services/reviews.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: any;

  const mockReview = {
    id: 'review-1',
    productId: 'prod-1',
    userId: 'user-1',
    orderId: 'order-1',
    rating: 5,
    comment: 'Excelente produto!',
    status: 'PENDING',
    createdAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    name: 'João Silva',
    email: 'joao@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const mockProduct = {
    id: 'prod-1',
    name: 'Produto Teste',
    slug: 'produto-teste',
  };

  beforeEach(() => {
    prisma = {
      productReview: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        aggregate: vi.fn(),
      },
      storeProduct: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      order: {
        findFirst: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
    };

    service = new ReviewsService(prisma);
  });

  // ===========================================
  // getProductReviews
  // ===========================================

  describe('getProductReviews', () => {
    it('should return approved reviews with user info', async () => {
      const reviews = [{ ...mockReview, status: 'APPROVED' }];
      prisma.productReview.findMany.mockResolvedValue(reviews);
      prisma.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.getProductReviews('prod-1');

      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(5);
      expect(result[0].user?.name).toBe('João Silva');
    });

    it('should return all reviews when includeAll is true', async () => {
      const reviews = [mockReview, { ...mockReview, id: 'review-2', status: 'REJECTED' }];
      prisma.productReview.findMany.mockResolvedValue(reviews);
      prisma.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.getProductReviews('prod-1', true);

      expect(result).toHaveLength(2);
    });

    it('should handle reviews without user info', async () => {
      prisma.productReview.findMany.mockResolvedValue([mockReview]);
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.getProductReviews('prod-1');

      expect(result[0].user).toBeNull();
    });
  });

  // ===========================================
  // createReview
  // ===========================================

  describe('createReview', () => {
    const createDto = {
      orderId: 'order-1',
      rating: 5,
      comment: 'Ótimo produto!',
    };

    it('should create a review', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.order.findFirst.mockResolvedValue({ id: 'order-1', status: 'COMPLETED' });
      prisma.productReview.findUnique.mockResolvedValue(null);
      prisma.productReview.create.mockResolvedValue(mockReview);

      const result = await service.createReview('user-1', 'prod-1', createDto);

      expect(result.rating).toBe(5);
      expect(prisma.productReview.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: 'prod-1',
          userId: 'user-1',
          orderId: 'order-1',
          rating: 5,
          status: 'PENDING',
        }),
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(null);

      await expect(service.createReview('user-1', 'invalid', createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when user has not purchased the product', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.order.findFirst.mockResolvedValue(null);

      await expect(service.createReview('user-1', 'prod-1', createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when review already exists', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.order.findFirst.mockResolvedValue({ id: 'order-1', status: 'COMPLETED' });
      prisma.productReview.findUnique.mockResolvedValue(mockReview);

      await expect(service.createReview('user-1', 'prod-1', createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ===========================================
  // moderateReview
  // ===========================================

  describe('moderateReview', () => {
    it('should approve a review', async () => {
      prisma.productReview.findUnique.mockResolvedValue(mockReview);
      prisma.productReview.update.mockResolvedValue({ ...mockReview, status: 'APPROVED' });
      prisma.productReview.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: 10,
      });
      prisma.storeProduct.update.mockResolvedValue(mockProduct);

      const result = await service.moderateReview('review-1', 'admin-1', { status: 'APPROVED' as any });

      expect(result.status).toBe('APPROVED');
      expect(prisma.storeProduct.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: {
          averageRating: expect.any(Decimal),
          reviewCount: 10,
        },
      });
    });

    it('should reject a review without updating product rating', async () => {
      prisma.productReview.findUnique.mockResolvedValue(mockReview);
      prisma.productReview.update.mockResolvedValue({ ...mockReview, status: 'REJECTED' });

      const result = await service.moderateReview('review-1', 'admin-1', { status: 'REJECTED' as any });

      expect(result.status).toBe('REJECTED');
      expect(prisma.storeProduct.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when review not found', async () => {
      prisma.productReview.findUnique.mockResolvedValue(null);

      await expect(
        service.moderateReview('invalid', 'admin-1', { status: 'APPROVED' as any }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should record moderator info', async () => {
      prisma.productReview.findUnique.mockResolvedValue(mockReview);
      prisma.productReview.update.mockResolvedValue({ ...mockReview, status: 'APPROVED' });
      prisma.productReview.aggregate.mockResolvedValue({ _avg: { rating: 4 }, _count: 5 });
      prisma.storeProduct.update.mockResolvedValue(mockProduct);

      await service.moderateReview('review-1', 'admin-1', { status: 'APPROVED' as any });

      expect(prisma.productReview.update).toHaveBeenCalledWith({
        where: { id: 'review-1' },
        data: expect.objectContaining({
          moderatedBy: 'admin-1',
          moderatedAt: expect.any(Date),
        }),
      });
    });
  });

  // ===========================================
  // getPendingReviews
  // ===========================================

  describe('getPendingReviews', () => {
    it('should return pending reviews with product and user info', async () => {
      const pendingReviews = [{ ...mockReview, product: mockProduct }];
      prisma.productReview.findMany.mockResolvedValue(pendingReviews);
      prisma.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.getPendingReviews();

      expect(result).toHaveLength(1);
      expect(result[0].product.name).toBe('Produto Teste');
      expect(result[0].user?.email).toBe('joao@example.com');
    });

    it('should order by creation date ascending', async () => {
      prisma.productReview.findMany.mockResolvedValue([]);
      prisma.user.findMany.mockResolvedValue([]);

      await service.getPendingReviews();

      expect(prisma.productReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'asc' },
        }),
      );
    });
  });
});
