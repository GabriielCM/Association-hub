import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BookingsService } from '../bookings.service';
import { NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { BookingStatus, BookingPeriodType, SpaceStatus, NotificationType, NotificationCategory } from '@prisma/client';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: any;
  let spacesService: any;
  let notificationsService: any;

  const mockSpace = {
    id: 'space-1',
    associationId: 'assoc-1',
    name: 'Churrasqueira 1',
    description: 'Churrasqueira coberta',
    capacity: 30,
    fee: new Decimal(150),
    periodType: BookingPeriodType.DAY,
    shifts: [],
    minAdvanceDays: 2,
    maxAdvanceDays: 60,
    bookingIntervalMonths: 0,
    status: SpaceStatus.ACTIVE,
    deletedAt: null,
  };

  const mockBooking = {
    id: 'booking-1',
    spaceId: 'space-1',
    userId: 'user-1',
    date: new Date('2026-04-15'),
    periodType: BookingPeriodType.DAY,
    shiftName: null,
    startTime: null,
    endTime: null,
    totalFee: new Decimal(150),
    discountApplied: null,
    finalFee: new Decimal(150),
    status: BookingStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    space: mockSpace,
  };

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  beforeEach(() => {
    prisma = {
      space: {
        findUnique: vi.fn(),
      },
      spaceBlock: {
        findFirst: vi.fn(),
      },
      booking: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        count: vi.fn(),
      },
      bookingWaitlist: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
        aggregate: vi.fn(),
      },
      userSubscription: {
        findUnique: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
    };

    spacesService = {
      canUserBook: vi.fn().mockResolvedValue({ canBook: true }),
    };

    notificationsService = {
      create: vi.fn().mockResolvedValue({}),
    };

    service = new BookingsService(prisma, spacesService, notificationsService);
  });

  // ===========================================
  // createBooking
  // ===========================================

  describe('createBooking', () => {
    const createDto = {
      spaceId: 'space-1',
      date: futureDateStr,
      periodType: BookingPeriodType.DAY,
    };

    it('should create a booking successfully', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.spaceBlock.findFirst.mockResolvedValue(null);
      prisma.booking.findFirst.mockResolvedValue(null);
      prisma.userSubscription.findUnique.mockResolvedValue(null);
      prisma.booking.create.mockResolvedValue({
        ...mockBooking,
        date: new Date(futureDateStr),
      });

      const result = await service.createBooking('user-1', createDto);

      expect(result.id).toBe('booking-1');
      expect(result.status).toBe(BookingStatus.PENDING);
      expect(prisma.booking.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent space', async () => {
      prisma.space.findUnique.mockResolvedValue(null);

      await expect(service.createBooking('user-1', createDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for inactive space', async () => {
      prisma.space.findUnique.mockResolvedValue({
        ...mockSpace,
        status: SpaceStatus.MAINTENANCE,
      });

      await expect(service.createBooking('user-1', createDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for wrong period type', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);

      await expect(service.createBooking('user-1', {
        ...createDto,
        periodType: BookingPeriodType.SHIFT,
      }))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for blocked date', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.spaceBlock.findFirst.mockResolvedValue({ id: 'block-1' });

      await expect(service.createBooking('user-1', createDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for existing booking', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.spaceBlock.findFirst.mockResolvedValue(null);
      prisma.booking.findFirst.mockResolvedValue(mockBooking);

      await expect(service.createBooking('user-1', createDto))
        .rejects.toThrow(ConflictException);
    });

    it('should apply subscription discount', async () => {
      prisma.space.findUnique.mockResolvedValue(mockSpace);
      prisma.spaceBlock.findFirst.mockResolvedValue(null);
      prisma.booking.findFirst.mockResolvedValue(null);
      prisma.userSubscription.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        plan: {
          mutators: { discount_spaces: 15 },
          spaceDiscount: 15,
        },
      });
      prisma.booking.create.mockResolvedValue({
        ...mockBooking,
        discountApplied: new Decimal(15),
        finalFee: new Decimal(127.5),
      });

      const result = await service.createBooking('user-1', createDto);

      expect(result.discountApplied).toBe(15);
      expect(result.finalFee).toBe(127.5);
    });
  });

  // ===========================================
  // getMyBookings
  // ===========================================

  describe('getMyBookings', () => {
    it('should return pending bookings', async () => {
      prisma.booking.findMany.mockResolvedValue([mockBooking]);
      prisma.booking.count.mockResolvedValue(1);

      const result = await service.getMyBookings('user-1', { tab: 'pending' });

      expect(result.data).toHaveLength(1);
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 'user-1',
            status: { in: [BookingStatus.PENDING] },
          },
        }),
      );
    });

    it('should return approved bookings', async () => {
      prisma.booking.findMany.mockResolvedValue([{ ...mockBooking, status: BookingStatus.APPROVED }]);
      prisma.booking.count.mockResolvedValue(1);

      const result = await service.getMyBookings('user-1', { tab: 'approved' });

      expect(result.data).toHaveLength(1);
    });

    it('should return history bookings', async () => {
      prisma.booking.findMany.mockResolvedValue([{ ...mockBooking, status: BookingStatus.COMPLETED }]);
      prisma.booking.count.mockResolvedValue(1);

      const result = await service.getMyBookings('user-1', { tab: 'history' });

      expect(result.data).toHaveLength(1);
    });
  });

  // ===========================================
  // getBooking
  // ===========================================

  describe('getBooking', () => {
    it('should return booking for owner', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.getBooking('booking-1', 'user-1');

      expect(result.id).toBe('booking-1');
    });

    it('should throw NotFoundException for non-existent booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.getBooking('non-existent', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for wrong user', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      await expect(service.getBooking('booking-1', 'other-user'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to view any booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      const result = await service.getBooking('booking-1', 'other-user', true);

      expect(result.id).toBe('booking-1');
    });
  });

  // ===========================================
  // cancelBooking
  // ===========================================

  describe('cancelBooking', () => {
    it('should cancel a pending booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);
      prisma.booking.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });
      prisma.bookingWaitlist.findFirst.mockResolvedValue(null);

      const result = await service.cancelBooking('booking-1', 'user-1', {});

      expect(result.status).toBe(BookingStatus.CANCELLED);
    });

    it('should throw ForbiddenException for wrong user', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      await expect(service.cancelBooking('booking-1', 'other-user', {}))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for completed booking', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.COMPLETED,
      });

      await expect(service.cancelBooking('booking-1', 'user-1', {}))
        .rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // approveBooking
  // ===========================================

  describe('approveBooking', () => {
    it('should approve a pending booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);
      prisma.booking.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.APPROVED,
        approvedById: 'admin-1',
        approvedAt: new Date(),
      });

      const result = await service.approveBooking('booking-1', 'admin-1', 'assoc-1');

      expect(result.status).toBe(BookingStatus.APPROVED);
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: NotificationType.RESERVATION_APPROVED,
        }),
      );
    });

    it('should throw ForbiddenException for wrong association', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);

      await expect(service.approveBooking('booking-1', 'admin-1', 'wrong-assoc'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for non-pending booking', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.APPROVED,
      });

      await expect(service.approveBooking('booking-1', 'admin-1', 'assoc-1'))
        .rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // rejectBooking
  // ===========================================

  describe('rejectBooking', () => {
    it('should reject a pending booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(mockBooking);
      prisma.booking.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.REJECTED,
        rejectedById: 'admin-1',
        rejectionReason: 'Conflito com evento',
      });
      prisma.bookingWaitlist.findFirst.mockResolvedValue(null);

      const result = await service.rejectBooking('booking-1', 'admin-1', 'assoc-1', {
        reason: 'Conflito com evento',
      });

      expect(result.status).toBe(BookingStatus.REJECTED);
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.RESERVATION_REJECTED,
        }),
      );
    });
  });

  // ===========================================
  // joinWaitlist
  // ===========================================

  describe('joinWaitlist', () => {
    const waitlistDto = {
      spaceId: 'space-1',
      date: futureDateStr,
      periodType: BookingPeriodType.DAY,
    };

    it('should add user to waitlist', async () => {
      prisma.booking.findFirst.mockResolvedValue(mockBooking);
      prisma.bookingWaitlist.findFirst.mockResolvedValue(null);
      prisma.bookingWaitlist.aggregate.mockResolvedValue({ _max: { position: 0 } });
      prisma.bookingWaitlist.create.mockResolvedValue({
        id: 'waitlist-1',
        userId: 'user-2',
        position: 1,
        spaceId: 'space-1',
        date: new Date(futureDateStr),
      });

      const result = await service.joinWaitlist('user-2', waitlistDto);

      expect(result.position).toBe(1);
    });

    it('should throw BadRequestException if no existing booking', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      await expect(service.joinWaitlist('user-2', waitlistDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if already in waitlist', async () => {
      prisma.booking.findFirst.mockResolvedValue(mockBooking);
      prisma.bookingWaitlist.findFirst.mockResolvedValue({ id: 'existing-entry' });

      await expect(service.joinWaitlist('user-2', waitlistDto))
        .rejects.toThrow(ConflictException);
    });
  });

  // ===========================================
  // leaveWaitlist
  // ===========================================

  describe('leaveWaitlist', () => {
    const waitlistEntry = {
      id: 'waitlist-1',
      userId: 'user-1',
      spaceId: 'space-1',
      date: new Date(),
      periodType: BookingPeriodType.DAY,
      shiftName: null,
      startTime: null,
      position: 1,
    };

    it('should remove user from waitlist', async () => {
      prisma.bookingWaitlist.findUnique.mockResolvedValue(waitlistEntry);
      prisma.bookingWaitlist.delete.mockResolvedValue(waitlistEntry);
      prisma.bookingWaitlist.findMany.mockResolvedValue([]);

      const result = await service.leaveWaitlist('waitlist-1', 'user-1');

      expect(result.success).toBe(true);
    });

    it('should throw ForbiddenException for wrong user', async () => {
      prisma.bookingWaitlist.findUnique.mockResolvedValue(waitlistEntry);

      await expect(service.leaveWaitlist('waitlist-1', 'other-user'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  // ===========================================
  // Scheduled Jobs
  // ===========================================

  describe('expirePendingBookings', () => {
    it('should expire pending bookings past their date', async () => {
      prisma.booking.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.expirePendingBookings();

      expect(result).toBe(3);
      expect(prisma.booking.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: BookingStatus.PENDING,
            date: { lt: expect.any(Date) },
          },
          data: {
            status: BookingStatus.EXPIRED,
            expiredAt: expect.any(Date),
          },
        }),
      );
    });
  });

  describe('completePassedBookings', () => {
    it('should complete approved bookings past their date', async () => {
      prisma.booking.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.completePassedBookings();

      expect(result).toBe(5);
    });
  });
});
