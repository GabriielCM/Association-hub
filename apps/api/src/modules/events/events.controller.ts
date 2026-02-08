import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import type { JwtPayload } from '../../common/types';
import { EventsService } from './events.service';
import {
  EventQueryDto,
  CheckinDto,
  CreateCommentDto,
  CommentQueryDto,
} from './dto';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar eventos' })
  @ApiResponse({ status: 200, description: 'Lista de eventos retornada com sucesso' })
  async listEvents(@CurrentUser() user: JwtPayload, @Query() query: EventQueryDto) {
    const data = await this.eventsService.listEvents(
      user.sub,
      user.associationId,
      query,
    );
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Evento retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async getEvent(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const data = await this.eventsService.getEvent(id, user.sub);
    return { success: true, data };
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirmar presença em evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 201, description: 'Presença confirmada com sucesso' })
  @ApiResponse({ status: 400, description: 'Já confirmou presença ou evento lotado' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async confirmEvent(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const data = await this.eventsService.confirmEvent(id, user.sub);
    return { success: true, data };
  }

  @Delete(':id/confirm')
  @ApiOperation({ summary: 'Remover confirmação de presença' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Confirmação removida com sucesso' })
  @ApiResponse({ status: 400, description: 'Não havia confirmação' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async removeConfirmation(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const data = await this.eventsService.removeConfirmation(id, user.sub);
    return { success: true, data };
  }

  @Post(':id/checkin')
  @ApiOperation({ summary: 'Realizar check-in no evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 201, description: 'Check-in realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Check-in inválido, expirado ou já realizado' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async checkin(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: CheckinDto) {
    // Override eventId from URL for security
    dto.eventId = id;
    const data = await this.eventsService.processCheckin(user.sub, dto);
    return { success: true, data };
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Listar comentários do evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Comentários retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async getComments(@Param('id') id: string, @Query() query: CommentQueryDto) {
    const data = await this.eventsService.getComments(id, query);
    return { success: true, data };
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Criar comentário no evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 201, description: 'Comentário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async createComment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    const data = await this.eventsService.createComment(id, user.sub, dto);
    return { success: true, data };
  }
}
