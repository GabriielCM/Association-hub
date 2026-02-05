import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CategoriesService } from '../services/categories.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: any;

  const mockCategory = {
    id: 'cat-1',
    associationId: 'assoc-1',
    name: 'Eletrônicos',
    slug: 'eletronicos',
    description: 'Produtos eletrônicos',
    imageUrl: 'https://example.com/img.jpg',
    displayOrder: 0,
    isActive: true,
    _count: { products: 3 },
  };

  beforeEach(() => {
    prisma = {
      storeCategory: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new CategoriesService(prisma);
  });

  // ===========================================
  // getCategories
  // ===========================================

  describe('getCategories', () => {
    it('should return active categories by default', async () => {
      prisma.storeCategory.findMany.mockResolvedValue([mockCategory]);

      const result = await service.getCategories('assoc-1');

      expect(result).toHaveLength(1);
      expect(prisma.storeCategory.findMany).toHaveBeenCalledWith({
        where: { associationId: 'assoc-1', isActive: true },
        include: expect.any(Object),
        orderBy: { displayOrder: 'asc' },
      });
    });

    it('should include inactive categories when specified', async () => {
      prisma.storeCategory.findMany.mockResolvedValue([mockCategory]);

      await service.getCategories('assoc-1', true);

      expect(prisma.storeCategory.findMany).toHaveBeenCalledWith({
        where: { associationId: 'assoc-1' },
        include: expect.any(Object),
        orderBy: { displayOrder: 'asc' },
      });
    });

    it('should return empty array when no categories', async () => {
      prisma.storeCategory.findMany.mockResolvedValue([]);

      const result = await service.getCategories('assoc-1');

      expect(result).toHaveLength(0);
    });
  });

  // ===========================================
  // getCategoryById
  // ===========================================

  describe('getCategoryById', () => {
    it('should return category by id', async () => {
      prisma.storeCategory.findUnique.mockResolvedValue(mockCategory);

      const result = await service.getCategoryById('cat-1');

      expect(result.id).toBe('cat-1');
      expect(prisma.storeCategory.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      prisma.storeCategory.findUnique.mockResolvedValue(null);

      await expect(service.getCategoryById('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // getCategoryBySlug
  // ===========================================

  describe('getCategoryBySlug', () => {
    it('should return category by slug', async () => {
      prisma.storeCategory.findUnique.mockResolvedValue(mockCategory);

      const result = await service.getCategoryBySlug('assoc-1', 'eletronicos');

      expect(result.slug).toBe('eletronicos');
      expect(prisma.storeCategory.findUnique).toHaveBeenCalledWith({
        where: { associationId_slug: { associationId: 'assoc-1', slug: 'eletronicos' } },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      prisma.storeCategory.findUnique.mockResolvedValue(null);

      await expect(service.getCategoryBySlug('assoc-1', 'invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // createCategory
  // ===========================================

  describe('createCategory', () => {
    const createDto = {
      name: 'Nova Categoria',
      slug: 'nova-categoria',
    };

    it('should create a new category', async () => {
      prisma.storeCategory.findUnique.mockResolvedValue(null);
      prisma.storeCategory.create.mockResolvedValue({ id: 'cat-new', ...createDto });

      const result = await service.createCategory('assoc-1', createDto);

      expect(result.name).toBe('Nova Categoria');
      expect(prisma.storeCategory.create).toHaveBeenCalledWith({
        data: {
          associationId: 'assoc-1',
          name: 'Nova Categoria',
          slug: 'nova-categoria',
          description: undefined,
          imageUrl: undefined,
          displayOrder: 0,
        },
      });
    });

    it('should throw ConflictException when slug already exists', async () => {
      prisma.storeCategory.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.createCategory('assoc-1', createDto)).rejects.toThrow(ConflictException);
    });

    it('should create category with all fields', async () => {
      const fullDto = {
        ...createDto,
        description: 'Descrição completa',
        imageUrl: 'https://example.com/img.jpg',
        displayOrder: 5,
      };
      prisma.storeCategory.findUnique.mockResolvedValue(null);
      prisma.storeCategory.create.mockResolvedValue({ id: 'cat-new', ...fullDto });

      const result = await service.createCategory('assoc-1', fullDto);

      expect(result.description).toBe('Descrição completa');
      expect(result.displayOrder).toBe(5);
    });
  });

  // ===========================================
  // updateCategory
  // ===========================================

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const updateDto = { name: 'Atualizado' };
      prisma.storeCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.storeCategory.update.mockResolvedValue({ ...mockCategory, name: 'Atualizado' });

      const result = await service.updateCategory('cat-1', updateDto);

      expect(result.name).toBe('Atualizado');
    });

    it('should throw NotFoundException when category not found', async () => {
      prisma.storeCategory.findUnique.mockResolvedValue(null);

      await expect(service.updateCategory('invalid', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should update multiple fields', async () => {
      const updateDto = {
        name: 'Novo Nome',
        description: 'Nova descrição',
        isActive: false,
      };
      prisma.storeCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.storeCategory.update.mockResolvedValue({ ...mockCategory, ...updateDto });

      const result = await service.updateCategory('cat-1', updateDto);

      expect(result.name).toBe('Novo Nome');
      expect(result.isActive).toBe(false);
    });
  });

  // ===========================================
  // deleteCategory (deactivate)
  // ===========================================

  describe('deleteCategory', () => {
    it('should deactivate a category', async () => {
      prisma.storeCategory.findUnique.mockResolvedValue(mockCategory);
      prisma.storeCategory.update.mockResolvedValue({ ...mockCategory, isActive: false });

      const result = await service.deleteCategory('cat-1');

      expect(result.isActive).toBe(false);
      expect(prisma.storeCategory.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      prisma.storeCategory.findUnique.mockResolvedValue(null);

      await expect(service.deleteCategory('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
