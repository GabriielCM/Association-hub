import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
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
import { UpdateGroupDto } from './dto/update-group.dto';

@ApiTags('Grupos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations/:conversationId/group')
export class GroupsController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @ApiOperation({ summary: 'Obter informações do grupo' })
  @ApiParam({ name: 'conversationId', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Informações do grupo' })
  async getGroup(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId') conversationId: string
  ) {
    const { group, participants, mediaCount } = await this.messagesService.getGroup(
      user.sub,
      conversationId
    );

    const mappedParticipants = participants.map((p) => ({
      id: p.user.id,
      name: p.user.name,
      avatarUrl: p.user.avatarUrl ?? undefined,
      role: p.role,
    }));

    const data = {
      id: group.id,
      name: group.name,
      description: group.description ?? undefined,
      imageUrl: group.imageUrl ?? undefined,
      createdBy: group.createdById,
      admins: mappedParticipants.filter((p) => p.role === 'ADMIN'),
      participants: mappedParticipants,
      participantsCount: mappedParticipants.length,
      mediaCount,
      createdAt: group.createdAt.toISOString(),
    };

    return { success: true, data };
  }

  @Put()
  @ApiOperation({ summary: 'Atualizar informações do grupo' })
  @ApiParam({ name: 'conversationId', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Grupo atualizado' })
  async updateGroup(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId') conversationId: string,
    @Body() dto: UpdateGroupDto
  ) {
    const data = await this.messagesService.updateGroup(user.sub, conversationId, dto);
    return { success: true, data };
  }

  @Post('participants')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adicionar participantes ao grupo' })
  @ApiParam({ name: 'conversationId', description: 'ID da conversa' })
  @ApiResponse({ status: 201, description: 'Participantes adicionados' })
  async addParticipants(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId') conversationId: string,
    @Body() body: { participantIds: string[] }
  ) {
    await this.messagesService.addParticipants(user.sub, conversationId, body.participantIds);
    return { success: true };
  }

  @Delete('participants/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover participante do grupo' })
  @ApiParam({ name: 'conversationId', description: 'ID da conversa' })
  @ApiParam({ name: 'userId', description: 'ID do usuário a remover' })
  @ApiResponse({ status: 204, description: 'Participante removido' })
  async removeParticipant(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId') conversationId: string,
    @Param('userId') userId: string
  ) {
    await this.messagesService.removeParticipant(user.sub, conversationId, userId);
  }

  @Post('admins')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Promover participante a administrador' })
  @ApiParam({ name: 'conversationId', description: 'ID da conversa' })
  @ApiResponse({ status: 200, description: 'Participante promovido' })
  async promoteToAdmin(
    @CurrentUser() user: JwtPayload,
    @Param('conversationId') conversationId: string,
    @Body() body: { userId: string }
  ) {
    await this.messagesService.promoteToAdmin(user.sub, conversationId, body.userId);
    return { success: true };
  }
}
