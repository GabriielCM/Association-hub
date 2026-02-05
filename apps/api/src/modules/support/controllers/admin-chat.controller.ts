import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ChatService } from '../chat.service';
import { ChatMessageDto, TransferChatDto } from '../dto/chat.dto';

interface AuthUser {
  id: string;
  associationId: string;
  role: string;
}

@ApiTags('admin/support')
@Controller('admin/support/chat')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('queue')
  @ApiOperation({ summary: 'Fila de espera de chats' })
  @ApiResponse({ status: 200, description: 'Lista de sessões aguardando atendimento' })
  async getQueue(@CurrentUser() user: AuthUser) {
    return this.chatService.getQueue(user.associationId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Chats ativos do atendente' })
  @ApiResponse({ status: 200, description: 'Lista de sessões ativas' })
  async getActiveChats(@CurrentUser() user: AuthUser) {
    return this.chatService.getActiveChats(user.id);
  }

  @Post('accept/:sessionId')
  @ApiOperation({ summary: 'Aceitar chat da fila' })
  @ApiParam({ name: 'sessionId', description: 'ID da sessão de chat' })
  @ApiResponse({ status: 200, description: 'Chat aceito' })
  @ApiResponse({ status: 400, description: 'Chat não está na fila' })
  async acceptChat(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
  ) {
    return this.chatService.acceptChat(sessionId, user.id, user.id); // Using user.id as name for now
  }

  @Post(':sessionId/messages')
  @ApiOperation({ summary: 'Enviar mensagem como atendente' })
  @ApiParam({ name: 'sessionId', description: 'ID da sessão de chat' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada' })
  @ApiResponse({ status: 403, description: 'Não é o atendente desta sessão' })
  async sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
    @Body() dto: ChatMessageDto,
  ) {
    return this.chatService.sendAgentMessage(sessionId, user.id, dto);
  }

  @Post(':sessionId/end')
  @ApiOperation({ summary: 'Encerrar chat' })
  @ApiParam({ name: 'sessionId', description: 'ID da sessão de chat' })
  @ApiResponse({ status: 200, description: 'Chat encerrado' })
  async endChat(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
  ) {
    return this.chatService.endChat(sessionId, user.id);
  }

  @Post(':sessionId/transfer')
  @ApiOperation({ summary: 'Transferir chat para outro atendente' })
  @ApiParam({ name: 'sessionId', description: 'ID da sessão de chat' })
  @ApiResponse({ status: 200, description: 'Chat transferido' })
  @ApiResponse({ status: 403, description: 'Não é o atendente desta sessão' })
  async transferChat(
    @CurrentUser() user: AuthUser,
    @Param('sessionId') sessionId: string,
    @Body() dto: TransferChatDto,
  ) {
    return this.chatService.transferChat(sessionId, user.id, dto.toAgentId);
  }
}
