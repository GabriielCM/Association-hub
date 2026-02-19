import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PointsService } from '../points/points.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { EventsGateway } from './events.gateway';
import { PostsService } from '../dashboard/services/posts.service';
import { EventStatus, Prisma, NotificationCategory, NotificationType, PostType } from '@prisma/client';
import { createHmac, randomBytes } from 'crypto';
import {
  CreateEventDto,
  UpdateEventDto,
  EventQueryDto,
  AdminEventQueryDto,
  EventFilter,
  CheckinDto,
  ManualCheckinDto,
  CreateCommentDto,
  CommentQueryDto,
} from './dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly eventsGateway: EventsGateway,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
  ) {}

  // ===========================================
  // USER ENDPOINTS
  // ===========================================

  async listEvents(userId: string, associationId: string, query: EventQueryDto) {
    const { page = 1, perPage = 20, filter, category, search } = query;
    const skip = (page - 1) * perPage;
    const now = new Date();

    const where: Prisma.EventWhereInput = {
      associationId,
      status: { in: ['SCHEDULED', 'ONGOING', 'ENDED'] }, // Hide drafts and canceled
    };

    // Apply filter
    switch (filter) {
      case EventFilter.UPCOMING:
        where.startDate = { gt: now };
        where.status = 'SCHEDULED';
        break;
      case EventFilter.ONGOING:
        where.status = 'ONGOING';
        break;
      case EventFilter.PAST:
        where.status = 'ENDED';
        break;
      case EventFilter.CONFIRMED:
        where.confirmations = { some: { userId } };
        break;
      // ALL: no additional filter
    }

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { locationName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy: { startDate: 'asc' },
        skip,
        take: perPage,
        select: {
          id: true,
          title: true,
          category: true,
          color: true,
          startDate: true,
          endDate: true,
          locationName: true,
          bannerFeed: true,
          bannerDisplay: true,
          pointsTotal: true,
          checkinsCount: true,
          status: true,
          capacity: true,
          _count: {
            select: { confirmations: true },
          },
          confirmations: {
            where: { userId },
            select: { id: true },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events.map((event) => ({
        id: event.id,
        title: event.title,
        category: event.category,
        color: event.color,
        startDate: event.startDate,
        endDate: event.endDate,
        locationName: event.locationName,
        bannerFeed: event.bannerFeed,
        bannerDisplay: event.bannerDisplay,
        pointsTotal: event.pointsTotal,
        checkinsCount: event.checkinsCount,
        status: event.status,
        capacity: event.capacity,
        confirmationsCount: event._count.confirmations,
        isConfirmed: event.confirmations.length > 0,
      })),
      meta: {
        currentPage: page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        totalCount: total,
      },
    };
  }

  async getEvent(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        badge: {
          select: {
            id: true,
            name: true,
            description: true,
            iconUrl: true,
          },
        },
        _count: {
          select: {
            confirmations: true,
            checkIns: true,
            comments: true,
          },
        },
        confirmations: {
          where: { userId },
          select: { id: true, confirmedAt: true },
        },
        checkIns: {
          where: { userId },
          select: {
            id: true,
            checkinNumber: true,
            pointsAwarded: true,
            badgeAwarded: true,
            createdAt: true,
          },
          orderBy: { checkinNumber: 'asc' },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    // User's next sequential check-in number (capped at total)
    const currentCheckinNumber = Math.min(event.checkIns.length + 1, event.checkinsCount);

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      color: event.color,
      startDate: event.startDate,
      endDate: event.endDate,
      locationName: event.locationName,
      locationAddress: event.locationAddress,
      bannerFeed: event.bannerFeed,
      bannerDisplay: event.bannerDisplay,
      pointsTotal: event.pointsTotal,
      checkinsCount: event.checkinsCount,
      checkinInterval: event.checkinInterval,
      status: event.status,
      isPaused: event.isPaused,
      capacity: event.capacity,
      externalLink: event.externalLink,
      badge: event.badge,
      badgeCriteria: event.badgeCriteria,
      confirmationsCount: event._count.confirmations,
      checkInsCount: event._count.checkIns,
      commentsCount: event._count.comments,
      currentCheckinNumber,
      // User-specific
      isConfirmed: event.confirmations.length > 0,
      confirmedAt: event.confirmations[0]?.confirmedAt || null,
      userCheckIns: event.checkIns,
      userCheckInsCompleted: event.checkIns.length,
    };
  }

  async confirmEvent(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true, capacity: true, _count: { select: { confirmations: true } } },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    if (event.status === 'ENDED' || event.status === 'CANCELED') {
      throw new BadRequestException('Este evento ja foi encerrado ou cancelado');
    }

    if (event.capacity && event._count.confirmations >= event.capacity) {
      throw new BadRequestException('Evento lotado');
    }

    const existing = await this.prisma.eventConfirmation.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existing) {
      throw new BadRequestException('Voce ja confirmou presenca neste evento');
    }

    const confirmation = await this.prisma.eventConfirmation.create({
      data: { eventId, userId },
    });

    return {
      confirmed: true,
      confirmedAt: confirmation.confirmedAt,
    };
  }

  async removeConfirmation(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    if (event.status === 'ONGOING' || event.status === 'ENDED') {
      throw new BadRequestException('Nao e possivel remover confirmacao de evento em andamento ou encerrado');
    }

    const confirmation = await this.prisma.eventConfirmation.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (!confirmation) {
      throw new BadRequestException('Voce nao confirmou presenca neste evento');
    }

    await this.prisma.eventConfirmation.delete({
      where: { id: confirmation.id },
    });

    return { confirmed: false };
  }

  // ===========================================
  // CHECK-IN
  // ===========================================

  async processCheckin(userId: string, dto: CheckinDto) {
    const { eventId, checkinNumber, securityToken, timestamp } = dto;

    // 1. Find event
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        status: true,
        isPaused: true,
        startDate: true,
        pointsTotal: true,
        checkinsCount: true,
        checkinInterval: true,
        qrSecret: true,
        badgeId: true,
        badgeCriteria: true,
        associationId: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    // 2. Validate event status
    if (event.status !== 'ONGOING') {
      throw new BadRequestException('Evento nao esta em andamento');
    }

    if (event.isPaused) {
      throw new BadRequestException('Check-ins estao temporariamente pausados');
    }

    // 3. Validate security token (HMAC-SHA256)
    const now = Math.floor(Date.now() / 1000);
    const tokenAge = now - timestamp;

    if (tokenAge < 0 || tokenAge > 120) {
      throw new BadRequestException('QR Code expirado. Escaneie novamente.');
    }

    const expectedToken = this.generateSecurityToken(eventId, checkinNumber, timestamp, event.qrSecret);
    if (securityToken !== expectedToken) {
      throw new BadRequestException('QR Code invalido');
    }

    // 4. Determine user's next sequential check-in number
    const userCheckins = await this.prisma.eventCheckIn.findMany({
      where: { eventId, userId },
      orderBy: { createdAt: 'desc' },
      select: { checkinNumber: true, createdAt: true },
    });
    // Find next available sequential number (handles legacy data gaps)
    const existingNumbers = new Set(userCheckins.map(c => c.checkinNumber));
    let userNextCheckin = 1;
    while (existingNumbers.has(userNextCheckin)) {
      userNextCheckin++;
    }

    if (userNextCheckin > event.checkinsCount) {
      throw new BadRequestException('Voce ja completou todos os check-ins');
    }

    // 5. Check interval since user's last check-in
    if (userCheckins.length > 0) {
      const lastCheckin = userCheckins[0]; // most recent (ordered desc)
      const minsSinceLast = (Date.now() - lastCheckin.createdAt.getTime()) / (1000 * 60);
      if (minsSinceLast < event.checkinInterval) {
        const remaining = Math.ceil(event.checkinInterval - minsSinceLast);
        throw new BadRequestException(`Aguarde ${remaining} minutos para o proximo check-in`);
      }
    }

    // 6. Calculate points with subscription multiplier
    const basePoints = Math.floor(event.pointsTotal / event.checkinsCount);
    let finalPoints = basePoints;

    try {
      const benefits = await this.subscriptionsService.getBenefits(userId);
      const multiplier = (benefits?.mutators as any)?.points_events || 1;
      finalPoints = Math.floor(basePoints * multiplier);
    } catch {
      // User has no subscription, use base points
    }

    // 7. Execute check-in in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create check-in record with sequential number
      const checkIn = await tx.eventCheckIn.create({
        data: {
          eventId,
          userId,
          checkinNumber: userNextCheckin,
          pointsAwarded: finalPoints,
        },
      });

      // Credit points
      await this.pointsService.creditPoints(
        userId,
        finalPoints,
        'EVENT_CHECKIN',
        `Check-in ${userNextCheckin} - ${event.title}`,
        { event_id: eventId, checkin_number: userNextCheckin },
        eventId,
      );

      // Check badge eligibility
      let badgeAwarded = false;
      if (event.badgeId) {
        badgeAwarded = await this.checkAndAwardBadge(
          tx,
          userId,
          eventId,
          event.badgeId,
          event.badgeCriteria,
          event.checkinsCount,
          checkIn.id,
        );
      }

      return { checkIn, badgeAwarded };
    });

    // Broadcast counter update to display via WebSocket
    try {
      const [totalCheckIns, uniqueUsers] = await Promise.all([
        this.prisma.eventCheckIn.count({ where: { eventId } }),
        this.prisma.eventCheckIn.groupBy({
          by: ['userId'],
          where: { eventId },
        }).then((groups) => groups.length),
      ]);
      this.eventsGateway.broadcastCounterUpdate(eventId, totalCheckIns, uniqueUsers);
    } catch (err) {
      this.logger.warn(`Failed to broadcast counter update: ${err}`);
    }

    return {
      success: true,
      checkinNumber: userNextCheckin,
      pointsAwarded: finalPoints,
      badgeAwarded: result.badgeAwarded,
      progress: {
        completed: userCheckins.length + 1,
        total: event.checkinsCount,
        percentage: Math.round(((userCheckins.length + 1) / event.checkinsCount) * 100),
      },
    };
  }

  private async checkAndAwardBadge(
    tx: Prisma.TransactionClient,
    userId: string,
    eventId: string,
    badgeId: string,
    criteria: string,
    totalCheckins: number,
    checkinId: string,
  ): Promise<boolean> {
    const userCheckins = await tx.eventCheckIn.count({
      where: { eventId, userId },
    });

    let shouldAward = false;

    switch (criteria) {
      case 'FIRST_CHECKIN':
        shouldAward = userCheckins === 1;
        break;
      case 'ALL_CHECKINS':
        shouldAward = userCheckins === totalCheckins;
        break;
      case 'AT_LEAST_ONE':
      default:
        shouldAward = userCheckins >= 1;
    }

    if (shouldAward) {
      // Check if user already has this badge
      const existingBadge = await tx.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId } },
      });

      if (!existingBadge) {
        const badge = await tx.badge.findUnique({
          where: { id: badgeId },
          select: { name: true, iconUrl: true },
        });

        await tx.userBadge.create({
          data: { userId, badgeId },
        });

        // Mark check-in as badge awarded
        await tx.eventCheckIn.update({
          where: { id: checkinId },
          data: { badgeAwarded: true },
        });

        // Send notification for badge earned (async, non-blocking)
        this.sendBadgeNotification(userId, badge?.name || 'Badge', badge?.iconUrl, eventId).catch(
          (err) => this.logger.error('Failed to send badge notification:', err)
        );

        return true;
      }
    }

    return false;
  }

  private async sendBadgeNotification(
    userId: string,
    badgeName: string,
    badgeIconUrl: string | null | undefined,
    eventId: string,
  ): Promise<void> {
    const notification = await this.notificationsService.create({
      userId,
      type: NotificationType.BADGE_EARNED,
      category: NotificationCategory.EVENTS,
      title: 'Nova Conquista!',
      body: `Você conquistou a badge "${badgeName}"`,
      data: { eventId, badgeName },
      imageUrl: badgeIconUrl || undefined,
      actionUrl: `/profile/badges`,
    });

    if (notification) {
      this.notificationsGateway.broadcastNewNotification(userId, notification);
    }
  }

  // ===========================================
  // COMMENTS
  // ===========================================

  async getComments(eventId: string, query: CommentQueryDto) {
    const { page = 1, perPage = 20 } = query;
    const skip = (page - 1) * perPage;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    const [comments, total] = await Promise.all([
      this.prisma.eventComment.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.eventComment.count({ where: { eventId } }),
    ]);

    return {
      data: comments.map((c) => ({
        id: c.id,
        contentType: c.contentType,
        text: c.text,
        mediaUrl: c.mediaUrl,
        createdAt: c.createdAt,
        author: c.user,
      })),
      meta: {
        currentPage: page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        totalCount: total,
      },
    };
  }

  async createComment(eventId: string, userId: string, dto: CreateCommentDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    const contentType = dto.contentType || 'TEXT';

    const comment = await this.prisma.eventComment.create({
      data: {
        eventId,
        userId,
        contentType,
        text: dto.text || null,
        mediaUrl: dto.mediaUrl || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      id: comment.id,
      contentType: comment.contentType,
      text: comment.text,
      mediaUrl: comment.mediaUrl,
      createdAt: comment.createdAt,
      author: comment.user,
    };
  }

  // ===========================================
  // ADMIN ENDPOINTS
  // ===========================================

  async adminListEvents(associationId: string, query: AdminEventQueryDto) {
    const { page = 1, perPage = 20, status, category, search } = query;
    const skip = (page - 1) * perPage;

    const where: Prisma.EventWhereInput = { associationId };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const assocWhere: Prisma.EventWhereInput = { associationId };

    const [events, total, statsAgg, activeCount] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
        select: {
          id: true,
          title: true,
          category: true,
          color: true,
          startDate: true,
          endDate: true,
          locationName: true,
          bannerFeed: true,
          status: true,
          isPaused: true,
          pointsTotal: true,
          checkinsCount: true,
          capacity: true,
          createdAt: true,
          publishedAt: true,
          _count: {
            select: {
              confirmations: true,
              checkIns: true,
            },
          },
        },
      }),
      this.prisma.event.count({ where }),
      this.prisma.event.aggregate({
        where: assocWhere,
        _sum: { pointsTotal: true },
        _count: true,
      }),
      this.prisma.event.count({
        where: {
          associationId,
          status: { in: ['SCHEDULED', 'ONGOING'] },
        },
      }),
    ]);

    const totalCheckIns = await this.prisma.eventCheckIn.count({
      where: { event: { associationId } },
    });

    return {
      data: events.map((e) => ({
        ...e,
        confirmationsCount: e._count.confirmations,
        checkInsTotal: e._count.checkIns,
      })),
      stats: {
        totalEvents: statsAgg._count,
        activeEvents: activeCount,
        totalCheckIns,
        totalPointsDistributed: statsAgg._sum.pointsTotal ?? 0,
      },
      meta: {
        currentPage: page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        totalCount: total,
      },
    };
  }

  async createEvent(associationId: string, adminId: string, dto: CreateEventDto) {
    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Data de inicio deve ser anterior a data de termino');
    }

    if (startDate <= new Date()) {
      throw new BadRequestException('Data de inicio deve ser no futuro');
    }

    // Validate badge if provided
    if (dto.badgeId) {
      const badge = await this.prisma.badge.findUnique({
        where: { id: dto.badgeId },
      });
      if (!badge) {
        throw new BadRequestException('Badge nao encontrado');
      }
    }

    // Generate QR secret for this event
    const qrSecret = randomBytes(32).toString('hex');

    const event = await this.prisma.event.create({
      data: {
        associationId,
        createdBy: adminId,
        qrSecret,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        color: dto.color || '#6366F1',
        startDate,
        endDate,
        locationName: dto.locationName,
        locationAddress: dto.locationAddress,
        bannerFeed: dto.bannerFeed,
        bannerDisplay: dto.bannerDisplay || [],
        pointsTotal: dto.pointsTotal,
        checkinsCount: dto.checkinsCount,
        checkinInterval: dto.checkinInterval || 30,
        badgeId: dto.badgeId,
        badgeCriteria: dto.badgeCriteria || 'AT_LEAST_ONE',
        capacity: dto.capacity,
        externalLink: dto.externalLink,
        status: 'DRAFT',
      },
    });

    return event;
  }

  async updateEvent(eventId: string, associationId: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, associationId: true, status: true },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    if (event.associationId !== associationId) {
      throw new ForbiddenException('Sem permissao para editar este evento');
    }

    if (event.status === 'ENDED' || event.status === 'CANCELED') {
      throw new BadRequestException('Nao e possivel editar evento encerrado ou cancelado');
    }

    const updateData: Prisma.EventUpdateInput = {};

    if (dto.title) updateData.title = dto.title;
    if (dto.description) updateData.description = dto.description;
    if (dto.category) updateData.category = dto.category;
    if (dto.color) updateData.color = dto.color;
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    if (dto.locationName) updateData.locationName = dto.locationName;
    if (dto.locationAddress !== undefined) updateData.locationAddress = dto.locationAddress;
    if (dto.bannerFeed !== undefined) updateData.bannerFeed = dto.bannerFeed;
    if (dto.bannerDisplay !== undefined) updateData.bannerDisplay = dto.bannerDisplay;
    if (dto.pointsTotal) updateData.pointsTotal = dto.pointsTotal;
    if (dto.checkinsCount) updateData.checkinsCount = dto.checkinsCount;
    if (dto.checkinInterval !== undefined) updateData.checkinInterval = dto.checkinInterval;
    if (dto.badgeId !== undefined) updateData.badge = dto.badgeId ? { connect: { id: dto.badgeId } } : { disconnect: true };
    if (dto.badgeCriteria) updateData.badgeCriteria = dto.badgeCriteria;
    if (dto.capacity !== undefined) updateData.capacity = dto.capacity;
    if (dto.externalLink !== undefined) updateData.externalLink = dto.externalLink;

    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    // Update feed post if event is published and description changed
    if (
      (event.status === 'SCHEDULED' || event.status === 'ONGOING') &&
      dto.description
    ) {
      this.postsService.updateEventPost(eventId, dto.description).catch((err) =>
        this.logger.error('Failed to update event post:', err),
      );
    }

    return updatedEvent;
  }

  async publishEvent(eventId: string, associationId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        associationId: true,
        status: true,
        title: true,
        description: true,
        bannerFeed: true,
        startDate: true,
        createdBy: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    if (event.associationId !== associationId) {
      throw new ForbiddenException('Sem permissao');
    }

    if (event.status !== 'DRAFT') {
      throw new BadRequestException('Apenas rascunhos podem ser publicados');
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'SCHEDULED',
        publishedAt: new Date(),
      },
    });

    // Create feed post for the event
    this.postsService
      .createEventPost(
        associationId,
        eventId,
        event.bannerFeed || '',
        event.description || event.title,
        event.createdBy,
      )
      .catch((err) => this.logger.error('Failed to create event post:', err));

    // Send notification to all users in the association (async, non-blocking)
    this.sendNewEventNotification(eventId, event.title, event.bannerFeed, event.startDate, associationId).catch(
      (err) => this.logger.error('Failed to send new event notification:', err)
    );

    return updatedEvent;
  }

  private async sendNewEventNotification(
    eventId: string,
    title: string,
    bannerUrl: string | null,
    startDate: Date,
    associationId: string,
  ): Promise<void> {
    // Get all active users in the association
    const users = await this.prisma.user.findMany({
      where: { associationId, status: 'ACTIVE' },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);
    if (userIds.length === 0) return;

    const formattedDate = startDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
    });

    const count = await this.notificationsService.createBatch({
      userIds,
      type: NotificationType.NEW_EVENT,
      category: NotificationCategory.EVENTS,
      title: 'Novo Evento!',
      body: `${title} - ${formattedDate}`,
      data: { eventId, title, startDate: startDate.toISOString() },
      imageUrl: bannerUrl || undefined,
      actionUrl: `/events/${eventId}`,
      groupKey: `new-events-${new Date().toISOString().split('T')[0]}`,
    });

    this.logger.log(`New event notification sent to ${count} users`);
  }

  async cancelEvent(eventId: string, associationId: string, reason: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, associationId: true, status: true, title: true },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    if (event.associationId !== associationId) {
      throw new ForbiddenException('Sem permissao');
    }

    if (event.status === 'ENDED' || event.status === 'CANCELED') {
      throw new BadRequestException('Evento ja foi encerrado ou cancelado');
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'CANCELED',
        cancelReason: reason,
      },
    });

    // Delete the feed post for this event
    this.postsService.deleteEventPost(eventId).catch((err) =>
      this.logger.error('Failed to delete event post:', err),
    );

    // Send notification to confirmed users (async, non-blocking)
    this.sendEventCancelledNotification(eventId, event.title, reason).catch(
      (err) => this.logger.error('Failed to send event cancelled notification:', err)
    );

    return updatedEvent;
  }

  private async sendEventCancelledNotification(
    eventId: string,
    title: string,
    reason: string,
  ): Promise<void> {
    // Get all confirmed users
    const confirmations = await this.prisma.eventConfirmation.findMany({
      where: { eventId },
      select: { userId: true },
    });

    const userIds = confirmations.map((c) => c.userId);
    if (userIds.length === 0) return;

    const count = await this.notificationsService.createBatch({
      userIds,
      type: NotificationType.EVENT_CANCELLED,
      category: NotificationCategory.EVENTS,
      title: 'Evento Cancelado',
      body: `${title} foi cancelado. Motivo: ${reason}`,
      data: { eventId, title, reason },
      actionUrl: `/events/${eventId}`,
    });

    this.logger.log(`Event cancelled notification sent to ${count} users`);
  }

  async pauseEvent(eventId: string, associationId: string, isPaused: boolean) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, associationId: true, status: true },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    if (event.associationId !== associationId) {
      throw new ForbiddenException('Sem permissao');
    }

    if (event.status !== 'ONGOING') {
      throw new BadRequestException('Apenas eventos em andamento podem ser pausados');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: { isPaused },
    });
  }

  async manualCheckin(eventId: string, associationId: string, adminId: string, dto: ManualCheckinDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        associationId: true,
        status: true,
        title: true,
        pointsTotal: true,
        checkinsCount: true,
        badgeId: true,
        badgeCriteria: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    if (event.associationId !== associationId) {
      throw new ForbiddenException('Sem permissao');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true, name: true, associationId: true },
    });

    if (!user || user.associationId !== associationId) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    // Check if already did this check-in
    const existingCheckin = await this.prisma.eventCheckIn.findUnique({
      where: {
        eventId_userId_checkinNumber: {
          eventId,
          userId: dto.userId,
          checkinNumber: dto.checkinNumber,
        },
      },
    });

    if (existingCheckin) {
      throw new BadRequestException(`Usuario ja fez o check-in ${dto.checkinNumber}`);
    }

    // Calculate points
    const basePoints = Math.floor(event.pointsTotal / event.checkinsCount);

    const result = await this.prisma.$transaction(async (tx) => {
      const checkIn = await tx.eventCheckIn.create({
        data: {
          eventId,
          userId: dto.userId,
          checkinNumber: dto.checkinNumber,
          pointsAwarded: basePoints,
          isManual: true,
          manualBy: adminId,
          manualReason: dto.reason,
        },
      });

      await this.pointsService.creditPoints(
        dto.userId,
        basePoints,
        'EVENT_CHECKIN',
        `Check-in manual ${dto.checkinNumber} - ${event.title}`,
        { event_id: eventId, checkin_number: dto.checkinNumber, manual: true },
        eventId,
      );

      let badgeAwarded = false;
      if (event.badgeId) {
        badgeAwarded = await this.checkAndAwardBadge(
          tx,
          dto.userId,
          eventId,
          event.badgeId,
          event.badgeCriteria,
          event.checkinsCount,
          checkIn.id,
        );
      }

      return { checkIn, badgeAwarded };
    });

    return {
      success: true,
      checkinNumber: dto.checkinNumber,
      pointsAwarded: basePoints,
      badgeAwarded: result.badgeAwarded,
      user: { id: user.id, name: user.name },
    };
  }

  async deleteEvent(eventId: string, associationId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, associationId: true, status: true },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    if (event.associationId !== associationId) {
      throw new ForbiddenException('Sem permissao');
    }

    if (event.status !== 'DRAFT') {
      throw new BadRequestException('Apenas rascunhos podem ser deletados. Use cancelar para eventos publicados.');
    }

    await this.prisma.event.delete({
      where: { id: eventId },
    });

    return { deleted: true };
  }

  // ===========================================
  // ANALYTICS
  // ===========================================

  async getAnalytics(eventId: string, associationId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        associationId: true,
        title: true,
        checkinsCount: true,
        pointsTotal: true,
        badgeId: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    if (event.associationId !== associationId) {
      throw new ForbiddenException('Sem permissao');
    }

    // Get stats
    const [
      confirmationsCount,
      totalCheckIns,
      uniqueCheckInUsers,
      badgesAwarded,
      checkInsByNumber,
      recentCheckIns,
    ] = await Promise.all([
      this.prisma.eventConfirmation.count({ where: { eventId } }),
      this.prisma.eventCheckIn.count({ where: { eventId } }),
      this.prisma.eventCheckIn.groupBy({
        by: ['userId'],
        where: { eventId },
        _count: true,
      }),
      event.badgeId
        ? this.prisma.eventCheckIn.count({
            where: { eventId, badgeAwarded: true },
          })
        : 0,
      this.prisma.eventCheckIn.groupBy({
        by: ['checkinNumber'],
        where: { eventId },
        _count: true,
        orderBy: { checkinNumber: 'asc' },
      }),
      this.prisma.eventCheckIn.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      }),
    ]);

    const totalMembers = await this.prisma.user.count({
      where: { associationId: event.associationId, status: 'ACTIVE' },
    });

    const pointsDistributed = await this.prisma.eventCheckIn.aggregate({
      where: { eventId },
      _sum: { pointsAwarded: true },
    });

    return {
      event: {
        id: event.id,
        title: event.title,
        totalCheckins: event.checkinsCount,
        totalPoints: event.pointsTotal,
      },
      metrics: {
        confirmations: confirmationsCount,
        totalCheckIns,
        uniqueUsers: uniqueCheckInUsers.length,
        presenceRate: totalMembers > 0
          ? Math.round((uniqueCheckInUsers.length / totalMembers) * 100 * 10) / 10
          : 0,
        presenceRateConfirmed: confirmationsCount > 0
          ? Math.round((uniqueCheckInUsers.length / confirmationsCount) * 100 * 10) / 10
          : 0,
        pointsDistributed: pointsDistributed._sum.pointsAwarded || 0,
        badgesAwarded,
      },
      checkInsByNumber: checkInsByNumber.map((c) => ({
        checkinNumber: c.checkinNumber,
        count: c._count,
      })),
      recentCheckIns: recentCheckIns.map((c) => ({
        id: c.id,
        checkinNumber: c.checkinNumber,
        pointsAwarded: c.pointsAwarded,
        createdAt: c.createdAt,
        user: c.user,
      })),
    };
  }

  async getParticipants(eventId: string, associationId: string, page = 1, perPage = 50) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, associationId: true, checkinsCount: true },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    if (event.associationId !== associationId) {
      throw new ForbiddenException('Sem permissao');
    }

    const skip = (page - 1) * perPage;

    // Get all users who have check-ins or confirmations (Prisma Client)
    const participantWhere = {
      OR: [
        { eventConfirmations: { some: { eventId } } },
        { eventCheckIns: { some: { eventId } } },
      ],
    };

    const [participants, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where: participantWhere,
        select: { id: true, name: true, email: true, avatarUrl: true },
        orderBy: { name: 'asc' },
        take: perPage,
        skip,
      }),
      this.prisma.user.count({ where: participantWhere }),
    ]);

    // Get check-ins, confirmations, and subscriptions for each participant
    const participantIds = participants.map((p) => p.id);
    const [confirmations, checkIns, subscriptions] = await Promise.all([
      this.prisma.eventConfirmation.findMany({
        where: { eventId, userId: { in: participantIds } },
        select: { userId: true, confirmedAt: true },
      }),
      this.prisma.eventCheckIn.findMany({
        where: { eventId, userId: { in: participantIds } },
        select: {
          userId: true,
          checkinNumber: true,
          pointsAwarded: true,
          badgeAwarded: true,
          createdAt: true,
        },
        orderBy: { checkinNumber: 'asc' },
      }),
      this.prisma.userSubscription.findMany({
        where: {
          userId: { in: participantIds },
          status: 'ACTIVE',
        },
        select: {
          userId: true,
          plan: { select: { name: true } },
        },
      }),
    ]);

    const confirmationMap = new Map(confirmations.map((c) => [c.userId, c]));
    const checkInsMap = new Map<string, typeof checkIns>();
    for (const ci of checkIns) {
      if (!checkInsMap.has(ci.userId)) {
        checkInsMap.set(ci.userId, []);
      }
      checkInsMap.get(ci.userId)!.push(ci);
    }
    const subscriptionMap = new Map(
      subscriptions.map((s) => [s.userId, s.plan.name]),
    );

    return {
      data: participants.map((p) => {
        const userCheckIns = checkInsMap.get(p.id) || [];
        const confirmation = confirmationMap.get(p.id);
        return {
          userId: p.id,
          userName: p.name,
          userEmail: p.email,
          userAvatar: p.avatarUrl,
          confirmedAt: confirmation?.confirmedAt || null,
          checkIns: userCheckIns.map((ci) => ci.checkinNumber),
          totalPoints: userCheckIns.reduce((sum, ci) => sum + ci.pointsAwarded, 0),
          hasBadge: userCheckIns.some((ci) => ci.badgeAwarded),
          subscriptionPlan: subscriptionMap.get(p.id) || null,
        };
      }),
      meta: {
        currentPage: page,
        perPage,
        totalPages: Math.ceil(totalCount / perPage),
        totalCount,
      },
    };
  }

  // ===========================================
  // HELPERS
  // ===========================================

  private calculateCurrentCheckinNumber(event: {
    startDate: Date;
    checkinsCount: number;
    checkinInterval: number;
    status: EventStatus;
  }): number {
    if (event.status !== 'ONGOING') {
      return 1;
    }

    const now = Date.now();
    const start = event.startDate.getTime();
    const elapsedMinutes = (now - start) / (1000 * 60);
    const checkinNumber = Math.floor(elapsedMinutes / event.checkinInterval) + 1;

    return Math.min(checkinNumber, event.checkinsCount);
  }

  generateSecurityToken(
    eventId: string,
    checkinNumber: number,
    timestamp: number,
    secret: string,
  ): string {
    const data = `${eventId}:${checkinNumber}:${timestamp}`;
    return createHmac('sha256', secret).update(data).digest('hex');
  }

  // Used by DisplayService
  async getEventForDisplay(eventId: string) {
    const [event, uniqueUsersGroups] = await Promise.all([
      this.prisma.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          color: true,
          startDate: true,
          endDate: true,
          locationName: true,
          bannerDisplay: true,
          pointsTotal: true,
          checkinsCount: true,
          checkinInterval: true,
          status: true,
          isPaused: true,
          qrSecret: true,
          association: {
            select: {
              name: true,
              logoUrl: true,
            },
          },
        },
      }),
      this.prisma.eventCheckIn.groupBy({
        by: ['userId'],
        where: { eventId },
      }),
    ]);

    if (!event) return null;

    return {
      ...event,
      _count: { checkIns: uniqueUsersGroups.length },
    };
  }

  async getOngoingEvents(associationId?: string) {
    const where: Prisma.EventWhereInput = { status: 'ONGOING' };
    if (associationId) {
      where.associationId = associationId;
    }
    return this.prisma.event.findMany({
      where,
      select: {
        id: true,
        qrSecret: true,
        checkinsCount: true,
        checkinInterval: true,
        startDate: true,
        status: true,
        isPaused: true,
      },
    });
  }

  // Auto-transition events based on time
  // Returns which events transitioned so the scheduler can broadcast via WebSocket
  async transitionEventStatuses(): Promise<{
    toOngoing: { id: string; isPaused: boolean }[];
    toEnded: { id: string }[];
  }> {
    const now = new Date();

    // Find events that need to transition BEFORE updating
    const toOngoing = await this.prisma.event.findMany({
      where: {
        status: 'SCHEDULED',
        startDate: { lte: now },
      },
      select: { id: true, isPaused: true },
    });

    const toEnded = await this.prisma.event.findMany({
      where: {
        status: 'ONGOING',
        endDate: { lte: now },
      },
      select: { id: true },
    });

    // SCHEDULED -> ONGOING
    if (toOngoing.length > 0) {
      await this.prisma.event.updateMany({
        where: { id: { in: toOngoing.map((e) => e.id) } },
        data: { status: 'ONGOING' },
      });
    }

    // ONGOING -> ENDED
    if (toEnded.length > 0) {
      await this.prisma.event.updateMany({
        where: { id: { in: toEnded.map((e) => e.id) } },
        data: { status: 'ENDED' },
      });
    }

    return { toOngoing, toEnded };
  }

  // ===========================================
  // BANNERS
  // ===========================================

  async updateBannerFeed(
    eventId: string,
    associationId: string,
    bannerUrl: string,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, associationId: true },
    });

    if (!event) throw new NotFoundException('Evento nao encontrado');
    if (event.associationId !== associationId) {
      throw new ForbiddenException('Sem permissao para este evento');
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: { bannerFeed: bannerUrl },
      select: { bannerFeed: true },
    });

    return updated;
  }

  async addBannerDisplay(
    eventId: string,
    associationId: string,
    bannerUrl: string,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, associationId: true, bannerDisplay: true },
    });

    if (!event) throw new NotFoundException('Evento nao encontrado');
    if (event.associationId !== associationId) {
      throw new ForbiddenException('Sem permissao para este evento');
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: { bannerDisplay: [...event.bannerDisplay, bannerUrl] },
      select: { bannerDisplay: true },
    });

    return updated;
  }

  async removeBannerDisplay(
    eventId: string,
    associationId: string,
    index: number,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, associationId: true, bannerDisplay: true },
    });

    if (!event) throw new NotFoundException('Evento nao encontrado');
    if (event.associationId !== associationId) {
      throw new ForbiddenException('Sem permissao para este evento');
    }

    if (index < 0 || index >= event.bannerDisplay.length) {
      throw new BadRequestException('Indice de banner invalido');
    }

    const newBanners = [...event.bannerDisplay];
    newBanners.splice(index, 1);

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: { bannerDisplay: newBanners },
      select: { bannerDisplay: true },
    });

    return updated;
  }

  // ===========================================
  // EXPORT
  // ===========================================

  async exportToCsv(eventId: string, associationId: string): Promise<string> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, associationId: true, checkinsCount: true },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    if (event.associationId !== associationId) {
      throw new ForbiddenException('Sem permissao');
    }

    const data = await this.getParticipants(eventId, associationId, 1, 10000);

    // CSV Header
    const headers = ['Nome', 'Email', 'Plano', 'Confirmado', 'Data Confirmacao', 'Check-ins', 'Pontos', 'Badge'];

    // CSV Rows
    const rows = data.data.map((p) => {
      const confirmedAt = p.confirmedAt
        ? new Date(p.confirmedAt).toLocaleString('pt-BR')
        : '';
      return [
        `"${p.userName.replace(/"/g, '""')}"`,
        p.userEmail,
        p.subscriptionPlan || '',
        p.confirmedAt ? 'Sim' : 'Nao',
        confirmedAt,
        `${p.checkIns.length}/${event.checkinsCount}`,
        p.totalPoints,
        p.hasBadge ? 'Sim' : 'Nao',
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  async exportToPrintHtml(eventId: string, associationId: string): Promise<string> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        associationId: true,
        startDate: true,
        endDate: true,
        locationName: true,
        pointsTotal: true,
        checkinsCount: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Evento nao encontrado');
    }

    if (event.associationId !== associationId) {
      throw new ForbiddenException('Sem permissao');
    }

    const analytics = await this.getAnalytics(eventId, associationId);
    const participants = await this.getParticipants(eventId, associationId, 1, 1000);

    const formatDate = (date: Date) =>
      new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatorio - ${event.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #6366F1;
      border-bottom: 2px solid #6366F1;
      padding-bottom: 10px;
    }
    .info {
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .info p {
      margin: 5px 0;
    }
    .metrics {
      display: flex;
      gap: 20px;
      margin: 20px 0;
    }
    .metric {
      flex: 1;
      padding: 15px;
      background: #6366F1;
      color: white;
      border-radius: 8px;
      text-align: center;
    }
    .metric-value {
      font-size: 32px;
      font-weight: bold;
    }
    .metric-label {
      font-size: 14px;
      opacity: 0.9;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f5f5f5;
      font-weight: bold;
    }
    .badge-yes {
      color: #10B981;
      font-weight: bold;
    }
    .badge-no {
      color: #9CA3AF;
    }
    @media print {
      body { margin: 20px; }
      .metrics { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>${event.title}</h1>

  <div class="info">
    <p><strong>Data:</strong> ${formatDate(event.startDate)} - ${formatDate(event.endDate)}</p>
    <p><strong>Local:</strong> ${event.locationName}</p>
    <p><strong>Pontos totais:</strong> ${event.pointsTotal} (${event.checkinsCount} check-ins)</p>
  </div>

  <div class="metrics">
    <div class="metric">
      <div class="metric-value">${analytics.metrics.confirmations}</div>
      <div class="metric-label">Confirmacoes</div>
    </div>
    <div class="metric">
      <div class="metric-value">${analytics.metrics.uniqueUsers}</div>
      <div class="metric-label">Participantes</div>
    </div>
    <div class="metric">
      <div class="metric-value">${analytics.metrics.totalCheckIns}</div>
      <div class="metric-label">Check-ins</div>
    </div>
    <div class="metric">
      <div class="metric-value">${analytics.metrics.pointsDistributed}</div>
      <div class="metric-label">Pontos</div>
    </div>
    <div class="metric">
      <div class="metric-value">${analytics.metrics.presenceRateConfirmed}%</div>
      <div class="metric-label">Taxa Presenca</div>
    </div>
  </div>

  <h2>Participantes</h2>
  <table>
    <thead>
      <tr>
        <th>Nome</th>
        <th>Email</th>
        <th>Plano</th>
        <th>Confirmado</th>
        <th>Check-ins</th>
        <th>Pontos</th>
        <th>Badge</th>
      </tr>
    </thead>
    <tbody>
      ${participants.data
        .map(
          (p) => `
        <tr>
          <td>${p.userName}</td>
          <td>${p.userEmail}</td>
          <td>${p.subscriptionPlan || '–'}</td>
          <td>${p.confirmedAt ? 'Sim' : 'Nao'}</td>
          <td>${p.checkIns.length}/${event.checkinsCount}</td>
          <td>${p.totalPoints}</td>
          <td class="${p.hasBadge ? 'badge-yes' : 'badge-no'}">${p.hasBadge ? 'Sim' : 'Nao'}</td>
        </tr>
      `,
        )
        .join('')}
    </tbody>
  </table>

  <p style="margin-top: 40px; font-size: 12px; color: #9CA3AF;">
    Gerado em ${new Date().toLocaleString('pt-BR')} | Total: ${participants.meta.totalCount} participantes
  </p>
</body>
</html>
    `;
  }
}
