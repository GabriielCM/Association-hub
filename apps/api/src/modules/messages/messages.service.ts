import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  ConversationType,
  ConversationRole,
  MessageContentType,
  MessageStatus,
  Message,
  Conversation,
  ConversationParticipant,
  ConversationGroup,
} from '@prisma/client';
import {
  ConversationWithDetails,
  MessageWithSender,
  ReactionSummary,
} from './message.types';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationQueryDto, MessageQueryDto } from './dto/conversation-query.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UpdateConversationSettingsDto } from './dto/update-conversation-settings.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // CONVERSATIONS
  // ============================================

  async createConversation(
    userId: string,
    dto: CreateConversationDto
  ): Promise<Conversation> {
    const { type, participantIds, groupName, groupDescription, groupImageUrl } = dto;

    // Validate participants
    if (type === ConversationType.DIRECT) {
      if (participantIds.length !== 1) {
        throw new BadRequestException('Conversa direta deve ter exatamente 1 participante');
      }

      // Check if direct conversation already exists
      const existing = await this.findDirectConversation(userId, participantIds[0]);
      if (existing) {
        return existing;
      }
    }

    if (type === ConversationType.GROUP && !groupName) {
      throw new BadRequestException('Nome do grupo é obrigatório');
    }

    // Create conversation with participants
    const conversation = await this.prisma.conversation.create({
      data: {
        type,
        participants: {
          create: [
            { userId, role: type === ConversationType.GROUP ? ConversationRole.ADMIN : ConversationRole.MEMBER },
            ...participantIds.map((id) => ({
              userId: id,
              role: ConversationRole.MEMBER,
            })),
          ],
        },
        ...(type === ConversationType.GROUP && {
          group: {
            create: {
              name: groupName!,
              description: groupDescription,
              imageUrl: groupImageUrl,
              createdById: userId,
            },
          },
        }),
      },
      include: {
        participants: true,
        group: true,
      },
    });

    return conversation;
  }

  async findDirectConversation(userId: string, otherUserId: string): Promise<Conversation | null> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        type: ConversationType.DIRECT,
        participants: {
          every: {
            userId: { in: [userId, otherUserId] },
            leftAt: null,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    // Find conversation with exactly these two participants
    return conversations.find(
      (c) =>
        c.participants.length === 2 &&
        c.participants.some((p) => p.userId === userId) &&
        c.participants.some((p) => p.userId === otherUserId)
    ) || null;
  }

  async findAllConversations(
    userId: string,
    query: ConversationQueryDto
  ): Promise<{ data: any[]; pagination: { total: number; limit: number; offset: number } }> {
    const { includeArchived, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const baseWhere = {
      participants: {
        some: {
          userId,
          leftAt: null,
          ...(includeArchived ? {} : { isArchived: false }),
        },
      },
    };

    const [conversationsRaw, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: baseWhere,
        include: {
          participants: {
            where: { leftAt: null },
            include: {
              user: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
          },
          group: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.conversation.count({ where: baseWhere }),
    ]);

    // Calculate unread counts
    const conversations = await Promise.all(
      conversationsRaw.map(async (conv) => {
        const participant = conv.participants.find((p) => p.userId === userId);
        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            createdAt: { gt: participant?.lastReadAt || new Date(0) },
            deletedAt: null,
          },
        });

        const lastMessage = conv.messages[0];

        return {
          id: conv.id,
          type: conv.type,
          participants: conv.participants.map((p) => ({
            id: p.userId,
            name: p.user.name,
            avatarUrl: p.user.avatarUrl || undefined,
            role: p.role,
            isOnline: false, // Set by gateway
            lastSeenAt: undefined,
          })),
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                contentType: lastMessage.contentType,
                senderId: lastMessage.senderId,
                senderName: lastMessage.sender.name,
                createdAt: lastMessage.createdAt,
                isEncrypted: lastMessage.isEncrypted,
              }
            : undefined,
          unreadCount,
          isMuted: participant?.isMuted ?? false,
          isArchived: participant?.isArchived ?? false,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          group: conv.group
            ? {
                id: conv.group.id,
                name: conv.group.name,
                imageUrl: conv.group.imageUrl || undefined,
                participantsCount: conv.participants.length,
              }
            : undefined,
        };
      })
    );

    return {
      data: conversations,
      pagination: {
        total,
        limit,
        offset: skip,
      },
    };
  }

  async findConversation(userId: string, conversationId: string): Promise<Conversation> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { userId, leftAt: null },
        },
      },
      include: {
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        group: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    return conversation;
  }

  async updateConversationSettings(
    userId: string,
    conversationId: string,
    dto: UpdateConversationSettingsDto
  ): Promise<ConversationParticipant> {
    await this.findConversation(userId, conversationId);

    return this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: {
        ...(dto.isMuted !== undefined && { isMuted: dto.isMuted }),
        ...(dto.isArchived !== undefined && { isArchived: dto.isArchived }),
      },
    });
  }

  async leaveConversation(userId: string, conversationId: string): Promise<void> {
    const conversation = await this.findConversation(userId, conversationId);

    if (conversation.type === ConversationType.DIRECT) {
      throw new BadRequestException('Não é possível sair de uma conversa direta');
    }

    await this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: { leftAt: new Date() },
    });
  }

  // ============================================
  // MESSAGES
  // ============================================

  async findMessages(
    userId: string,
    conversationId: string,
    query: MessageQueryDto
  ): Promise<{ data: MessageWithSender[]; pagination: { hasMore: boolean; oldestId?: string } }> {
    await this.findConversation(userId, conversationId);

    const { page = 1, limit = 50, before } = query;
    const skip = (page - 1) * limit;

    const whereCondition = {
      conversationId,
      deletedAt: null,
      ...(before && { createdAt: { lt: new Date(before) } }),
    };

    const messagesRaw = await this.prisma.message.findMany({
      where: whereCondition,
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
        replyTo: {
          include: {
            sender: {
              select: { id: true, name: true },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit + 1, // Fetch one extra to check hasMore
    });

    const hasMore = messagesRaw.length > limit;
    const messages = messagesRaw.slice(0, limit);

    const mapped = messages.map((m) => this.mapMessageWithSender(m, userId));
    return {
      data: mapped,
      pagination: {
        hasMore,
        oldestId: mapped.length > 0 ? mapped[mapped.length - 1].id : undefined,
      },
    };
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto
  ): Promise<MessageWithSender> {
    await this.findConversation(userId, conversationId);

    const {
      content = '',
      contentType = MessageContentType.TEXT,
      mediaUrl,
      mediaDuration,
      replyToId,
      encryptedContent,
      nonce,
      isEncrypted = false,
    } = dto;

    // Validate reply
    if (replyToId) {
      const replyMessage = await this.prisma.message.findFirst({
        where: { id: replyToId, conversationId, deletedAt: null },
      });
      if (!replyMessage) {
        throw new BadRequestException('Mensagem de resposta não encontrada');
      }
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: isEncrypted ? '[encrypted]' : content,
        contentType,
        mediaUrl,
        mediaDuration: mediaDuration ? Math.round(mediaDuration) : undefined,
        replyToId,
        status: MessageStatus.SENT,
        encryptedContent: isEncrypted ? encryptedContent : undefined,
        nonce: isEncrypted ? nonce : undefined,
        isEncrypted,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
        replyTo: {
          include: {
            sender: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Update conversation timestamp
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return this.mapMessageWithSender(message, userId);
  }

  async deleteMessage(userId: string, messageId: string): Promise<Message> {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, senderId: userId, deletedAt: null },
    });

    if (!message) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  }

  async forwardMessage(
    userId: string,
    messageId: string,
    conversationIds: string[]
  ): Promise<{ forwarded: number }> {
    const original = await this.prisma.message.findFirst({
      where: { id: messageId, deletedAt: null },
      include: { conversation: { include: { participants: true } } },
    });

    if (!original) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    const isParticipant = original.conversation.participants.some(
      (p) => p.userId === userId && p.leftAt === null
    );

    if (!isParticipant) {
      throw new ForbiddenException('Você não tem acesso a esta mensagem');
    }

    let forwarded = 0;
    for (const convId of conversationIds) {
      await this.findConversation(userId, convId);
      await this.prisma.message.create({
        data: {
          conversationId: convId,
          senderId: userId,
          content: original.content,
          contentType: original.contentType,
          mediaUrl: original.mediaUrl,
          mediaDuration: original.mediaDuration,
          status: MessageStatus.SENT,
        },
      });
      await this.prisma.conversation.update({
        where: { id: convId },
        data: { updatedAt: new Date() },
      });
      forwarded++;
    }

    return { forwarded };
  }

  async markConversationAsRead(userId: string, conversationId: string): Promise<void> {
    await this.findConversation(userId, conversationId);

    await this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: { lastReadAt: new Date() },
    });
  }

  // ============================================
  // REACTIONS
  // ============================================

  async addReaction(userId: string, messageId: string, emoji: string): Promise<void> {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, deletedAt: null },
      include: { conversation: { include: { participants: true } } },
    });

    if (!message) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    const isParticipant = message.conversation.participants.some(
      (p) => p.userId === userId && p.leftAt === null
    );

    if (!isParticipant) {
      throw new ForbiddenException('Você não é participante desta conversa');
    }

    await this.prisma.messageReaction.upsert({
      where: {
        messageId_userId_emoji: { messageId, userId, emoji },
      },
      create: { messageId, userId, emoji },
      update: {},
    });
  }

  async removeReaction(userId: string, messageId: string, emoji: string): Promise<void> {
    await this.prisma.messageReaction.deleteMany({
      where: { messageId, userId, emoji },
    });
  }

  // ============================================
  // GROUPS
  // ============================================

  async getGroup(userId: string, conversationId: string) {
    const conversation = await this.findConversation(userId, conversationId);

    if (conversation.type !== ConversationType.GROUP) {
      throw new BadRequestException('Esta conversa não é um grupo');
    }

    const group = await this.prisma.conversationGroup.findUnique({
      where: { conversationId },
    });

    if (!group) {
      throw new NotFoundException('Grupo não encontrado');
    }

    const participants = await this.prisma.conversationParticipant.findMany({
      where: { conversationId, leftAt: null },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    const mediaCount = await this.prisma.message.count({
      where: { conversationId, mediaUrl: { not: null } },
    });

    return { group, participants, mediaCount };
  }

  async updateGroup(
    userId: string,
    conversationId: string,
    dto: UpdateGroupDto
  ): Promise<ConversationGroup> {
    await this.validateGroupAdmin(userId, conversationId);

    return this.prisma.conversationGroup.update({
      where: { conversationId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      },
    });
  }

  async addParticipants(
    userId: string,
    conversationId: string,
    participantIds: string[]
  ): Promise<void> {
    await this.validateGroupAdmin(userId, conversationId);

    // Add participants who are not already in the group
    for (const participantId of participantIds) {
      const existing = await this.prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId, userId: participantId } },
      });

      if (existing && !existing.leftAt) {
        continue; // Already a participant
      }

      if (existing && existing.leftAt) {
        // Rejoin
        await this.prisma.conversationParticipant.update({
          where: { id: existing.id },
          data: { leftAt: null, joinedAt: new Date() },
        });
      } else {
        // New participant
        await this.prisma.conversationParticipant.create({
          data: {
            conversationId,
            userId: participantId,
            role: ConversationRole.MEMBER,
          },
        });
      }
    }
  }

  async removeParticipant(
    userId: string,
    conversationId: string,
    participantId: string
  ): Promise<void> {
    await this.validateGroupAdmin(userId, conversationId);

    if (userId === participantId) {
      throw new BadRequestException('Use o endpoint de sair do grupo para se remover');
    }

    await this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId: participantId },
      },
      data: { leftAt: new Date() },
    });
  }

  async promoteToAdmin(
    userId: string,
    conversationId: string,
    participantId: string
  ): Promise<void> {
    await this.validateGroupAdmin(userId, conversationId);

    await this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId: participantId },
      },
      data: { role: ConversationRole.ADMIN },
    });
  }

  // ============================================
  // HELPERS
  // ============================================

  private async validateGroupAdmin(userId: string, conversationId: string): Promise<void> {
    const conversation = await this.findConversation(userId, conversationId);

    if (conversation.type !== ConversationType.GROUP) {
      throw new BadRequestException('Esta conversa não é um grupo');
    }

    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });

    if (!participant || participant.role !== ConversationRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem realizar esta ação');
    }
  }

  private mapMessageWithSender(message: any, currentUserId: string): MessageWithSender {
    // Group reactions by emoji
    const reactionMap = new Map<string, { count: number; users: { userId: string; name: string }[]; hasReacted: boolean }>();

    for (const r of message.reactions || []) {
      if (!reactionMap.has(r.emoji)) {
        reactionMap.set(r.emoji, { count: 0, users: [], hasReacted: false });
      }
      const entry = reactionMap.get(r.emoji)!;
      entry.count++;
      entry.users.push({ userId: r.userId, name: r.user.name });
      if (r.userId === currentUserId) {
        entry.hasReacted = true;
      }
    }

    const reactions: ReactionSummary[] = Array.from(reactionMap.entries()).map(
      ([emoji, data]) => ({ emoji, ...data })
    );

    return {
      id: message.id,
      conversationId: message.conversationId,
      sender: {
        id: message.senderId,
        name: message.sender.name,
        avatarUrl: message.sender.avatarUrl || undefined,
      },
      content: message.content,
      contentType: message.contentType,
      mediaUrl: message.mediaUrl || undefined,
      mediaDuration: message.mediaDuration || undefined,
      replyTo: message.replyTo
        ? {
            id: message.replyTo.id,
            content: message.replyTo.content,
            contentType: message.replyTo.contentType,
            senderId: message.replyTo.senderId,
            senderName: message.replyTo.sender.name,
            createdAt: message.replyTo.createdAt,
          }
        : undefined,
      status: message.status,
      reactions,
      createdAt: message.createdAt,
      deletedAt: message.deletedAt || undefined,
      // E2E Encryption
      encryptedContent: message.encryptedContent || undefined,
      nonce: message.nonce || undefined,
      isEncrypted: message.isEncrypted,
    };
  }

  async getConversationParticipants(conversationId: string): Promise<string[]> {
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { conversationId, leftAt: null },
      select: { userId: true },
    });
    return participants.map((p) => p.userId);
  }

  /**
   * Get all user IDs that share a conversation with the given user.
   */
  async getContactUserIds(userId: string): Promise<string[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId, leftAt: null },
        },
      },
      select: {
        participants: {
          where: { leftAt: null },
          select: { userId: true },
        },
      },
    });

    const contactIds = new Set<string>();
    for (const conv of conversations) {
      for (const p of conv.participants) {
        if (p.userId !== userId) {
          contactIds.add(p.userId);
        }
      }
    }
    return Array.from(contactIds);
  }

  /**
   * Get all conversation IDs that a user participates in.
   */
  async getUserConversationIds(userId: string): Promise<string[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: { some: { userId, leftAt: null } },
      },
      select: { id: true },
    });
    return conversations.map((c) => c.id);
  }

  // ─── E2E Encryption Key Bundles ────────────────────────────

  async getKeyBundle(userId: string, conversationId: string) {
    await this.findConversation(userId, conversationId);

    const bundle = await this.prisma.conversationKeyBundle.findFirst({
      where: { conversationId, userId },
      orderBy: { version: 'desc' },
    });

    if (!bundle) {
      return null;
    }

    return {
      encryptedKey: bundle.encryptedKey,
      nonce: bundle.nonce,
      senderPublicKey: bundle.senderPublicKey,
      version: bundle.version,
    };
  }

  async createKeyBundles(
    userId: string,
    conversationId: string,
    bundles: { userId: string; encryptedKey: string; nonce: string; senderPublicKey: string }[]
  ) {
    await this.findConversation(userId, conversationId);

    // Get current max version
    const maxVersion = await this.prisma.conversationKeyBundle.findFirst({
      where: { conversationId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const version = (maxVersion?.version ?? 0) + 1;

    const created = await this.prisma.conversationKeyBundle.createMany({
      data: bundles.map((b) => ({
        conversationId,
        userId: b.userId,
        encryptedKey: b.encryptedKey,
        nonce: b.nonce,
        senderPublicKey: b.senderPublicKey,
        version,
      })),
      skipDuplicates: true,
    });

    return { created: created.count, version };
  }
}
