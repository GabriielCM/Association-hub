import {
  Controller,
  Get,
  Post,
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
  RejectBookingDto,
  CancelBookingDto,
  AdminBookingQueryDto,
  BookingResponseDto,
} from './dto';

@ApiTags('admin/reservas')
@ApiBearerAuth()
@Controller('reservas')
@UseGuards(JwtAuthGuard)
export class AdminBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as reservas (Gerente/ADM)' })
  @ApiResponse({ status: 200, description: 'Lista de reservas retornada com sucesso' })
  async listBookings(
    @CurrentUser() user: JwtPayload,
    @Query() query: AdminBookingQueryDto,
  ) {
    // TODO: Add role guard for ADMIN/MANAGER
    return this.bookingsService.listBookings(user.associationId, query);
  }

  @Get('pendentes')
  @ApiOperation({ summary: 'Listar reservas pendentes de aprovação (Gerente/ADM)' })
  @ApiResponse({ status: 200, description: 'Lista de reservas pendentes' })
  async getPendingBookings(@CurrentUser() user: JwtPayload) {
    // TODO: Add role guard for ADMIN/MANAGER
    return this.bookingsService.getPendingBookings(user.associationId);
  }

  @Post(':id/aprovar')
  @ApiOperation({ summary: 'Aprovar reserva (Gerente/ADM)' })
  @ApiParam({ name: 'id', description: 'ID da reserva' })
  @ApiResponse({ status: 200, description: 'Reserva aprovada com sucesso', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Reserva não está pendente' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Reserva não encontrada' })
  async approveBooking(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    // TODO: Add role guard for ADMIN/MANAGER
    return this.bookingsService.approveBooking(id, user.sub, user.associationId);
  }

  @Post(':id/rejeitar')
  @ApiOperation({ summary: 'Rejeitar reserva (Gerente/ADM)' })
  @ApiParam({ name: 'id', description: 'ID da reserva' })
  @ApiResponse({ status: 200, description: 'Reserva rejeitada com sucesso', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Reserva não está pendente' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Reserva não encontrada' })
  async rejectBooking(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: RejectBookingDto,
  ) {
    // TODO: Add role guard for ADMIN/MANAGER
    return this.bookingsService.rejectBooking(id, user.sub, user.associationId, dto);
  }

  @Post(':id/cancelar-admin')
  @ApiOperation({ summary: 'Cancelar reserva como administrador (ADM)' })
  @ApiParam({ name: 'id', description: 'ID da reserva' })
  @ApiResponse({ status: 200, description: 'Reserva cancelada com sucesso', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Reserva não pode ser cancelada' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Reserva não encontrada' })
  async adminCancelBooking(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    // TODO: Add role guard for ADMIN
    return this.bookingsService.adminCancelBooking(id, user.sub, user.associationId, dto);
  }
}
