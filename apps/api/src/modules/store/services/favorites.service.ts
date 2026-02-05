import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user's favorites
   */
  async getFavorites(userId: string) {
    const favorites = await this.prisma.productFavorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { displayOrder: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => ({
      id: fav.id,
      product: {
        id: fav.product.id,
        name: fav.product.name,
        slug: fav.product.slug,
        shortDescription: fav.product.shortDescription,
        pricePoints: fav.product.pricePoints,
        priceMoney: fav.product.priceMoney ? Number(fav.product.priceMoney) : null,
        imageUrl: fav.product.images?.[0]?.url,
        type: fav.product.type,
        isAvailable:
          fav.product.isActive &&
          (fav.product.stockType === 'unlimited' ||
            (fav.product.stockCount !== null && fav.product.stockCount > 0)),
      },
      createdAt: fav.createdAt,
    }));
  }

  /**
   * Check if product is favorited
   */
  async isFavorited(userId: string, productId: string) {
    const favorite = await this.prisma.productFavorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    return !!favorite;
  }

  /**
   * Add product to favorites
   */
  async addFavorite(userId: string, productId: string) {
    // Check if product exists
    const product = await this.prisma.storeProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Check if already favorited
    const existing = await this.prisma.productFavorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      throw new ConflictException('Produto já está nos favoritos');
    }

    await this.prisma.productFavorite.create({
      data: {
        userId,
        productId,
      },
    });

    return { success: true };
  }

  /**
   * Remove product from favorites
   */
  async removeFavorite(userId: string, productId: string) {
    const favorite = await this.prisma.productFavorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Produto não está nos favoritos');
    }

    await this.prisma.productFavorite.delete({
      where: {
        userId_productId: { userId, productId },
      },
    });

    return { success: true };
  }

  /**
   * Toggle favorite
   */
  async toggleFavorite(userId: string, productId: string) {
    const isFavorited = await this.isFavorited(userId, productId);

    if (isFavorited) {
      await this.removeFavorite(userId, productId);
      return { favorited: false };
    } else {
      await this.addFavorite(userId, productId);
      return { favorited: true };
    }
  }
}
