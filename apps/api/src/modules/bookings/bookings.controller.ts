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
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  CancelBookingDto,
  JoinWaitlistDto,
  ConfirmWaitlistDto,
  MyBookingsQueryDto,
  BookingResponseDto,
} from './dto';

@ApiTags('reservas')
@ApiBearerAuth()
@Controller('api/v1/reservas')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ===========================================
  // BOOKING ENDPOINTS
  // ===========================================

  @Post()
  @ApiOperation({ summary: 'Criar solicitação de reserva' })
  @ApiResponse({ status: 201, description: 'Reserva criada com sucesso', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou regras não atendidas' })
  @ApiResponse({ status: 404, description: 'Espaço não encontrado' })
  @ApiResponse({ status: 409, description: 'Conflito - já existe reserva para este período' })
  async createBooking(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(user.sub, dto);
  }

  @Get('minhas')
  @ApiOperation({ summary: 'Listar minhas reservas' })
  @ApiResponse({ status: 200, description: 'Lista de reservas retornada com sucesso' })
  async getMyBookings(
    @CurrentUser() user: JwtPayload,
    @Query() query: MyBookingsQueryDto,
  ) {
    return this.bookingsService.getMyBookings(user.sub, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma reserva' })
  @ApiParam({ name: 'id', description: 'ID da reserva' })
  @ApiResponse({ status: 200, description: 'Reserva retornada com sucesso', type: BookingResponseDto })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Reserva não encontrada' })
  async getBooking(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.bookingsService.getBooking(id, user.sub);
  }

  @Post(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar reserva' })
  @ApiParam({ name: 'id', description: 'ID da reserva' })
  @ApiResponse({ status: 200, description: 'Reserva cancelada com sucesso' })
  @ApiResponse({ status: 400, description: 'Reserva não pode ser cancelada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Reserva não encontrada' })
  async cancelBooking(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingsService.cancelBooking(id, user.sub, dto);
  }

  // ===========================================
  // WAITLIST ENDPOINTS
  // ===========================================

  @Post('fila')
  @ApiOperation({ summary: 'Entrar na fila de espera' })
  @ApiResponse({ status: 201, description: 'Adicionado à fila de espera' })
  @ApiResponse({ status: 400, description: 'Não há reserva para este período' })
  @ApiResponse({ status: 409, description: 'Já está na fila de espera' })
  async joinWaitlist(
    @CurrentUser() user: JwtPayload,
    @Body() dto: JoinWaitlistDto,
  ) {
    return this.bookingsService.joinWaitlist(user.sub, dto);
  }

  @Get('fila/posicao')
  @ApiOperation({ summary: 'Ver posição na fila de espera' })
  @ApiResponse({ status: 200, description: 'Posições na fila retornadas' })
  async getWaitlistPosition(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.getWaitlistPosition(user.sub);
  }

  @Delete('fila/:id')
  @ApiOperation({ summary: 'Sair da fila de espera' })
  @ApiParam({ name: 'id', description: 'ID da entrada na fila' })
  @ApiResponse({ status: 200, description: 'Removido da fila de espera' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Entrada não encontrada' })
  async leaveWaitlist(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.bookingsService.leaveWaitlist(id, user.sub);
  }

  @Post('fila/:id/confirmar')
  @ApiOperation({ summary: 'Confirmar ou recusar vaga da fila' })
  @ApiParam({ name: 'id', description: 'ID da entrada na fila' })
  @ApiResponse({ status: 200, description: 'Resposta registrada' })
  @ApiResponse({ status: 400, description: 'Não foi notificado ou prazo expirado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Entrada não encontrada' })
  async confirmWaitlistSlot(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ConfirmWaitlistDto,
  ) {
    return this.bookingsService.confirmWaitlistSlot(id, user.sub, dto.accept);
  }
}
