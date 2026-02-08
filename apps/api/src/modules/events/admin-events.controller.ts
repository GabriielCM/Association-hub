import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseIntPipe,
  Res,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
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

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes do evento (admin)' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiResponse({ status: 200, description: 'Detalhes do evento retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async getEvent(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.eventsService.getEvent(id, user.sub);
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

  @Post(':id/banner-feed')
  @ApiOperation({ summary: 'Upload do banner feed do evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Banner feed atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadBannerFeed(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const uploadsDir = join(process.cwd(), 'uploads', 'events', id);
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = file.originalname.split('.').pop();
    const fileName = `feed-${Date.now()}.${ext}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, file.buffer);

    const protocol = req.protocol;
    const host = req.get('host');
    const bannerUrl = `${protocol}://${host}/uploads/events/${id}/${fileName}`;

    const data = await this.eventsService.updateBannerFeed(
      id,
      user.associationId,
      bannerUrl,
    );
    return { success: true, data };
  }

  @Post(':id/banner-display')
  @ApiOperation({ summary: 'Adicionar banner display ao evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Banner display adicionado com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadBannerDisplay(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const uploadsDir = join(process.cwd(), 'uploads', 'events', id);
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = file.originalname.split('.').pop();
    const fileName = `display-${Date.now()}.${ext}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, file.buffer);

    const protocol = req.protocol;
    const host = req.get('host');
    const bannerUrl = `${protocol}://${host}/uploads/events/${id}/${fileName}`;

    const data = await this.eventsService.addBannerDisplay(
      id,
      user.associationId,
      bannerUrl,
    );
    return { success: true, data };
  }

  @Delete(':id/banner-display/:index')
  @ApiOperation({ summary: 'Remover banner display do evento' })
  @ApiParam({ name: 'id', description: 'ID do evento' })
  @ApiParam({ name: 'index', description: 'Índice do banner a remover' })
  @ApiResponse({ status: 200, description: 'Banner display removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async removeBannerDisplay(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('index', ParseIntPipe) index: number,
  ) {
    const data = await this.eventsService.removeBannerDisplay(
      id,
      user.associationId,
      index,
    );
    return { success: true, data };
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
