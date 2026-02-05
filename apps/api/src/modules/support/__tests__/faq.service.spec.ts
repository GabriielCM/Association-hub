import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FAQService } from '../faq.service';
import { NotFoundException } from '@nestjs/common';

describe('FAQService', () => {
  let service: FAQService;
  let prisma: any;

  const mockFAQ = {
    id: 'faq-1',
    associationId: 'assoc-1',
    question: 'Como ganho pontos?',
    answer: 'Você ganha pontos participando de eventos.',
    category: 'Pontos',
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      fAQItem: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        aggregate: vi.fn(),
      },
      $transaction: vi.fn((callbacks) => Promise.all(callbacks)),
    };

    service = new FAQService(prisma);
  });

  // ===========================================
  // listFAQs
  // ===========================================

  describe('listFAQs', () => {
    it('should return active FAQs', async () => {
      prisma.fAQItem.findMany.mockResolvedValue([mockFAQ]);

      const result = await service.listFAQs('assoc-1', {});

      expect(result.data).toHaveLength(1);
      expect(result.data[0].question).toBe('Como ganho pontos?');
      expect(result.meta.categories).toContain('Pontos');
    });

    it('should filter by category', async () => {
      prisma.fAQItem.findMany.mockResolvedValue([mockFAQ]);

      await service.listFAQs('assoc-1', { category: 'Pontos' });

      expect(prisma.fAQItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'Pontos',
          }),
        }),
      );
    });

    it('should search in question and answer', async () => {
      prisma.fAQItem.findMany.mockResolvedValue([mockFAQ]);

      await service.listFAQs('assoc-1', { search: 'pontos' });

      expect(prisma.fAQItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  // ===========================================
  // listAllFAQs (admin)
  // ===========================================

  describe('listAllFAQs', () => {
    it('should return all FAQs including inactive', async () => {
      const inactiveFAQ = { ...mockFAQ, isActive: false };
      prisma.fAQItem.findMany.mockResolvedValue([mockFAQ, inactiveFAQ]);

      const result = await service.listAllFAQs('assoc-1');

      expect(result.data).toHaveLength(2);
    });
  });

  // ===========================================
  // createFAQ
  // ===========================================

  describe('createFAQ', () => {
    it('should create a new FAQ item', async () => {
      prisma.fAQItem.aggregate.mockResolvedValue({ _max: { order: 0 } });
      prisma.fAQItem.create.mockResolvedValue(mockFAQ);

      const result = await service.createFAQ('assoc-1', {
        question: 'Como ganho pontos?',
        answer: 'Você ganha pontos participando de eventos.',
        category: 'Pontos',
      });

      expect(result.data.question).toBe('Como ganho pontos?');
      expect(prisma.fAQItem.create).toHaveBeenCalled();
    });

    it('should auto-increment order within category', async () => {
      prisma.fAQItem.aggregate.mockResolvedValue({ _max: { order: 3 } });
      prisma.fAQItem.create.mockResolvedValue({ ...mockFAQ, order: 4 });

      await service.createFAQ('assoc-1', {
        question: 'Nova pergunta',
        answer: 'Nova resposta',
        category: 'Pontos',
      });

      expect(prisma.fAQItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            order: 4,
          }),
        }),
      );
    });
  });

  // ===========================================
  // updateFAQ
  // ===========================================

  describe('updateFAQ', () => {
    it('should update FAQ item', async () => {
      prisma.fAQItem.findFirst.mockResolvedValue(mockFAQ);
      prisma.fAQItem.update.mockResolvedValue({ ...mockFAQ, answer: 'Updated answer' });

      const result = await service.updateFAQ('faq-1', 'assoc-1', {
        answer: 'Updated answer',
      });

      expect(result.data.answer).toBe('Updated answer');
    });

    it('should throw NotFoundException if FAQ not found', async () => {
      prisma.fAQItem.findFirst.mockResolvedValue(null);

      await expect(
        service.updateFAQ('faq-999', 'assoc-1', { answer: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // deleteFAQ
  // ===========================================

  describe('deleteFAQ', () => {
    it('should delete FAQ item', async () => {
      prisma.fAQItem.findFirst.mockResolvedValue(mockFAQ);
      prisma.fAQItem.delete.mockResolvedValue(mockFAQ);

      await service.deleteFAQ('faq-1', 'assoc-1');

      expect(prisma.fAQItem.delete).toHaveBeenCalledWith({ where: { id: 'faq-1' } });
    });

    it('should throw NotFoundException if FAQ not found', async () => {
      prisma.fAQItem.findFirst.mockResolvedValue(null);

      await expect(service.deleteFAQ('faq-999', 'assoc-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // reorderFAQs
  // ===========================================

  describe('reorderFAQs', () => {
    it('should reorder FAQ items', async () => {
      prisma.fAQItem.findMany.mockResolvedValue([mockFAQ, { ...mockFAQ, id: 'faq-2' }]);

      const result = await service.reorderFAQs('assoc-1', {
        items: [
          { id: 'faq-1', order: 2 },
          { id: 'faq-2', order: 1 },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if some items not found', async () => {
      prisma.fAQItem.findMany.mockResolvedValue([mockFAQ]); // Only one item found

      await expect(
        service.reorderFAQs('assoc-1', {
          items: [
            { id: 'faq-1', order: 2 },
            { id: 'faq-999', order: 1 },
          ],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
