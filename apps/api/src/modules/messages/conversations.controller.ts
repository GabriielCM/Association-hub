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
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationQueryDto, MessageQueryDto } from './dto/conversation-query.dto';
import { UpdateConversationSettingsDto } from './dto/update-conversation-settings.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Conversas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar conversas do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de conversas' })
  async findAll(@CurrentUser() user: JwtPayload, @Query() query: ConversationQueryDto) {
    return this.messagesService.findAllConversations(user.sub, query);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova conversa' })
  @ApiResponse({ status: 201, description: 'Conversa criada' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateConversationDto) {
    return this.messagesService.createConversation(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Detalhes da conversa' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.messagesService.findConversation(user.sub, id);
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
    return this.messagesService.updateConversationSettings(user.sub, id, dto);
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
    return this.messagesService.findMessages(user.sub, id, query);
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
    return this.messagesService.sendMessage(user.sub, id, dto);
  }
}
