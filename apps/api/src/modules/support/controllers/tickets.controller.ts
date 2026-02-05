import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { TicketsService } from '../tickets.service';
import {
  CreateTicketDto,
  CreateAutomaticTicketDto,
  CreateTicketMessageDto,
  RateTicketDto,
} from '../dto/create-ticket.dto';
import { TicketsQueryDto } from '../dto/tickets-query.dto';

interface AuthUser {
  id: string;
  associationId: string;
  role: string;
}

@ApiTags('support')
@Controller('support/tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tickets do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de tickets' })
  async listTickets(@CurrentUser() user: AuthUser, @Query() query: TicketsQueryDto) {
    return this.ticketsService.listUserTickets(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo ticket' })
  @ApiResponse({ status: 201, description: 'Ticket criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createTicket(@CurrentUser() user: AuthUser, @Body() dto: CreateTicketDto) {
    return this.ticketsService.createTicket(user.id, user.associationId, dto);
  }

  @Post('automatic')
  @ApiOperation({ summary: 'Criar ticket automático (crash report)' })
  @ApiResponse({ status: 201, description: 'Ticket criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Limite de tickets diários atingido' })
  async createAutomaticTicket(@CurrentUser() user: AuthUser, @Body() dto: CreateAutomaticTicketDto) {
    return this.ticketsService.createAutomaticTicket(user.id, user.associationId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um ticket' })
  @ApiParam({ name: 'id', description: 'ID do ticket' })
  @ApiResponse({ status: 200, description: 'Detalhes do ticket' })
  @ApiResponse({ status: 404, description: 'Ticket não encontrado' })
  async getTicket(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ticketsService.getTicket(id, user.id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Enviar mensagem no ticket' })
  @ApiParam({ name: 'id', description: 'ID do ticket' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada' })
  @ApiResponse({ status: 400, description: 'Ticket fechado' })
  async sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateTicketMessageDto,
  ) {
    return this.ticketsService.sendMessage(id, user.id, dto);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Marcar ticket como resolvido' })
  @ApiParam({ name: 'id', description: 'ID do ticket' })
  @ApiResponse({ status: 200, description: 'Ticket resolvido' })
  @ApiResponse({ status: 400, description: 'Ticket já resolvido' })
  async resolveTicket(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ticketsService.resolveTicket(id, user.id);
  }

  @Post(':id/rating')
  @ApiOperation({ summary: 'Avaliar atendimento do ticket' })
  @ApiParam({ name: 'id', description: 'ID do ticket' })
  @ApiResponse({ status: 201, description: 'Avaliação registrada' })
  @ApiResponse({ status: 400, description: 'Ticket não resolvido' })
  @ApiResponse({ status: 409, description: 'Ticket já avaliado' })
  async rateTicket(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: RateTicketDto,
  ) {
    return this.ticketsService.rateTicket(id, user.id, dto);
  }
}
