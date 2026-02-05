import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FAQQueryDto, CreateFAQDto, UpdateFAQDto, ReorderFAQDto } from './dto/faq.dto';

@Injectable()
export class FAQService {
  private readonly logger = new Logger(FAQService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List active FAQs (public endpoint)
   */
  async listFAQs(associationId: string, query: FAQQueryDto) {
    const where: any = {
      associationId,
      isActive: true,
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { question: { contains: query.search, mode: 'insensitive' } },
        { answer: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const items = await this.prisma.fAQItem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        order: true,
      },
    });

    // Get unique categories
    const categories = [...new Set(items.map((item) => item.category))];

    return {
      data: items,
      meta: { categories },
    };
  }

  /**
   * List all FAQs (admin endpoint)
   */
  async listAllFAQs(associationId: string) {
    const items = await this.prisma.fAQItem.findMany({
      where: { associationId },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });

    return { data: items };
  }

  /**
   * Create FAQ item
   */
  async createFAQ(associationId: string, dto: CreateFAQDto) {
    // Get max order for the category
    const maxOrder = await this.prisma.fAQItem.aggregate({
      where: { associationId, category: dto.category },
      _max: { order: true },
    });

    const item = await this.prisma.fAQItem.create({
      data: {
        associationId,
        question: dto.question,
        answer: dto.answer,
        category: dto.category,
        order: dto.order ?? (maxOrder._max.order ?? 0) + 1,
        isActive: dto.isActive ?? true,
      },
    });

    this.logger.log(`Created FAQ item ${item.id}`);

    return { data: item };
  }

  /**
   * Update FAQ item
   */
  async updateFAQ(id: string, associationId: string, dto: UpdateFAQDto) {
    const existing = await this.prisma.fAQItem.findFirst({
      where: { id, associationId },
    });

    if (!existing) {
      throw new NotFoundException('FAQ item not found');
    }

    const item = await this.prisma.fAQItem.update({
      where: { id },
      data: {
        ...(dto.question && { question: dto.question }),
        ...(dto.answer && { answer: dto.answer }),
        ...(dto.category && { category: dto.category }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    this.logger.log(`Updated FAQ item ${id}`);

    return { data: item };
  }

  /**
   * Delete FAQ item
   */
  async deleteFAQ(id: string, associationId: string) {
    const existing = await this.prisma.fAQItem.findFirst({
      where: { id, associationId },
    });

    if (!existing) {
      throw new NotFoundException('FAQ item not found');
    }

    await this.prisma.fAQItem.delete({ where: { id } });

    this.logger.log(`Deleted FAQ item ${id}`);
  }

  /**
   * Reorder FAQ items
   */
  async reorderFAQs(associationId: string, dto: ReorderFAQDto) {
    // Verify all items belong to association
    const itemIds = dto.items.map((item) => item.id);
    const existingItems = await this.prisma.fAQItem.findMany({
      where: {
        id: { in: itemIds },
        associationId,
      },
    });

    if (existingItems.length !== itemIds.length) {
      throw new NotFoundException('Some FAQ items not found');
    }

    // Update order for each item
    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.fAQItem.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    this.logger.log(`Reordered ${dto.items.length} FAQ items`);

    return { success: true };
  }
}
