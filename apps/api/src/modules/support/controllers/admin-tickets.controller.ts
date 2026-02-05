import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { TicketsService } from '../tickets.service';
import { CreateTicketMessageDto } from '../dto/create-ticket.dto';
import { AdminTicketsQueryDto, UpdateTicketStatusDto } from '../dto/tickets-query.dto';

interface AuthUser {
  id: string;
  name: string;
  associationId: string;
  role: string;
}

@ApiTags('admin/support')
@Controller('admin/support/tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminTicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os tickets da associação' })
  @ApiResponse({ status: 200, description: 'Lista de tickets com contagens por status' })
  async listTickets(@CurrentUser() user: AuthUser, @Query() query: AdminTicketsQueryDto) {
    return this.ticketsService.listAllTickets(user.associationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um ticket (admin)' })
  @ApiParam({ name: 'id', description: 'ID do ticket' })
  @ApiResponse({ status: 200, description: 'Detalhes do ticket' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  async getTicket(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ticketsService.getTicketAdmin(id, user.associationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar status do ticket' })
  @ApiParam({ name: 'id', description: 'ID do ticket' })
  @ApiResponse({ status: 200, description: 'Ticket atualizado' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  async updateTicket(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ticketsService.updateTicketStatus(id, user.associationId, dto);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Responder ticket como suporte' })
  @ApiParam({ name: 'id', description: 'ID do ticket' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada' })
  @ApiResponse({ status: 400, description: 'Ticket fechado' })
  async sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateTicketMessageDto,
  ) {
    return this.ticketsService.sendAdminMessage(
      id,
      user.associationId,
      user.id,
      user.name || 'Suporte',
      dto,
    );
  }
}
