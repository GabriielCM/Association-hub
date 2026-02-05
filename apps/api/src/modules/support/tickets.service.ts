import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TicketStatus, TicketCategory, NotificationType, NotificationCategory, SenderType } from '@prisma/client';
import {
  CreateTicketDto,
  CreateAutomaticTicketDto,
  CreateTicketMessageDto,
  RateTicketDto,
} from './dto/create-ticket.dto';
import { TicketsQueryDto, AdminTicketsQueryDto, UpdateTicketStatusDto } from './dto/tickets-query.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Generate unique ticket code
   */
  private async generateTicketCode(): Promise<string> {
    const count = await this.prisma.ticket.count();
    return `TKT-${String(count + 1).padStart(3, '0')}`;
  }

  /**
   * List user tickets
   */
  async listUserTickets(userId: string, query: TicketsQueryDto) {
    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          code: true,
          category: true,
          subject: true,
          status: true,
          isAutomatic: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { messages: true },
          },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets.map((t) => ({
        ...t,
        messageCount: t._count.messages,
        hasUnread: false, // TODO: implement unread tracking
      })),
      meta: {
        currentPage: page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  /**
   * Create ticket
   */
  async createTicket(userId: string, associationId: string, dto: CreateTicketDto) {
    const code = await this.generateTicketCode();

    const ticket = await this.prisma.ticket.create({
      data: {
        code,
        userId,
        associationId,
        category: dto.category,
        subject: dto.subject,
        description: dto.description,
        status: TicketStatus.OPEN,
        isAutomatic: false,
        // Link attachments if provided
        ...(dto.attachmentIds?.length && {
          attachments: {
            create: await this.linkAttachments(dto.attachmentIds, userId),
          },
        }),
      },
      include: {
        attachments: true,
      },
    });

    this.logger.log(`Created ticket ${ticket.code} for user ${userId}`);

    // TODO: Notify support team

    return { data: ticket };
  }

  /**
   * Create automatic ticket (crash report)
   */
  async createAutomaticTicket(userId: string, associationId: string, dto: CreateAutomaticTicketDto) {
    // Rate limit: max 1 automatic ticket per error type per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingToday = await this.prisma.ticket.findFirst({
      where: {
        userId,
        isAutomatic: true,
        createdAt: { gte: today },
      },
    });

    if (existingToday) {
      throw new BadRequestException({
        code: 'RATE_LIMITED',
        message: 'Maximum 1 automatic ticket per day',
      });
    }

    const code = await this.generateTicketCode();
    const subject = `Crash Report - ${dto.errorType}`;

    const ticket = await this.prisma.ticket.create({
      data: {
        code,
        userId,
        associationId,
        category: TicketCategory.BUG,
        subject,
        description: `Automatic crash report: ${dto.errorType}`,
        status: TicketStatus.OPEN,
        isAutomatic: true,
        deviceInfo: dto.deviceInfo as any,
      },
    });

    this.logger.log(`Created automatic ticket ${ticket.code} for user ${userId}`);

    return { data: ticket };
  }

  /**
   * Get ticket details with messages
   */
  async getTicket(ticketId: string, userId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId },
      include: {
        attachments: true,
        rating: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            attachments: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Get sender info for messages
    const messagesWithSender = await Promise.all(
      ticket.messages.map(async (msg) => {
        let sender = null;
        if (msg.senderType === SenderType.USER) {
          const user = await this.prisma.user.findUnique({
            where: { id: msg.senderId },
            select: { id: true, name: true, avatarUrl: true },
          });
          sender = user ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl } : null;
        } else {
          sender = { id: msg.senderId, name: msg.senderName || 'Suporte' };
        }
        return { ...msg, sender };
      }),
    );

    return {
      data: {
        ...ticket,
        messages: messagesWithSender,
      },
    };
  }

  /**
   * Send message to ticket
   */
  async sendMessage(ticketId: string, userId: string, dto: CreateTicketMessageDto) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException({
        code: 'TICKET_CLOSED',
        message: 'Cannot send message to closed ticket',
      });
    }

    // If ticket was resolved, reopen it
    const shouldReopen = ticket.status === TicketStatus.RESOLVED;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderType: SenderType.USER,
        senderId: userId,
        senderName: user?.name,
        content: dto.content,
        ...(dto.attachmentIds?.length && {
          attachments: {
            create: await this.linkMessageAttachments(dto.attachmentIds, userId),
          },
        }),
      },
      include: {
        attachments: true,
      },
    });

    // Reopen ticket if needed
    if (shouldReopen) {
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.OPEN, resolvedAt: null },
      });
    }

    this.logger.log(`User ${userId} sent message to ticket ${ticketId}`);

    // TODO: Notify support via WebSocket

    return { data: message };
  }

  /**
   * User marks ticket as resolved
   */
  async resolveTicket(ticketId: string, userId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException({
        code: 'ALREADY_RESOLVED',
        message: 'Ticket is already resolved or closed',
      });
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    });

    this.logger.log(`User ${userId} resolved ticket ${ticketId}`);

    return {
      data: {
        id: updated.id,
        status: updated.status,
        resolvedAt: updated.resolvedAt,
      },
    };
  }

  /**
   * Rate ticket
   */
  async rateTicket(ticketId: string, userId: string, dto: RateTicketDto) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, userId },
      include: { rating: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== TicketStatus.RESOLVED) {
      throw new BadRequestException({
        code: 'NOT_RESOLVED',
        message: 'Ticket must be resolved before rating',
      });
    }

    if (ticket.rating) {
      throw new ConflictException({
        code: 'ALREADY_RATED',
        message: 'Ticket has already been rated',
      });
    }

    const rating = await this.prisma.ticketRating.create({
      data: {
        ticketId,
        rating: Number(dto.rating),
        comment: dto.comment,
      },
    });

    // Close ticket after rating
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.CLOSED },
    });

    this.logger.log(`User ${userId} rated ticket ${ticketId} with ${dto.rating} stars`);

    return { data: rating };
  }

  // =====================================
  // ADMIN METHODS
  // =====================================

  /**
   * List all tickets (admin)
   */
  async listAllTickets(associationId: string, query: AdminTicketsQueryDto) {
    const where: any = { associationId };

    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.isAutomatic !== undefined) where.isAutomatic = query.isAutomatic;
    if (query.userId) where.userId = query.userId;
    if (query.search) {
      where.OR = [
        { subject: { contains: query.search, mode: 'insensitive' } },
        { user: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;

    const [tickets, total, counts] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      this.prisma.ticket.count({ where }),
      this.getTicketCounts(associationId),
    ]);

    return {
      data: tickets.map((t) => ({
        ...t,
        messageCount: t._count.messages,
      })),
      meta: {
        currentPage: page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        counts,
      },
    };
  }

  /**
   * Get ticket details (admin) with user info
   */
  async getTicketAdmin(ticketId: string, associationId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, associationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        attachments: true,
        rating: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            attachments: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Count user's total tickets
    const totalUserTickets = await this.prisma.ticket.count({
      where: { userId: ticket.userId },
    });

    return {
      data: {
        ...ticket,
        user: {
          ...ticket.user,
          totalTickets: totalUserTickets,
          memberSince: ticket.user.createdAt,
        },
      },
    };
  }

  /**
   * Update ticket status/assignment (admin)
   */
  async updateTicketStatus(ticketId: string, associationId: string, dto: UpdateTicketStatusDto) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, associationId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.status === TicketStatus.RESOLVED && { resolvedAt: new Date() }),
        ...(dto.assignedTo && { assignedToId: dto.assignedTo }),
      },
    });

    this.logger.log(`Admin updated ticket ${ticketId} status to ${dto.status}`);

    // Notify user of status change
    if (dto.status) {
      await this.notificationsService.create({
        userId: ticket.userId,
        type: NotificationType.ADMIN_ANNOUNCEMENT,
        category: NotificationCategory.SYSTEM,
        title: this.getStatusNotificationTitle(dto.status),
        body: this.getStatusNotificationBody(ticket.code, dto.status),
        data: { ticketId, ticketCode: ticket.code },
      });
    }

    return { data: updated };
  }

  /**
   * Admin sends message to ticket
   */
  async sendAdminMessage(
    ticketId: string,
    associationId: string,
    adminId: string,
    adminName: string,
    dto: CreateTicketMessageDto,
  ) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, associationId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderType: SenderType.SUPPORT,
        senderId: adminId,
        senderName: adminName,
        content: dto.content,
        ...(dto.attachmentIds?.length && {
          attachments: {
            create: await this.linkMessageAttachments(dto.attachmentIds, adminId),
          },
        }),
      },
      include: {
        attachments: true,
      },
    });

    // Update ticket status to in_progress if it was open
    if (ticket.status === TicketStatus.OPEN) {
      await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.IN_PROGRESS },
      });
    }

    this.logger.log(`Admin ${adminId} sent message to ticket ${ticketId}`);

    // Notify user
    await this.notificationsService.create({
      userId: ticket.userId,
      type: NotificationType.NEW_MESSAGE,
      category: NotificationCategory.SYSTEM,
      title: 'Nova resposta no ticket',
      body: `A equipe de suporte respondeu seu ticket #${ticket.code}`,
      data: { ticketId, ticketCode: ticket.code },
    });

    return { data: message };
  }

  // =====================================
  // PRIVATE HELPERS
  // =====================================

  private async getTicketCounts(associationId: string) {
    const counts = await this.prisma.ticket.groupBy({
      by: ['status'],
      where: { associationId },
      _count: true,
    });

    return {
      open: counts.find((c) => c.status === TicketStatus.OPEN)?._count ?? 0,
      inProgress: counts.find((c) => c.status === TicketStatus.IN_PROGRESS)?._count ?? 0,
      resolved: counts.find((c) => c.status === TicketStatus.RESOLVED)?._count ?? 0,
      closed: counts.find((c) => c.status === TicketStatus.CLOSED)?._count ?? 0,
    };
  }

  private async linkAttachments(attachmentIds: string[], userId: string) {
    const uploads = await this.prisma.supportUpload.findMany({
      where: {
        id: { in: attachmentIds },
        userId,
        expiresAt: { gt: new Date() },
      },
    });

    return uploads.map((u) => ({
      type: u.type,
      url: u.url,
      filename: u.filename,
      sizeBytes: u.sizeBytes,
      mimeType: u.mimeType,
    }));
  }

  private async linkMessageAttachments(attachmentIds: string[], userId: string) {
    return this.linkAttachments(attachmentIds, userId);
  }

  private getStatusNotificationTitle(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.IN_PROGRESS:
        return 'Ticket em andamento';
      case TicketStatus.RESOLVED:
        return 'Ticket resolvido';
      case TicketStatus.CLOSED:
        return 'Ticket fechado';
      default:
        return 'Atualização do ticket';
    }
  }

  private getStatusNotificationBody(code: string, status: TicketStatus): string {
    switch (status) {
      case TicketStatus.IN_PROGRESS:
        return `Seu ticket #${code} está sendo analisado`;
      case TicketStatus.RESOLVED:
        return `Seu ticket #${code} foi resolvido. Avalie o atendimento!`;
      case TicketStatus.CLOSED:
        return `Seu ticket #${code} foi fechado`;
      default:
        return `Seu ticket #${code} foi atualizado`;
    }
  }
}
