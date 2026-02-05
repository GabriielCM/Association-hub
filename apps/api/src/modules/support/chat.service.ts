import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatSessionStatus, SenderType, NotificationType, NotificationCategory } from '@prisma/client';
import { ChatMessageDto, RateChatDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Connect to chat (enter queue)
   */
  async connect(userId: string, associationId: string) {
    // Check if user already has an active session
    const existingSession = await this.prisma.chatSession.findFirst({
      where: {
        userId,
        status: { in: [ChatSessionStatus.QUEUED, ChatSessionStatus.ACTIVE] },
      },
    });

    if (existingSession) {
      throw new ConflictException({
        code: 'ALREADY_IN_QUEUE',
        message: 'User already has an active chat session',
      });
    }

    // Get current queue position
    const queuePosition = await this.prisma.chatSession.count({
      where: {
        associationId,
        status: ChatSessionStatus.QUEUED,
      },
    });

    const session = await this.prisma.chatSession.create({
      data: {
        userId,
        associationId,
        status: ChatSessionStatus.QUEUED,
        queuePosition: queuePosition + 1,
      },
    });

    this.logger.log(`User ${userId} joined chat queue at position ${queuePosition + 1}`);

    return {
      data: {
        sessionId: session.id,
        status: session.status,
        queuePosition: session.queuePosition,
        estimatedMinutes: Math.ceil((queuePosition + 1) * 2), // ~2 min per person
      },
    };
  }

  /**
   * Get current chat status
   */
  async getStatus(userId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: {
        userId,
        status: { in: [ChatSessionStatus.QUEUED, ChatSessionStatus.ACTIVE] },
      },
    });

    if (!session) {
      return { data: null };
    }

    if (session.status === ChatSessionStatus.QUEUED) {
      // Recalculate queue position
      const position = await this.prisma.chatSession.count({
        where: {
          associationId: session.associationId,
          status: ChatSessionStatus.QUEUED,
          createdAt: { lt: session.createdAt },
        },
      });

      return {
        data: {
          sessionId: session.id,
          status: session.status,
          queuePosition: position + 1,
          estimatedMinutes: Math.ceil((position + 1) * 2),
        },
      };
    }

    // Active session - get agent info
    let agent = null;
    if (session.agentId) {
      const agentUser = await this.prisma.user.findUnique({
        where: { id: session.agentId },
        select: { id: true, name: true, avatarUrl: true },
      });
      agent = agentUser;
    }

    return {
      data: {
        sessionId: session.id,
        status: session.status,
        agent,
        startedAt: session.startedAt,
      },
    };
  }

  /**
   * Get chat messages
   */
  async getMessages(userId: string, before?: string, limit: number = 50) {
    const session = await this.prisma.chatSession.findFirst({
      where: {
        userId,
        status: ChatSessionStatus.ACTIVE,
      },
    });

    if (!session) {
      throw new BadRequestException({
        code: 'NO_ACTIVE_SESSION',
        message: 'No active chat session',
      });
    }

    const where: any = { sessionId: session.id };
    if (before) {
      const beforeMsg = await this.prisma.chatMessage.findUnique({ where: { id: before } });
      if (beforeMsg) {
        where.createdAt = { lt: beforeMsg.createdAt };
      }
    }

    const messages = await this.prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // +1 to check if there are more
      include: {
        attachments: true,
      },
    });

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();

    return {
      data: messages.reverse(),
      meta: { hasMore },
    };
  }

  /**
   * Send chat message (user)
   */
  async sendMessage(userId: string, dto: ChatMessageDto) {
    const session = await this.prisma.chatSession.findFirst({
      where: {
        userId,
        status: ChatSessionStatus.ACTIVE,
      },
    });

    if (!session) {
      const queuedSession = await this.prisma.chatSession.findFirst({
        where: { userId, status: ChatSessionStatus.QUEUED },
      });

      if (queuedSession) {
        throw new BadRequestException({
          code: 'SESSION_NOT_CONNECTED',
          message: 'Still waiting in queue for an agent',
        });
      }

      throw new BadRequestException({
        code: 'NO_ACTIVE_SESSION',
        message: 'No active chat session',
      });
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        senderType: SenderType.USER,
        senderId: userId,
        content: dto.content,
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

    this.logger.log(`User ${userId} sent chat message`);

    // TODO: Emit WebSocket event to agent

    return { data: message };
  }

  /**
   * Disconnect from chat (user)
   */
  async disconnect(userId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: {
        userId,
        status: { in: [ChatSessionStatus.QUEUED, ChatSessionStatus.ACTIVE] },
      },
    });

    if (!session) {
      throw new NotFoundException('No active session found');
    }

    const updated = await this.prisma.chatSession.update({
      where: { id: session.id },
      data: {
        status: ChatSessionStatus.ENDED,
        endedAt: new Date(),
      },
    });

    // Recalculate queue positions if user was in queue
    if (session.status === ChatSessionStatus.QUEUED) {
      await this.recalculateQueuePositions(session.associationId);
    }

    this.logger.log(`User ${userId} disconnected from chat`);

    return {
      data: {
        sessionId: updated.id,
        status: updated.status,
        endedAt: updated.endedAt,
      },
    };
  }

  /**
   * Rate chat session
   */
  async rateChat(userId: string, dto: RateChatDto) {
    // Find the most recent ended session
    const session = await this.prisma.chatSession.findFirst({
      where: {
        userId,
        status: ChatSessionStatus.ENDED,
      },
      orderBy: { endedAt: 'desc' },
      include: { rating: true },
    });

    if (!session) {
      throw new NotFoundException('No completed chat session found');
    }

    if (session.rating) {
      throw new ConflictException({
        code: 'ALREADY_RATED',
        message: 'Chat session has already been rated',
      });
    }

    const rating = await this.prisma.chatRating.create({
      data: {
        sessionId: session.id,
        rating: Number(dto.rating),
        comment: dto.comment,
      },
    });

    this.logger.log(`User ${userId} rated chat session with ${dto.rating} stars`);

    return { data: rating };
  }

  // =====================================
  // ADMIN METHODS
  // =====================================

  /**
   * Get chat queue (admin)
   */
  async getQueue(associationId: string) {
    const sessions = await this.prisma.chatSession.findMany({
      where: {
        associationId,
        status: ChatSessionStatus.QUEUED,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    const now = new Date();

    return {
      data: sessions.map((s) => ({
        sessionId: s.id,
        user: s.user,
        waitingSince: s.createdAt,
        waitingMinutes: Math.floor((now.getTime() - s.createdAt.getTime()) / 60000),
      })),
      meta: {
        totalWaiting: sessions.length,
      },
    };
  }

  /**
   * Get active chats for agent (admin)
   */
  async getActiveChats(agentId: string) {
    const sessions = await this.prisma.chatSession.findMany({
      where: {
        agentId,
        status: ChatSessionStatus.ACTIVE,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    const now = new Date();

    return {
      data: sessions.map((s) => ({
        sessionId: s.id,
        user: s.user,
        startedAt: s.startedAt,
        durationMinutes: s.startedAt ? Math.floor((now.getTime() - s.startedAt.getTime()) / 60000) : 0,
        messageCount: s._count.messages,
      })),
    };
  }

  /**
   * Accept chat from queue (admin)
   */
  async acceptChat(sessionId: string, agentId: string, agentName: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, status: ChatSessionStatus.QUEUED },
      include: { user: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found or already accepted');
    }

    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: ChatSessionStatus.ACTIVE,
        agentId,
        startedAt: new Date(),
        queuePosition: null,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Recalculate queue positions
    await this.recalculateQueuePositions(session.associationId);

    this.logger.log(`Agent ${agentId} accepted chat session ${sessionId}`);

    // Notify user
    await this.notificationsService.create({
      userId: session.userId,
      type: NotificationType.ADMIN_ANNOUNCEMENT,
      category: NotificationCategory.SYSTEM,
      title: 'Chat ao vivo',
      body: 'Um atendente está pronto para ajudá-lo!',
      data: { sessionId },
    });

    return {
      data: {
        sessionId: updated.id,
        status: updated.status,
        user: updated.user,
        startedAt: updated.startedAt,
      },
    };
  }

  /**
   * Send message as agent (admin)
   */
  async sendAgentMessage(sessionId: string, agentId: string, dto: ChatMessageDto) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, agentId, status: ChatSessionStatus.ACTIVE },
    });

    if (!session) {
      throw new NotFoundException('Active session not found');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        sessionId,
        senderType: SenderType.AGENT,
        senderId: agentId,
        content: dto.content,
        ...(dto.attachmentIds?.length && {
          attachments: {
            create: await this.linkAttachments(dto.attachmentIds, agentId),
          },
        }),
      },
      include: {
        attachments: true,
      },
    });

    this.logger.log(`Agent ${agentId} sent chat message`);

    // TODO: Emit WebSocket event to user

    return { data: message };
  }

  /**
   * End chat session (admin)
   */
  async endChat(sessionId: string, agentId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, agentId, status: ChatSessionStatus.ACTIVE },
    });

    if (!session) {
      throw new NotFoundException('Active session not found');
    }

    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: ChatSessionStatus.ENDED,
        endedAt: new Date(),
      },
    });

    this.logger.log(`Agent ${agentId} ended chat session ${sessionId}`);

    // Notify user
    await this.notificationsService.create({
      userId: session.userId,
      type: NotificationType.ADMIN_ANNOUNCEMENT,
      category: NotificationCategory.SYSTEM,
      title: 'Chat encerrado',
      body: 'Sua sessão de chat foi encerrada. Avalie o atendimento!',
      data: { sessionId },
    });

    return {
      data: {
        sessionId: updated.id,
        status: updated.status,
        endedAt: updated.endedAt,
      },
    };
  }

  /**
   * Transfer chat to another agent
   */
  async transferChat(sessionId: string, fromAgentId: string, toAgentId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, agentId: fromAgentId, status: ChatSessionStatus.ACTIVE },
    });

    if (!session) {
      throw new NotFoundException('Active session not found');
    }

    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { agentId: toAgentId },
    });

    this.logger.log(`Chat ${sessionId} transferred from ${fromAgentId} to ${toAgentId}`);

    return { data: updated };
  }

  // =====================================
  // PRIVATE HELPERS
  // =====================================

  private async recalculateQueuePositions(associationId: string) {
    const queuedSessions = await this.prisma.chatSession.findMany({
      where: {
        associationId,
        status: ChatSessionStatus.QUEUED,
      },
      orderBy: { createdAt: 'asc' },
    });

    await this.prisma.$transaction(
      queuedSessions.map((session, index) =>
        this.prisma.chatSession.update({
          where: { id: session.id },
          data: { queuePosition: index + 1 },
        }),
      ),
    );
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
}
