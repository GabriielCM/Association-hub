import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all categories
   */
  async getCategories(associationId: string, includeInactive = false) {
    const where: any = { associationId };
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.prisma.storeCategory.findMany({
      where,
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string) {
    const category = await this.prisma.storeCategory.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          where: { isActive: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(associationId: string, slug: string) {
    const category = await this.prisma.storeCategory.findUnique({
      where: {
        associationId_slug: { associationId, slug },
      },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  /**
   * Create category
   */
  async createCategory(associationId: string, dto: CreateCategoryDto) {
    // Check if slug already exists
    const existing = await this.prisma.storeCategory.findUnique({
      where: {
        associationId_slug: { associationId, slug: dto.slug },
      },
    });

    if (existing) {
      throw new ConflictException('Slug já existe');
    }

    return this.prisma.storeCategory.create({
      data: {
        associationId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        displayOrder: dto.displayOrder || 0,
      },
    });
  }

  /**
   * Update category
   */
  async updateCategory(categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.storeCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return this.prisma.storeCategory.update({
      where: { id: categoryId },
      data: {
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        displayOrder: dto.displayOrder,
        isActive: dto.isActive,
      },
    });
  }

  /**
   * Delete (deactivate) category
   */
  async deleteCategory(categoryId: string) {
    const category = await this.prisma.storeCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return this.prisma.storeCategory.update({
      where: { id: categoryId },
      data: { isActive: false },
    });
  }

  /**
   * Reorder categories by updating displayOrder
   */
  async reorderCategories(categoryIds: string[]) {
    const updates = categoryIds.map((id, index) =>
      this.prisma.storeCategory.update({
        where: { id },
        data: { displayOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return { success: true, count: categoryIds.length };
  }
}
