import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SpacesService } from '../spaces/spaces.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BookingStatus, BookingPeriodType, SpaceStatus, NotificationType, NotificationCategory } from '@prisma/client';
import {
  CreateBookingDto,
  RejectBookingDto,
  CancelBookingDto,
  JoinWaitlistDto,
  BookingQueryDto,
  AdminBookingQueryDto,
  MyBookingsQueryDto,
} from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly spacesService: SpacesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ===========================================
  // USER METHODS
  // ===========================================

  /**
   * Create a new booking request
   */
  async createBooking(userId: string, dto: CreateBookingDto) {
    // 1. Validate space exists and is active
    const space = await this.prisma.space.findUnique({
      where: { id: dto.spaceId, deletedAt: null },
    });

    if (!space) {
      throw new NotFoundException('Espaço não encontrado');
    }

    if (space.status !== SpaceStatus.ACTIVE) {
      throw new BadRequestException('Espaço não está disponível para reservas');
    }

    // 2. Validate period type matches space
    if (dto.periodType !== space.periodType) {
      throw new BadRequestException(`Este espaço opera por ${space.periodType}`);
    }

    // 3. Validate date
    const bookingDate = new Date(dto.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysAhead = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysAhead < space.minAdvanceDays) {
      throw new BadRequestException(`Reservas devem ser feitas com pelo menos ${space.minAdvanceDays} dias de antecedência`);
    }

    if (daysAhead > space.maxAdvanceDays) {
      throw new BadRequestException(`Reservas só podem ser feitas com até ${space.maxAdvanceDays} dias de antecedência`);
    }

    // 4. Check interval restriction
    const canBook = await this.spacesService.canUserBook(dto.spaceId, userId);
    if (!canBook.canBook) {
      throw new BadRequestException(
        `Você poderá reservar este espaço novamente a partir de ${canBook.nextAvailableDate?.toLocaleDateString('pt-BR')}`
      );
    }

    // 5. Check if date is blocked
    const isBlocked = await this.prisma.spaceBlock.findFirst({
      where: {
        spaceId: dto.spaceId,
        date: bookingDate,
      },
    });

    if (isBlocked) {
      throw new BadRequestException('Esta data está bloqueada');
    }

    // 6. Check for existing bookings (pending or approved)
    const existingBooking = await this.findConflictingBooking(dto);

    if (existingBooking) {
      throw new ConflictException('Já existe uma reserva para este período');
    }

    // 7. Validate shift/hour specific fields
    this.validateBookingPeriod(dto, space);

    // 8. Calculate fee with potential subscription discount
    const { totalFee, discountApplied, finalFee } = await this.calculateFee(userId, space);

    // 9. Create booking
    const booking = await this.prisma.booking.create({
      data: {
        spaceId: dto.spaceId,
        userId,
        date: bookingDate,
        periodType: dto.periodType,
        shiftName: dto.shiftName,
        shiftStart: this.getShiftTime(space, dto.shiftName, 'start'),
        shiftEnd: this.getShiftTime(space, dto.shiftName, 'end'),
        startTime: dto.startTime,
        endTime: dto.endTime,
        totalFee,
        discountApplied,
        finalFee,
        status: BookingStatus.PENDING,
      },
      include: {
        space: { select: { name: true } },
      },
    });

    this.logger.log(`Booking created: ${booking.id} by user ${userId}`);

    // 10. Notify managers/admins about new booking request
    // TODO: Notify managers/admins

    return this.formatBooking(booking);
  }

  /**
   * Get user's bookings
   */
  async getMyBookings(userId: string, query: MyBookingsQueryDto) {
    const { tab = 'pending', page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    let statusFilter: BookingStatus[];
    let orderBy: any = { date: 'asc' };

    switch (tab) {
      case 'pending':
        statusFilter = [BookingStatus.PENDING];
        break;
      case 'approved':
        statusFilter = [BookingStatus.APPROVED];
        break;
      case 'history':
        statusFilter = [
          BookingStatus.COMPLETED,
          BookingStatus.CANCELLED,
          BookingStatus.REJECTED,
          BookingStatus.EXPIRED,
        ];
        orderBy = { date: 'desc' };
        break;
      default:
        statusFilter = [BookingStatus.PENDING];
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          userId,
          status: { in: statusFilter },
        },
        include: {
          space: { select: { id: true, name: true, mainImageUrl: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.booking.count({
        where: {
          userId,
          status: { in: statusFilter },
        },
      }),
    ]);

    return {
      data: bookings.map(this.formatBooking),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId: string, userId: string, isAdmin: boolean = false) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        space: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Reserva não encontrada');
    }

    // Users can only see their own bookings
    if (!isAdmin && booking.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.formatBooking(booking);
  }

  /**
   * Cancel a booking (by user)
   */
  async cancelBooking(bookingId: string, userId: string, dto: CancelBookingDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { space: true },
    });

    if (!booking) {
      throw new NotFoundException('Reserva não encontrada');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.APPROVED) {
      throw new BadRequestException('Esta reserva não pode ser cancelada');
    }

    // Check cancellation deadline for approved bookings (24h default)
    if (booking.status === BookingStatus.APPROVED) {
      const hoursUntilBooking = (booking.date.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilBooking < 24) {
        throw new BadRequestException('Reservas aprovadas só podem ser canceladas com 24h de antecedência');
      }
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledById: userId,
        cancelledAt: new Date(),
        cancellationReason: dto.reason,
      },
      include: { space: true },
    });

    this.logger.log(`Booking cancelled: ${bookingId} by user ${userId}`);

    // Process waitlist
    await this.processWaitlist(booking.spaceId, booking.date, booking.periodType, booking.shiftName, booking.startTime);

    return this.formatBooking(updatedBooking);
  }

  // ===========================================
  // WAITLIST METHODS
  // ===========================================

  /**
   * Join waitlist for a booking slot
   */
  async joinWaitlist(userId: string, dto: JoinWaitlistDto) {
    // Check if there's actually a booking for this slot
    const existingBooking = await this.findConflictingBooking(dto as CreateBookingDto);

    if (!existingBooking) {
      throw new BadRequestException('Não há reserva para este período. Você pode reservar diretamente.');
    }

    // Check if user is already in waitlist
    const existingEntry = await this.prisma.bookingWaitlist.findFirst({
      where: {
        spaceId: dto.spaceId,
        date: new Date(dto.date),
        periodType: dto.periodType,
        shiftName: dto.shiftName || null,
        startTime: dto.startTime || null,
        userId,
      },
    });

    if (existingEntry) {
      throw new ConflictException('Você já está na fila de espera para este período');
    }

    // Get current max position
    const maxPosition = await this.prisma.bookingWaitlist.aggregate({
      where: {
        spaceId: dto.spaceId,
        date: new Date(dto.date),
        periodType: dto.periodType,
        shiftName: dto.shiftName || null,
        startTime: dto.startTime || null,
      },
      _max: { position: true },
    });

    const entry = await this.prisma.bookingWaitlist.create({
      data: {
        spaceId: dto.spaceId,
        bookingId: existingBooking.id,
        userId,
        date: new Date(dto.date),
        periodType: dto.periodType,
        shiftName: dto.shiftName,
        startTime: dto.startTime,
        endTime: dto.endTime,
        position: (maxPosition._max.position || 0) + 1,
      },
    });

    this.logger.log(`User ${userId} joined waitlist for space ${dto.spaceId} on ${dto.date}`);

    return {
      id: entry.id,
      position: entry.position,
      spaceId: entry.spaceId,
      date: entry.date,
    };
  }

  /**
   * Leave waitlist
   */
  async leaveWaitlist(entryId: string, userId: string) {
    const entry = await this.prisma.bookingWaitlist.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Entrada na fila não encontrada');
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    await this.prisma.bookingWaitlist.delete({
      where: { id: entryId },
    });

    // Reorder positions
    await this.reorderWaitlist(entry.spaceId, entry.date, entry.periodType, entry.shiftName, entry.startTime);

    this.logger.log(`User ${userId} left waitlist entry ${entryId}`);

    return { success: true };
  }

  /**
   * Get user's position in waitlist
   */
  async getWaitlistPosition(userId: string) {
    const entries = await this.prisma.bookingWaitlist.findMany({
      where: { userId },
      include: {
        booking: {
          include: {
            space: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return entries.map(entry => ({
      id: entry.id,
      position: entry.position,
      spaceId: entry.spaceId,
      spaceName: entry.booking?.space?.name,
      date: entry.date,
      periodType: entry.periodType,
      shiftName: entry.shiftName,
      startTime: entry.startTime,
      endTime: entry.endTime,
      notifiedAt: entry.notifiedAt,
      expiresAt: entry.expiresAt,
    }));
  }

  /**
   * Confirm or decline waitlist slot
   */
  async confirmWaitlistSlot(entryId: string, userId: string, accept: boolean) {
    const entry = await this.prisma.bookingWaitlist.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Entrada na fila não encontrada');
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    if (!entry.notifiedAt) {
      throw new BadRequestException('Você ainda não foi notificado sobre uma vaga');
    }

    if (entry.expiresAt && new Date() > entry.expiresAt) {
      throw new BadRequestException('O prazo para confirmar expirou');
    }

    if (accept) {
      // Create booking
      const booking = await this.createBooking(userId, {
        spaceId: entry.spaceId,
        date: entry.date.toISOString().split('T')[0],
        periodType: entry.periodType,
        shiftName: entry.shiftName || undefined,
        startTime: entry.startTime || undefined,
        endTime: entry.endTime || undefined,
      });

      // Remove from waitlist
      await this.prisma.bookingWaitlist.delete({
        where: { id: entryId },
      });

      return booking;
    } else {
      // Decline - remove and notify next
      await this.prisma.bookingWaitlist.delete({
        where: { id: entryId },
      });

      // Notify next in line
      await this.processWaitlist(
        entry.spaceId,
        entry.date,
        entry.periodType,
        entry.shiftName,
        entry.startTime
      );

      return { success: true, message: 'Vaga recusada' };
    }
  }

  // ===========================================
  // ADMIN/MANAGER METHODS
  // ===========================================

  /**
   * List all bookings (admin)
   */
  async listBookings(associationId: string, query: AdminBookingQueryDto) {
    const { status, spaceId, userId, startDate, endDate, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      space: { associationId },
    };

    if (status) where.status = status;
    if (spaceId) where.spaceId = spaceId;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          space: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    // Get user info separately to include name
    const userIds = [...new Set(bookings.map(b => b.userId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    return {
      data: bookings.map(booking => ({
        ...this.formatBooking(booking),
        user: userMap.get(booking.userId),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get pending bookings (admin)
   */
  async getPendingBookings(associationId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        space: { associationId },
        status: BookingStatus.PENDING,
      },
      include: {
        space: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const userIds = [...new Set(bookings.map(b => b.userId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    return bookings.map(booking => ({
      ...this.formatBooking(booking),
      user: userMap.get(booking.userId),
    }));
  }

  /**
   * Approve a booking (admin/manager)
   */
  async approveBooking(bookingId: string, adminId: string, associationId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { space: true },
    });

    if (!booking) {
      throw new NotFoundException('Reserva não encontrada');
    }

    if (booking.space.associationId !== associationId) {
      throw new ForbiddenException('Acesso negado');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Apenas reservas pendentes podem ser aprovadas');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.APPROVED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
      include: { space: true },
    });

    this.logger.log(`Booking approved: ${bookingId} by ${adminId}`);

    // Notify user
    await this.notificationsService.create({
      userId: booking.userId,
      type: NotificationType.RESERVATION_APPROVED,
      category: NotificationCategory.RESERVATIONS,
      title: 'Reserva aprovada!',
      body: `Sua reserva do espaço "${booking.space.name}" para ${booking.date.toLocaleDateString('pt-BR')} foi aprovada.`,
      data: { bookingId: booking.id, spaceId: booking.spaceId },
    });

    return this.formatBooking(updatedBooking);
  }

  /**
   * Reject a booking (admin/manager)
   */
  async rejectBooking(bookingId: string, adminId: string, associationId: string, dto: RejectBookingDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { space: true },
    });

    if (!booking) {
      throw new NotFoundException('Reserva não encontrada');
    }

    if (booking.space.associationId !== associationId) {
      throw new ForbiddenException('Acesso negado');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Apenas reservas pendentes podem ser rejeitadas');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.REJECTED,
        rejectedById: adminId,
        rejectedAt: new Date(),
        rejectionReason: dto.reason,
      },
      include: { space: true },
    });

    this.logger.log(`Booking rejected: ${bookingId} by ${adminId}`);

    // Notify user
    await this.notificationsService.create({
      userId: booking.userId,
      type: NotificationType.RESERVATION_REJECTED,
      category: NotificationCategory.RESERVATIONS,
      title: 'Reserva recusada',
      body: `Sua reserva do espaço "${booking.space.name}" para ${booking.date.toLocaleDateString('pt-BR')} foi recusada.${dto.reason ? ` Motivo: ${dto.reason}` : ''}`,
      data: { bookingId: booking.id, spaceId: booking.spaceId },
    });

    // Process waitlist
    await this.processWaitlist(booking.spaceId, booking.date, booking.periodType, booking.shiftName, booking.startTime);

    return this.formatBooking(updatedBooking);
  }

  /**
   * Admin cancel a booking
   */
  async adminCancelBooking(bookingId: string, adminId: string, associationId: string, dto: CancelBookingDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { space: true },
    });

    if (!booking) {
      throw new NotFoundException('Reserva não encontrada');
    }

    if (booking.space.associationId !== associationId) {
      throw new ForbiddenException('Acesso negado');
    }

    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.APPROVED) {
      throw new BadRequestException('Esta reserva não pode ser cancelada');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledById: adminId,
        cancelledAt: new Date(),
        cancellationReason: dto.reason,
      },
      include: { space: true },
    });

    this.logger.log(`Booking cancelled by admin: ${bookingId} by ${adminId}`);

    // Notify user
    await this.notificationsService.create({
      userId: booking.userId,
      type: NotificationType.RESERVATION_REJECTED, // Using same type for cancellation
      category: NotificationCategory.RESERVATIONS,
      title: 'Reserva cancelada',
      body: `Sua reserva do espaço "${booking.space.name}" para ${booking.date.toLocaleDateString('pt-BR')} foi cancelada pelo administrador.${dto.reason ? ` Motivo: ${dto.reason}` : ''}`,
      data: { bookingId: booking.id, spaceId: booking.spaceId },
    });

    // Process waitlist
    await this.processWaitlist(booking.spaceId, booking.date, booking.periodType, booking.shiftName, booking.startTime);

    return this.formatBooking(updatedBooking);
  }

  // ===========================================
  // SCHEDULED JOBS (called by scheduler)
  // ===========================================

  /**
   * Expire pending bookings that passed the date
   */
  async expirePendingBookings() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expired = await this.prisma.booking.updateMany({
      where: {
        status: BookingStatus.PENDING,
        date: { lt: today },
      },
      data: {
        status: BookingStatus.EXPIRED,
        expiredAt: new Date(),
      },
    });

    if (expired.count > 0) {
      this.logger.log(`Expired ${expired.count} pending bookings`);
    }

    return expired.count;
  }

  /**
   * Complete bookings that have passed their date
   */
  async completePassedBookings() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completed = await this.prisma.booking.updateMany({
      where: {
        status: BookingStatus.APPROVED,
        date: { lt: today },
      },
      data: {
        status: BookingStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    if (completed.count > 0) {
      this.logger.log(`Completed ${completed.count} bookings`);
    }

    return completed.count;
  }

  /**
   * Expire waitlist entries that didn't respond
   */
  async expireWaitlistEntries() {
    const now = new Date();

    // Find entries that were notified and expired
    const expiredEntries = await this.prisma.bookingWaitlist.findMany({
      where: {
        notifiedAt: { not: null },
        expiresAt: { lt: now },
        respondedAt: null,
      },
    });

    for (const entry of expiredEntries) {
      await this.prisma.bookingWaitlist.delete({
        where: { id: entry.id },
      });

      // Notify next in line
      await this.processWaitlist(
        entry.spaceId,
        entry.date,
        entry.periodType,
        entry.shiftName,
        entry.startTime
      );
    }

    if (expiredEntries.length > 0) {
      this.logger.log(`Expired ${expiredEntries.length} waitlist entries`);
    }

    return expiredEntries.length;
  }

  // ===========================================
  // HELPER METHODS
  // ===========================================

  private async findConflictingBooking(dto: CreateBookingDto | JoinWaitlistDto) {
    const where: any = {
      spaceId: dto.spaceId,
      date: new Date(dto.date),
      status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
    };

    if (dto.periodType === BookingPeriodType.SHIFT && dto.shiftName) {
      where.shiftName = dto.shiftName;
    }

    if (dto.periodType === BookingPeriodType.HOUR && dto.startTime) {
      // For hour-based bookings, check for overlapping times
      // This is a simplified check - in production you'd want more complex overlap logic
      where.OR = [
        { startTime: { lte: dto.startTime }, endTime: { gt: dto.startTime } },
        { startTime: { lt: dto.endTime }, endTime: { gte: dto.endTime } },
        { startTime: { gte: dto.startTime }, endTime: { lte: dto.endTime } },
      ];
    }

    return this.prisma.booking.findFirst({ where });
  }

  private validateBookingPeriod(dto: CreateBookingDto, space: any) {
    if (dto.periodType === BookingPeriodType.SHIFT) {
      if (!dto.shiftName) {
        throw new BadRequestException('Turno é obrigatório para reservas por turno');
      }
      const shifts = space.shifts as any[] || [];
      if (!shifts.find(s => s.name === dto.shiftName)) {
        throw new BadRequestException('Turno inválido');
      }
    }

    if (dto.periodType === BookingPeriodType.HOUR) {
      if (!dto.startTime || !dto.endTime) {
        throw new BadRequestException('Horário de início e fim são obrigatórios para reservas por hora');
      }
      // TODO: Validate time is within space opening hours
      // TODO: Validate minimum duration
    }
  }

  private getShiftTime(space: any, shiftName: string | undefined, type: 'start' | 'end'): string | null {
    if (!shiftName) return null;
    const shifts = space.shifts as any[] || [];
    const shift = shifts.find(s => s.name === shiftName);
    return shift ? (type === 'start' ? shift.startTime : shift.endTime) : null;
  }

  private async calculateFee(userId: string, space: any): Promise<{
    totalFee: Decimal | null;
    discountApplied: Decimal | null;
    finalFee: Decimal | null;
  }> {
    if (!space.fee || Number(space.fee) === 0) {
      return { totalFee: null, discountApplied: null, finalFee: null };
    }

    const totalFee = new Decimal(space.fee);

    // Check for subscription discount
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (subscription?.status === 'ACTIVE' && subscription.plan) {
      const mutators = subscription.plan.mutators as any || {};
      const discountPercent = mutators.discount_spaces || subscription.plan.spaceDiscount || 0;

      if (discountPercent > 0) {
        const discount = totalFee.mul(discountPercent).div(100);
        const finalFee = totalFee.sub(discount);
        return {
          totalFee,
          discountApplied: new Decimal(discountPercent),
          finalFee,
        };
      }
    }

    return { totalFee, discountApplied: null, finalFee: totalFee };
  }

  private async processWaitlist(
    spaceId: string,
    date: Date,
    periodType: BookingPeriodType,
    shiftName: string | null,
    startTime: string | null
  ) {
    // Find next person in waitlist
    const nextEntry = await this.prisma.bookingWaitlist.findFirst({
      where: {
        spaceId,
        date,
        periodType,
        shiftName: shiftName || null,
        startTime: startTime || null,
        notifiedAt: null,
      },
      orderBy: { position: 'asc' },
    });

    if (!nextEntry) return;

    // Update entry with notification time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.prisma.bookingWaitlist.update({
      where: { id: nextEntry.id },
      data: {
        notifiedAt: new Date(),
        expiresAt,
      },
    });

    // Get space name for notification
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      select: { name: true },
    });

    // Send notification
    await this.notificationsService.create({
      userId: nextEntry.userId,
      type: NotificationType.WAITLIST_AVAILABLE,
      category: NotificationCategory.RESERVATIONS,
      title: 'Uma vaga foi liberada!',
      body: `Uma vaga para "${space?.name}" em ${date.toLocaleDateString('pt-BR')} foi liberada. Você tem 24h para confirmar.`,
      data: {
        waitlistEntryId: nextEntry.id,
        spaceId,
        date: date.toISOString(),
      },
    });

    this.logger.log(`Notified user ${nextEntry.userId} about available slot`);
  }

  private async reorderWaitlist(
    spaceId: string,
    date: Date,
    periodType: BookingPeriodType,
    shiftName: string | null,
    startTime: string | null
  ) {
    const entries = await this.prisma.bookingWaitlist.findMany({
      where: {
        spaceId,
        date,
        periodType,
        shiftName: shiftName || null,
        startTime: startTime || null,
      },
      orderBy: { position: 'asc' },
    });

    for (let i = 0; i < entries.length; i++) {
      if (entries[i].position !== i + 1) {
        await this.prisma.bookingWaitlist.update({
          where: { id: entries[i].id },
          data: { position: i + 1 },
        });
      }
    }
  }

  private formatBooking(booking: any) {
    return {
      id: booking.id,
      spaceId: booking.spaceId,
      space: booking.space,
      userId: booking.userId,
      date: booking.date,
      periodType: booking.periodType,
      shiftName: booking.shiftName,
      shiftStart: booking.shiftStart,
      shiftEnd: booking.shiftEnd,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalFee: booking.totalFee ? Number(booking.totalFee) : null,
      discountApplied: booking.discountApplied ? Number(booking.discountApplied) : null,
      finalFee: booking.finalFee ? Number(booking.finalFee) : null,
      status: booking.status,
      approvedAt: booking.approvedAt,
      rejectedAt: booking.rejectedAt,
      rejectionReason: booking.rejectionReason,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
