import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateReviewDto, ModerateReviewDto } from '../dto/review.dto';
import { ReviewStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get product reviews
   */
  async getProductReviews(productId: string, includeAll = false) {
    const where: any = { productId };
    if (!includeAll) {
      where.status = ReviewStatus.APPROVED;
    }

    const reviews = await this.prisma.productReview.findMany({
      where,
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
        status: review.status,
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
   * Create review
   */
  async createReview(userId: string, productId: string, dto: CreateReviewDto) {
    // Check if product exists
    const product = await this.prisma.storeProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Check if user bought this product (order must be completed)
    const order = await this.prisma.order.findFirst({
      where: {
        id: dto.orderId,
        userId,
        status: 'COMPLETED',
        items: {
          some: { productId },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Você precisa comprar o produto para avaliá-lo');
    }

    // Check if already reviewed
    const existing = await this.prisma.productReview.findUnique({
      where: {
        productId_userId_orderId: { productId, userId, orderId: dto.orderId },
      },
    });

    if (existing) {
      throw new ConflictException('Você já avaliou este produto para este pedido');
    }

    // Create review
    const review = await this.prisma.productReview.create({
      data: {
        productId,
        userId,
        orderId: dto.orderId,
        rating: dto.rating,
        comment: dto.comment,
        status: ReviewStatus.PENDING,
      },
    });

    return review;
  }

  /**
   * Moderate review (Admin)
   */
  async moderateReview(reviewId: string, adminId: string, dto: ModerateReviewDto) {
    const review = await this.prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    const updatedReview = await this.prisma.productReview.update({
      where: { id: reviewId },
      data: {
        status: dto.status,
        moderatedBy: adminId,
        moderatedAt: new Date(),
      },
    });

    // Update product average rating if approved
    if (dto.status === ReviewStatus.APPROVED) {
      await this.updateProductRating(review.productId);
    }

    return updatedReview;
  }

  /**
   * Get pending reviews (Admin)
   */
  async getPendingReviews() {
    const reviews = await this.prisma.productReview.findMany({
      where: { status: ReviewStatus.PENDING },
      include: {
        product: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Get user info
    const userIds = reviews.map((r) => r.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return reviews.map((review) => {
      const user = userMap.get(review.userId);
      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        product: review.product,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
            }
          : null,
      };
    });
  }

  /**
   * Update product average rating
   */
  private async updateProductRating(productId: string) {
    const result = await this.prisma.productReview.aggregate({
      where: {
        productId,
        status: ReviewStatus.APPROVED,
      },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.storeProduct.update({
      where: { id: productId },
      data: {
        averageRating: result._avg.rating ? new Decimal(result._avg.rating) : null,
        reviewCount: result._count,
      },
    });
  }
}
