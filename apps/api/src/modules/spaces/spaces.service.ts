import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SpaceStatus, BookingPeriodType, BookingStatus, Prisma } from '@prisma/client';
import {
  CreateSpaceDto,
  UpdateSpaceDto,
  UpdateSpaceStatusDto,
  CreateSpaceBlockDto,
  CreateSpaceBlockBulkDto,
  SpaceQueryDto,
  SpaceAvailabilityQueryDto,
} from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SpacesService {
  private readonly logger = new Logger(SpacesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ===========================================
  // PUBLIC METHODS (User facing)
  // ===========================================

  /**
   * List active spaces for users
   */
  async listSpaces(associationId: string, query: SpaceQueryDto) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    // Users only see active spaces (unless they're managers/admins)
    const where: any = {
      associationId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    } else {
      where.status = SpaceStatus.ACTIVE;
    }

    const [spaces, total] = await Promise.all([
      this.prisma.space.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.space.count({ where }),
    ]);

    return {
      data: spaces.map(this.formatSpace),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get space by ID
   */
  async getSpace(spaceId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId, deletedAt: null },
      include: {
        blocks: {
          where: {
            date: { gte: new Date() },
          },
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!space) {
      throw new NotFoundException('Espaço não encontrado');
    }

    return this.formatSpace(space);
  }

  /**
   * Get space availability for a date range
   */
  async getAvailability(spaceId: string, query: SpaceAvailabilityQueryDto) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId, deletedAt: null },
    });

    if (!space) {
      throw new NotFoundException('Espaço não encontrado');
    }

    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get blocks for the period
    const blocks = await this.prisma.spaceBlock.findMany({
      where: {
        spaceId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    const blockedDates = new Set(blocks.map(b => b.date.toISOString().split('T')[0]));

    // Get bookings for the period (pending or approved)
    const bookings = await this.prisma.booking.findMany({
      where: {
        spaceId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
      },
    });

    const availability: Array<{
      date: string;
      available: boolean;
      reason?: string;
      bookings?: any[];
    }> = [];

    // Generate dates in the range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const result: any = { date: dateStr, available: true };

      // Check if date is in the past
      if (currentDate < today) {
        result.available = false;
        result.reason = 'past';
      }
      // Check advance days
      else {
        const daysAhead = Math.ceil((currentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysAhead < space.minAdvanceDays) {
          result.available = false;
          result.reason = 'outside_advance';
        } else if (daysAhead > space.maxAdvanceDays) {
          result.available = false;
          result.reason = 'outside_advance';
        }
        // Check if blocked
        else if (blockedDates.has(dateStr)) {
          result.available = false;
          result.reason = 'blocked';
        }
        // Check maintenance
        else if (space.status === SpaceStatus.MAINTENANCE) {
          result.available = false;
          result.reason = 'maintenance';
        }
        // Check bookings
        else {
          const dateBookings = bookings.filter(
            b => b.date.toISOString().split('T')[0] === dateStr
          );

          if (space.periodType === BookingPeriodType.DAY && dateBookings.length > 0) {
            result.available = false;
            result.reason = 'booked';
          } else if (space.periodType === BookingPeriodType.SHIFT) {
            // For shifts, show which shifts are available
            const shifts = (space.shifts as any[]) || [];
            const bookedShifts = dateBookings.map(b => b.shiftName);
            result.shifts = shifts.map(shift => ({
              ...shift,
              available: !bookedShifts.includes(shift.name),
            }));
            result.available = shifts.some(s => !bookedShifts.includes(s.name));
          } else if (space.periodType === BookingPeriodType.HOUR) {
            // For hours, show booked time slots
            result.bookings = dateBookings.map(b => ({
              startTime: b.startTime,
              endTime: b.endTime,
            }));
          }
        }
      }

      availability.push(result);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { spaceId, availability };
  }

  // ===========================================
  // ADMIN METHODS
  // ===========================================

  /**
   * List all spaces (admin view - includes inactive)
   */
  async adminListSpaces(associationId: string, query: SpaceQueryDto) {
    const { page = 1, limit = 20, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      associationId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    const [spaces, total] = await Promise.all([
      this.prisma.space.findMany({
        where,
        include: {
          _count: {
            select: { bookings: true, blocks: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.space.count({ where }),
    ]);

    return {
      data: spaces.map(space => ({
        ...this.formatSpace(space),
        _count: (space as any)._count,
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
   * Create a new space (ADM only)
   */
  async createSpace(associationId: string, dto: CreateSpaceDto) {
    // Validate period-specific fields
    this.validatePeriodConfig(dto);

    const space = await this.prisma.space.create({
      data: {
        associationId,
        name: dto.name,
        description: dto.description,
        capacity: dto.capacity,
        images: dto.images || [],
        mainImageUrl: dto.images?.[0] || null,
        fee: dto.fee ? new Decimal(dto.fee) : new Decimal(0),
        periodType: dto.periodType,
        shifts: dto.shifts ? JSON.parse(JSON.stringify(dto.shifts)) : [],
        openingTime: dto.openingTime,
        closingTime: dto.closingTime,
        minDurationHours: dto.minDurationHours,
        minAdvanceDays: dto.minAdvanceDays ?? 1,
        maxAdvanceDays: dto.maxAdvanceDays ?? 60,
        bookingIntervalMonths: dto.bookingIntervalMonths ?? 0,
        blockedSpaceIds: dto.blockedSpaceIds || [],
      },
    });

    this.logger.log(`Space created: ${space.id} - ${dto.name}`);

    return this.formatSpace(space);
  }

  /**
   * Update a space (ADM only)
   */
  async updateSpace(spaceId: string, associationId: string, dto: UpdateSpaceDto) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId, deletedAt: null },
    });

    if (!space) {
      throw new NotFoundException('Espaço não encontrado');
    }

    if (space.associationId !== associationId) {
      throw new NotFoundException('Espaço não encontrado');
    }

    // Validate period config if changing period type
    if (dto.periodType) {
      this.validatePeriodConfig({
        periodType: dto.periodType,
        shifts: dto.shifts,
        openingTime: dto.openingTime,
        closingTime: dto.closingTime,
        minDurationHours: dto.minDurationHours,
      } as CreateSpaceDto);
    }

    const updated = await this.prisma.space.update({
      where: { id: spaceId },
      data: {
        name: dto.name,
        description: dto.description,
        capacity: dto.capacity,
        images: dto.images,
        mainImageUrl: dto.images?.[0],
        fee: dto.fee !== undefined ? new Decimal(dto.fee) : undefined,
        periodType: dto.periodType,
        shifts: dto.shifts ? JSON.parse(JSON.stringify(dto.shifts)) : undefined,
        openingTime: dto.openingTime,
        closingTime: dto.closingTime,
        minDurationHours: dto.minDurationHours,
        minAdvanceDays: dto.minAdvanceDays,
        maxAdvanceDays: dto.maxAdvanceDays,
        bookingIntervalMonths: dto.bookingIntervalMonths,
        blockedSpaceIds: dto.blockedSpaceIds,
      },
    });

    this.logger.log(`Space updated: ${spaceId}`);

    return this.formatSpace(updated);
  }

  /**
   * Update space status (Gerente/ADM)
   */
  async updateStatus(spaceId: string, associationId: string, dto: UpdateSpaceStatusDto) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId, deletedAt: null },
    });

    if (!space) {
      throw new NotFoundException('Espaço não encontrado');
    }

    if (space.associationId !== associationId) {
      throw new NotFoundException('Espaço não encontrado');
    }

    const updated = await this.prisma.space.update({
      where: { id: spaceId },
      data: { status: dto.status },
    });

    this.logger.log(`Space status changed: ${spaceId} -> ${dto.status}`);

    return this.formatSpace(updated);
  }

  /**
   * Delete a space (soft delete, ADM only)
   */
  async deleteSpace(spaceId: string, associationId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId, deletedAt: null },
    });

    if (!space) {
      throw new NotFoundException('Espaço não encontrado');
    }

    if (space.associationId !== associationId) {
      throw new NotFoundException('Espaço não encontrado');
    }

    await this.prisma.space.update({
      where: { id: spaceId },
      data: {
        deletedAt: new Date(),
        status: SpaceStatus.INACTIVE,
      },
    });

    this.logger.log(`Space deleted (soft): ${spaceId}`);

    return { success: true };
  }

  // ===========================================
  // BLOCK MANAGEMENT
  // ===========================================

  /**
   * Block specific dates (Gerente/ADM)
   */
  async createBlock(spaceId: string, associationId: string, userId: string, dto: CreateSpaceBlockDto) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId, deletedAt: null },
    });

    if (!space) {
      throw new NotFoundException('Espaço não encontrado');
    }

    if (space.associationId !== associationId) {
      throw new NotFoundException('Espaço não encontrado');
    }

    const blockDate = new Date(dto.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (blockDate < today) {
      throw new BadRequestException('Não é possível bloquear datas passadas');
    }

    // Check if date is already blocked
    const existingBlock = await this.prisma.spaceBlock.findUnique({
      where: {
        spaceId_date: {
          spaceId,
          date: blockDate,
        },
      },
    });

    if (existingBlock) {
      throw new ConflictException('Data já está bloqueada');
    }

    const block = await this.prisma.spaceBlock.create({
      data: {
        spaceId,
        date: blockDate,
        reason: dto.reason,
        createdById: userId,
      },
    });

    this.logger.log(`Space block created: ${spaceId} - ${dto.date}`);

    return block;
  }

  /**
   * Block multiple dates at once
   */
  async createBlockBulk(spaceId: string, associationId: string, userId: string, dto: CreateSpaceBlockBulkDto) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId, deletedAt: null },
    });

    if (!space) {
      throw new NotFoundException('Espaço não encontrado');
    }

    if (space.associationId !== associationId) {
      throw new NotFoundException('Espaço não encontrado');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validDates = dto.dates.filter(d => new Date(d) >= today);

    if (validDates.length === 0) {
      throw new BadRequestException('Nenhuma data válida fornecida');
    }

    const blocks = await this.prisma.spaceBlock.createMany({
      data: validDates.map(date => ({
        spaceId,
        date: new Date(date),
        reason: dto.reason,
        createdById: userId,
      })),
      skipDuplicates: true,
    });

    this.logger.log(`Space blocks created: ${spaceId} - ${blocks.count} dates`);

    return { created: blocks.count };
  }

  /**
   * Remove a block
   */
  async removeBlock(spaceId: string, blockId: string, associationId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId, deletedAt: null },
    });

    if (!space) {
      throw new NotFoundException('Espaço não encontrado');
    }

    if (space.associationId !== associationId) {
      throw new NotFoundException('Espaço não encontrado');
    }

    const block = await this.prisma.spaceBlock.findUnique({
      where: { id: blockId },
    });

    if (!block || block.spaceId !== spaceId) {
      throw new NotFoundException('Bloqueio não encontrado');
    }

    await this.prisma.spaceBlock.delete({
      where: { id: blockId },
    });

    this.logger.log(`Space block removed: ${blockId}`);

    return { success: true };
  }

  /**
   * List blocks for a space
   */
  async listBlocks(spaceId: string, associationId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId, deletedAt: null },
    });

    if (!space) {
      throw new NotFoundException('Espaço não encontrado');
    }

    if (space.associationId !== associationId) {
      throw new NotFoundException('Espaço não encontrado');
    }

    return this.prisma.spaceBlock.findMany({
      where: {
        spaceId,
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
    });
  }

  // ===========================================
  // HELPER METHODS
  // ===========================================

  private validatePeriodConfig(dto: CreateSpaceDto) {
    if (dto.periodType === BookingPeriodType.SHIFT) {
      if (!dto.shifts || dto.shifts.length === 0) {
        throw new BadRequestException('Turnos são obrigatórios para período por turno');
      }
      // Validate each shift
      for (const shift of dto.shifts) {
        if (!shift.name || !shift.startTime || !shift.endTime) {
          throw new BadRequestException('Cada turno deve ter nome, horário de início e fim');
        }
      }
    }

    if (dto.periodType === BookingPeriodType.HOUR) {
      if (!dto.openingTime || !dto.closingTime) {
        throw new BadRequestException('Horário de abertura e fechamento são obrigatórios para período por hora');
      }
    }
  }

  private formatSpace(space: any) {
    return {
      id: space.id,
      name: space.name,
      description: space.description,
      capacity: space.capacity,
      images: space.images,
      mainImageUrl: space.mainImageUrl,
      fee: space.fee ? Number(space.fee) : 0,
      periodType: space.periodType,
      shifts: space.shifts,
      openingTime: space.openingTime,
      closingTime: space.closingTime,
      minDurationHours: space.minDurationHours,
      minAdvanceDays: space.minAdvanceDays,
      maxAdvanceDays: space.maxAdvanceDays,
      bookingIntervalMonths: space.bookingIntervalMonths,
      blockedSpaceIds: space.blockedSpaceIds,
      status: space.status,
      createdAt: space.createdAt,
      updatedAt: space.updatedAt,
      blocks: space.blocks,
      _count: space._count,
    };
  }

  /**
   * Check if a user can book a space (considering interval restriction)
   */
  async canUserBook(spaceId: string, userId: string): Promise<{ canBook: boolean; nextAvailableDate?: Date }> {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
    });

    if (!space || space.bookingIntervalMonths === 0) {
      return { canBook: true };
    }

    // Find user's last approved booking for this space
    const lastBooking = await this.prisma.booking.findFirst({
      where: {
        spaceId,
        userId,
        status: BookingStatus.APPROVED,
      },
      orderBy: { date: 'desc' },
    });

    if (!lastBooking) {
      return { canBook: true };
    }

    const nextAvailable = new Date(lastBooking.date);
    nextAvailable.setMonth(nextAvailable.getMonth() + space.bookingIntervalMonths);

    if (new Date() >= nextAvailable) {
      return { canBook: true };
    }

    return {
      canBook: false,
      nextAvailableDate: nextAvailable,
    };
  }
}
