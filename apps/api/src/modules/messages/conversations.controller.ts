import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/types';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationQueryDto, MessageQueryDto } from './dto/conversation-query.dto';
import { UpdateConversationSettingsDto } from './dto/update-conversation-settings.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Conversas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  private readonly logger = new Logger(ConversationsController.name);

  constructor(
    private readonly messagesService: MessagesService,
    private readonly gateway: MessagesGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar conversas do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de conversas' })
  async findAll(@CurrentUser() user: JwtPayload, @Query() query: ConversationQueryDto) {
    const result = await this.messagesService.findAllConversations(user.sub, query);
    // Enrich participants with real-time online status from gateway
    const enrichedData = result.data.map((conv: any) => ({
      ...conv,
      participants: conv.participants.map((p: any) => ({
        ...p,
        isOnline: this.gateway.isUserOnline(p.id),
      })),
    }));
    return { success: true, data: { ...result, data: enrichedData } };
  }

  @Get('presence/online')
  @ApiOperation({ summary: 'Obter usuários online entre contatos' })
  @ApiResponse({ status: 200, description: 'Lista de IDs de usuários online' })
  async getOnlineContacts(@CurrentUser() user: JwtPayload) {
    const contactIds = await this.messagesService.getContactUserIds(user.sub);
    const onlineIds = contactIds.filter((id) => this.gateway.isUserOnline(id));
    return { success: true, data: { userIds: onlineIds } };
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova conversa' })
  @ApiResponse({ status: 201, description: 'Conversa criada' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateConversationDto) {
    const data = await this.messagesService.createConversation(user.sub, dto);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Detalhes da conversa' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const data = await this.messagesService.findConversation(user.sub, id);
    // Map participants to flat structure (Prisma returns nested user objects)
    const enriched = {
      ...data,
      participants: (data as any).participants.map((p: any) => ({
        id: p.userId ?? p.id,
        name: p.user?.name ?? p.name,
        avatarUrl: p.user?.avatarUrl ?? p.avatarUrl ?? undefined,
        role: p.role,
        isOnline: this.gateway.isUserOnline(p.userId ?? p.id),
        lastSeenAt: undefined,
      })),
      group: (data as any).group
        ? {
            id: (data as any).group.id,
            name: (data as any).group.name,
            imageUrl: (data as any).group.imageUrl || undefined,
            participantsCount: (data as any).participants.length,
          }
        : undefined,
    };
    return { success: true, data: enriched };
  }

  @Put(':id/settings')
  @ApiOperation({ summary: 'Atualizar configurações da conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Configurações atualizadas' })
  async updateSettings(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateConversationSettingsDto
  ) {
    const data = await this.messagesService.updateConversationSettings(user.sub, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Sair da conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 204, description: 'Saiu da conversa' })
  async leave(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.messagesService.leaveConversation(user.sub, id);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar conversa como lida' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Conversa marcada como lida' })
  async markAsRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.messagesService.markConversationAsRead(user.sub, id);
    return { success: true };
  }

  @Post(':id/typing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Indicar que está digitando' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Status de digitação atualizado' })
  async typing(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    // This is handled via WebSocket, but we provide an HTTP fallback
    return { success: true };
  }

  // ============================================
  // MESSAGES
  // ============================================

  @Get(':id/messages')
  @ApiOperation({ summary: 'Listar mensagens da conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Lista de mensagens' })
  async findMessages(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query() query: MessageQueryDto
  ) {
    const data = await this.messagesService.findMessages(user.sub, id, query);
    return { success: true, data };
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Enviar mensagem' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada' })
  async sendMessage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: SendMessageDto
  ) {
    const data = await this.messagesService.sendMessage(user.sub, id, dto);

    // Broadcast via WebSocket to conversation participants
    this.gateway.broadcastNewMessage(id, data);

    // Send push notifications to offline participants (non-blocking)
    this.sendPushToOfflineParticipants(id, user.sub, data).catch((err) => {
      this.logger.error('Failed to send push to offline participants:', err);
    });

    return { success: true, data };
  }

  /**
   * Send push notifications to participants who are not connected via WebSocket.
   */
  private async sendPushToOfflineParticipants(
    conversationId: string,
    senderId: string,
    message: { sender: { name: string }; content: string; contentType: string; mediaUrl?: string },
  ) {
    // Get conversation participants via service
    const conversation = await this.messagesService.findConversation(senderId, conversationId) as any;
    if (!conversation?.participants) return;

    // Filter out the sender and online users
    const offlineParticipantIds = conversation.participants
      .map((p: any) => p.user?.id || p.userId)
      .filter((id: string) => id && id !== senderId && !this.gateway.isUserOnline(id));

    if (offlineParticipantIds.length === 0) return;

    // Build push content based on conversation type
    const senderName = message.sender.name;
    const isGroup = conversation.type === 'GROUP';
    const groupName = conversation.group?.name as string | undefined;

    let body: string;
    switch (message.contentType) {
      case 'IMAGE':
        body = '📷 Foto';
        break;
      case 'AUDIO':
        body = '🎤 Áudio';
        break;
      default:
        body = message.content;
    }

    // For groups: title = group name, body = "SenderName: content"
    // For direct: title = sender name, body = content
    const title = isGroup && groupName ? groupName : senderName;
    if (isGroup) {
      body = `${senderName}: ${body}`;
    }

    await this.notificationsService.sendPushToUsers(
      offlineParticipantIds,
      title,
      body,
      {
        conversationId,
        type: 'message',
        mediaUrl: message.mediaUrl,
        groupName,
        senderName,
      },
    );
  }
}
