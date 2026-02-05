import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ChatService } from '../chat.service';
import { ChatMessageDto, RateChatDto } from '../dto/chat.dto';

interface AuthUser {
  id: string;
  associationId: string;
  role: string;
}

@ApiTags('support')
@Controller('support/chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Iniciar chat de suporte (entrar na fila)' })
  @ApiResponse({ status: 201, description: 'Sessão de chat criada' })
  @ApiResponse({ status: 400, description: 'Já possui chat ativo' })
  async connect(@CurrentUser() user: AuthUser) {
    return this.chatService.connect(user.id, user.associationId);
  }

  @Get('status')
  @ApiOperation({ summary: 'Status do chat atual' })
  @ApiResponse({ status: 200, description: 'Status do chat' })
  @ApiResponse({ status: 404, description: 'Nenhum chat ativo' })
  async getStatus(@CurrentUser() user: AuthUser) {
    return this.chatService.getStatus(user.id);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Mensagens do chat atual' })
  @ApiQuery({ name: 'before', required: false, description: 'ID da mensagem para paginação' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de mensagens' })
  @ApiResponse({ status: 200, description: 'Lista de mensagens' })
  async getMessages(
    @CurrentUser() user: AuthUser,
    @Query('before') before?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getMessages(user.id, before, limit ? parseInt(limit, 10) : 50);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Enviar mensagem no chat' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada' })
  @ApiResponse({ status: 400, description: 'Chat não está ativo' })
  async sendMessage(@CurrentUser() user: AuthUser, @Body() dto: ChatMessageDto) {
    return this.chatService.sendMessage(user.id, dto);
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Encerrar chat' })
  @ApiResponse({ status: 200, description: 'Chat encerrado' })
  async disconnect(@CurrentUser() user: AuthUser) {
    return this.chatService.disconnect(user.id);
  }

  @Post('rating')
  @ApiOperation({ summary: 'Avaliar chat de suporte' })
  @ApiResponse({ status: 201, description: 'Avaliação registrada' })
  @ApiResponse({ status: 400, description: 'Chat não encerrado' })
  @ApiResponse({ status: 409, description: 'Chat já avaliado' })
  async rateChat(@CurrentUser() user: AuthUser, @Body() dto: RateChatDto) {
    return this.chatService.rateChat(user.id, dto);
  }
}
