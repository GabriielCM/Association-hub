import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import type { JwtPayload } from '../../common/types';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  AdminEventQueryDto,
  ManualCheckinDto,
} from './dto';

@ApiTags('admin/events')
@ApiBearerAuth()
@Controller('admin/events')
@UseGuards(JwtAuthGuard)
export class AdminEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar eventos (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de eventos retornada com sucesso' })
  async listEvents(@CurrentUser() user: JwtPayload, @Query() query: AdminEventQueryDto) {
    return this.eventsService.adminListEvents(user.associationId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Criar evento' })
  @ApiResponse({ status: 201, description: 'Evento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createEvent(@CurrentUser() user: JwtPayload, @Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(
      user.associationId,
      user.sub,
      dto,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Evento atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async updateEvent(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(id, user.associationId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Evento excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async deleteEvent(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.eventsService.deleteEvent(id, user.associationId);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publicar evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Evento publicado com sucesso' })
  @ApiResponse({ status: 400, description: 'Evento já publicado ou dados inválidos' })
  async publishEvent(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.eventsService.publishEvent(id, user.associationId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Evento cancelado com sucesso' })
  @ApiResponse({ status: 400, description: 'Evento já cancelado' })
  async cancelEvent(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.eventsService.cancelEvent(id, user.associationId, reason);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pausar/despausar evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Evento pausado/despausado com sucesso' })
  async pauseEvent(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body('isPaused') isPaused: boolean,
  ) {
    return this.eventsService.pauseEvent(id, user.associationId, isPaused);
  }

  @Post(':id/checkin/manual')
  @ApiOperation({ summary: 'Check-in manual' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 201, description: 'Check-in manual realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Evento ou usuário não encontrado' })
  async manualCheckin(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ManualCheckinDto,
  ) {
    return this.eventsService.manualCheckin(
      id,
      user.associationId,
      user.sub,
      dto,
    );
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Obter analytics do evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Analytics retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async getAnalytics(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.eventsService.getAnalytics(id, user.associationId);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Listar participantes do evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Participantes retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async getParticipants(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.eventsService.getParticipants(
      id,
      user.associationId,
      page || 1,
      perPage || 50,
    );
  }

  @Get(':id/export/csv')
  @ApiOperation({ summary: 'Exportar participantes para CSV' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'CSV exportado com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const csv = await this.eventsService.exportToCsv(
      id,
      user.associationId,
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="evento-participantes-${id}.csv"`,
    );
    res.send(csv);
  }

  @Get(':id/export/pdf')
  @ApiOperation({ summary: 'Exportar participantes para impressão (HTML)' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'HTML exportado com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  @Header('Content-Type', 'text/html; charset=utf-8')
  async exportPdf(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const html = await this.eventsService.exportToPrintHtml(
      id,
      user.associationId,
    );
    res.send(html);
  }
}
