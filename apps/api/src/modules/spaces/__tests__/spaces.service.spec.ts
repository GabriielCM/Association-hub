import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpacesService } from '../spaces.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { SpaceStatus, BookingPeriodType, BookingStatus } from '@prisma/client';

describe('SpacesService', () => {
  let service: SpacesService;
  let prisma: any;

  const mockSpace = {
    id: 'space-1',
    associationId: 'assoc-1',
    name: 'Churrasqueira 1',
    description: 'Churrasqueira coberta com capacidade para 30 pessoas',
    capacity: 30,
    images: ['https://cdn.example.com/image1.jpg'],
    mainImageUrl: 'https://cdn.example.com/image1.jpg',
    fee: new Decimal(150),
    periodType: BookingPeriodType.DAY,
    shifts: [],
    openingTime: null,
    closingTime: null,
    minDurationHours: null,
    minAdvanceDays: 2,
    maxAdvanceDays: 60,
    bookingIntervalMonths: 2,
    blockedSpaceIds: [],
    status: SpaceStatus.ACTIVE,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBlock = {
    id: 'block-1',
    spaceId: 'space-1',
    date: new Date('2026-03-15'),
    reason: 'Feriado',
    createdById: 'user-1',
    createdAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      space: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      spaceBlock: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        createMany: vi.fn(),
        delete: vi.fn(),
      },
      booking: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    };

    service = new SpacesService(prisma);
  });

  // ===========================================
  // listSpaces
  // ===========================================

  describe('listSpaces', () => {
    it('should return active spaces with pagination', async () => {
      prisma.space.findMany.mockResolvedValue([mockSpace]);
      prisma.space.count.mockResolvedValue(1);

      const result = await service.listSpaces('assoc-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Churrasqueira 1');
      expect(result.pagination.total).toBe(1);
      expect(prisma.space.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            associationId: 'assoc-1',
            deletedAt: null,
            status: SpaceStatus.ACTIVE,
          },
        }),
      );
    });

    it('should filter by status when provided', async () => {
      prisma.space.findMany.mockResolvedValue([]);
      prisma.space.count.mockResolvedValue(0);

      await service.listSpaces('assoc-1', { status: SpaceStatus.MAINTENANCE });

      expect(prisma.space.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: SpaceStatus.MAINTENANCE,
          }),
        }),
      );
    });
  });

  // ===========================================
  // getSpace
  // ===========================================

  describe('getSpace', () => {
    it('should return a space by ID', async () => {
      prisma.space.findUnique.mockResolvedValue({ ...mockSpace, blocks: [] });

      const result = await service.getSpace('space-1');

      expect(result.id).toBe('space-1');
      expect(result.name).toBe('Churrasqueira 1');
    });

    it('should throw NotFoundException for non-existent space', async () => {
      prisma.space.findUnique.mockResolvedValue(null);

      await expect(service.getSpace('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // createSpace
  // ===========================================

  describe('createSpace', () => {
    const createDto = {
      name: 'Salão de Festas',
      description: 'Salão para eventos com capacidade para 100 pessoas',
      capacity: 100,
      periodType: BookingPeriodType.DAY,
    };

    it('should create a new space', async () => {
      prisma.space.create.mockResolvedValue({
        id: 'space-new',
        associationId: 'assoc-1',
        ...createDto,
        images: [],
        mainImageUrl: null,
        fee: new Decimal(0),
        minAdvanceDays: 1,
        maxAdvanceDays: 60,
        bookingIntervalMonths: 0,
        blockedSpaceIds: [],
        status: SpaceStatus.ACTIVE,
      });

      const result = await service.createSpace('assoc-1', createDto as any);

      expect(result.id).toBe('space-new');
      expect(result.name).toBe('Salão de Festas');
      expect(prisma.space.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for SHIFT period without shifts', async () => {
      const invalidDto = {
        ...createDto,
        periodType: BookingPeriodType.SHIFT,
      };

      await expect(service.createSpace('assoc-1', invalidDto as any))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for HOUR period without times', async () => {
      const invalidDto = {
        ...createDto,
        periodType: BookingPeriodType.HOUR,
      };

      await expect(service.createSpace('assoc-1', invalidDto as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // updateSpace
  // ===========================================

  describe('updateSpace', () => {
    it('should update a space', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.space.update.mockResolvedValue({
        ...mockSpace,
        name: 'Churrasqueira 1 - Atualizada',
      });

      const result = await service.updateSpace('space-1', 'assoc-1', { name: 'Churrasqueira 1 - Atualizada' });

      expect(result.name).toBe('Churrasqueira 1 - Atualizada');
    });

    it('should throw NotFoundException for non-existent space', async () => {
      prisma.space.findUnique.mockResolvedValue(null);

      await expect(service.updateSpace('non-existent', 'assoc-1', { name: 'Test' }))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for wrong association', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);

      await expect(service.updateSpace('space-1', 'wrong-assoc', { name: 'Test' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // updateStatus
  // ===========================================

  describe('updateStatus', () => {
    it('should update space status', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.space.update.mockResolvedValue({
        ...mockSpace,
        status: SpaceStatus.MAINTENANCE,
      });

      const result = await service.updateStatus('space-1', 'assoc-1', { status: SpaceStatus.MAINTENANCE });

      expect(result.status).toBe(SpaceStatus.MAINTENANCE);
    });
  });

  // ===========================================
  // deleteSpace
  // ===========================================

  describe('deleteSpace', () => {
    it('should soft delete a space', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.space.update.mockResolvedValue({
        ...mockSpace,
        deletedAt: new Date(),
        status: SpaceStatus.INACTIVE,
      });

      const result = await service.deleteSpace('space-1', 'assoc-1');

      expect(result.success).toBe(true);
      expect(prisma.space.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deletedAt: expect.any(Date),
            status: SpaceStatus.INACTIVE,
          }),
        }),
      );
    });
  });

  // ===========================================
  // createBlock
  // ===========================================

  describe('createBlock', () => {
    const blockDto = {
      date: '2026-04-15',
      reason: 'Manutenção',
    };

    it('should create a block', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.spaceBlock.findUnique.mockResolvedValue(null);
      prisma.spaceBlock.create.mockResolvedValue({
        id: 'block-new',
        ...blockDto,
        spaceId: 'space-1',
        createdById: 'user-1',
      });

      const result = await service.createBlock('space-1', 'assoc-1', 'user-1', blockDto);

      expect(result.id).toBe('block-new');
    });

    it('should throw BadRequestException for past dates', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);

      await expect(service.createBlock('space-1', 'assoc-1', 'user-1', { date: '2020-01-01' }))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for already blocked date', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.spaceBlock.findUnique.mockResolvedValue(mockBlock);

      await expect(service.createBlock('space-1', 'assoc-1', 'user-1', blockDto))
        .rejects.toThrow(ConflictException);
    });
  });

  // ===========================================
  // removeBlock
  // ===========================================

  describe('removeBlock', () => {
    it('should remove a block', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.spaceBlock.findUnique.mockResolvedValue(mockBlock);
      prisma.spaceBlock.delete.mockResolvedValue(mockBlock);

      const result = await service.removeBlock('space-1', 'block-1', 'assoc-1');

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException for non-existent block', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.spaceBlock.findUnique.mockResolvedValue(null);

      await expect(service.removeBlock('space-1', 'non-existent', 'assoc-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // getAvailability
  // ===========================================

  describe('getAvailability', () => {
    it('should return availability for a date range', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.spaceBlock.findMany.mockResolvedValue([]);
      prisma.booking.findMany.mockResolvedValue([]);

      const result = await service.getAvailability('space-1', {
        startDate: '2026-03-01',
        endDate: '2026-03-07',
      });

      expect(result.spaceId).toBe('space-1');
      expect(result.availability).toBeDefined();
      expect(result.availability.length).toBeGreaterThan(0);
    });

    it('should mark blocked dates as unavailable', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.spaceBlock.findMany.mockResolvedValue([
        { date: new Date('2026-03-15') },
      ]);
      prisma.booking.findMany.mockResolvedValue([]);

      const result = await service.getAvailability('space-1', {
        startDate: '2026-03-15',
        endDate: '2026-03-15',
      });

      const march15 = result.availability.find(a => a.date === '2026-03-15');
      expect(march15?.available).toBe(false);
      expect(march15?.reason).toBe('blocked');
    });
  });

  // ===========================================
  // canUserBook
  // ===========================================

  describe('canUserBook', () => {
    it('should return true if no interval restriction', async () => {
      prisma.space.findUnique.mockResolvedValue({
        ...mockSpace,
        bookingIntervalMonths: 0,
      });

      const result = await service.canUserBook('space-1', 'user-1');

      expect(result.canBook).toBe(true);
    });

    it('should return true if user has no previous bookings', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.booking.findFirst.mockResolvedValue(null);

      const result = await service.canUserBook('space-1', 'user-1');

      expect(result.canBook).toBe(true);
    });

    it('should return false with next available date if within interval', async () => {
      const recentBookingDate = new Date();
      recentBookingDate.setDate(recentBookingDate.getDate() - 15); // 15 days ago

      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.booking.findFirst.mockResolvedValue({
        date: recentBookingDate,
        status: BookingStatus.APPROVED,
      });

      const result = await service.canUserBook('space-1', 'user-1');

      expect(result.canBook).toBe(false);
      expect(result.nextAvailableDate).toBeDefined();
    });
  });
});
