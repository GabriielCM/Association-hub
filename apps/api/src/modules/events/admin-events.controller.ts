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
  Request,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  AdminEventQueryDto,
  ManualCheckinDto,
} from './dto';

@Controller('admin/events')
@UseGuards(JwtAuthGuard)
export class AdminEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async listEvents(@Request() req, @Query() query: AdminEventQueryDto) {
    return this.eventsService.adminListEvents(req.user.associationId, query);
  }

  @Post()
  async createEvent(@Request() req, @Body() dto: CreateEventDto) {
    return this.eventsService.createEvent(
      req.user.associationId,
      req.user.id,
      dto,
    );
  }

  @Put(':id')
  async updateEvent(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(id, req.user.associationId, dto);
  }

  @Delete(':id')
  async deleteEvent(@Request() req, @Param('id') id: string) {
    return this.eventsService.deleteEvent(id, req.user.associationId);
  }

  @Post(':id/publish')
  async publishEvent(@Request() req, @Param('id') id: string) {
    return this.eventsService.publishEvent(id, req.user.associationId);
  }

  @Post(':id/cancel')
  async cancelEvent(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.eventsService.cancelEvent(id, req.user.associationId, reason);
  }

  @Post(':id/pause')
  async pauseEvent(
    @Request() req,
    @Param('id') id: string,
    @Body('isPaused') isPaused: boolean,
  ) {
    return this.eventsService.pauseEvent(id, req.user.associationId, isPaused);
  }

  @Post(':id/checkin/manual')
  async manualCheckin(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ManualCheckinDto,
  ) {
    return this.eventsService.manualCheckin(
      id,
      req.user.associationId,
      req.user.id,
      dto,
    );
  }

  @Get(':id/analytics')
  async getAnalytics(@Request() req, @Param('id') id: string) {
    return this.eventsService.getAnalytics(id, req.user.associationId);
  }

  @Get(':id/participants')
  async getParticipants(
    @Request() req,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.eventsService.getParticipants(
      id,
      req.user.associationId,
      page || 1,
      perPage || 50,
    );
  }

  @Get(':id/export/csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const csv = await this.eventsService.exportToCsv(
      id,
      req.user.associationId,
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="evento-participantes-${id}.csv"`,
    );
    res.send(csv);
  }

  @Get(':id/export/pdf')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async exportPdf(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const html = await this.eventsService.exportToPrintHtml(
      id,
      req.user.associationId,
    );
    res.send(html);
  }
}
