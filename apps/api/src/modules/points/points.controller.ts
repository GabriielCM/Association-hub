import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PointsService } from './points.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import type { JwtPayload } from '../../common/types';
import {
  TransferDto,
  HistoryQueryDto,
  SummaryQueryDto,
  SummaryPeriod,
  SearchUserQueryDto,
  RecentRecipientsQueryDto,
  AdminGrantDto,
  AdminDeductDto,
  AdminRefundDto,
  ReportQueryDto,
  ReportPeriod,
  UpdateConfigDto,
} from './dto';

@ApiTags('points')
@Controller('points')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  // ==========================================
  // USER ENDPOINTS
  // ==========================================

  @Get('balance')
  @ApiOperation({ summary: 'Obter saldo de pontos' })
  @ApiResponse({ status: 200, description: 'Saldo retornado com sucesso' })
  async getBalance(@CurrentUser() user: JwtPayload) {
    const data = await this.pointsService.getBalance(user.sub);
    return { data };
  }

  @Get('history')
  @ApiOperation({ summary: 'Obter histórico de transações' })
  @ApiResponse({ status: 200, description: 'Histórico retornado com sucesso' })
  async getHistory(
    @CurrentUser() user: JwtPayload,
    @Query() query: HistoryQueryDto,
  ) {
    return this.pointsService.getHistory(user.sub, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obter resumo de ganhos e gastos por período' })
  @ApiResponse({ status: 200, description: 'Resumo retornado com sucesso' })
  async getSummary(
    @CurrentUser() user: JwtPayload,
    @Query() query: SummaryQueryDto,
  ) {
    const data = await this.pointsService.getSummary(
      user.sub,
      query.period || SummaryPeriod.MONTH,
    );
    return { data };
  }

  // ==========================================
  // TRANSFER ENDPOINTS
  // ==========================================

  @Post('transfer')
  @ApiOperation({ summary: 'Transferir pontos para outro usuário' })
  @ApiResponse({ status: 201, description: 'Transferência realizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Saldo insuficiente ou dados inválidos' })
  async transfer(@CurrentUser() user: JwtPayload, @Body() dto: TransferDto) {
    const data = await this.pointsService.transferPoints(
      user.sub,
      dto.recipientId,
      dto.amount,
      dto.message,
    );
    return {
      data,
      message: 'Transferência realizada com sucesso',
    };
  }

  @Get('transfer/recent')
  @ApiOperation({ summary: 'Obter destinatários recentes de transferências' })
  @ApiResponse({ status: 200, description: 'Lista de destinatários recentes' })
  async getRecentRecipients(
    @CurrentUser() user: JwtPayload,
    @Query() query: RecentRecipientsQueryDto,
  ) {
    const data = await this.pointsService.getRecentRecipients(
      user.sub,
      query.limit,
    );
    return { data };
  }

  @Get('transfer/search')
  @ApiOperation({ summary: 'Buscar usuários por nome para transferência' })
  @ApiResponse({ status: 200, description: 'Lista de usuários encontrados' })
  async searchUsersForTransfer(
    @CurrentUser() user: JwtPayload,
    @Query() query: SearchUserQueryDto,
  ) {
    const data = await this.pointsService.searchUsersForTransfer(
      user.sub,
      query.q,
      query.limit,
    );
    return { data };
  }
}

// ==========================================
// ADMIN CONTROLLER
// ==========================================

@ApiTags('admin/points')
@Controller('admin/points')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminPointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('config')
  @ApiOperation({ summary: 'Obter configurações do sistema de pontos' })
  @ApiResponse({ status: 200, description: 'Configurações retornadas' })
  async getConfig(@CurrentUser() user: JwtPayload) {
    const data = await this.pointsService.getConfig(user.associationId);
    return { data };
  }

  @Put('config')
  @ApiOperation({ summary: 'Atualizar configurações do sistema de pontos' })
  @ApiResponse({ status: 200, description: 'Configurações atualizadas' })
  async updateConfig(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateConfigDto,
  ) {
    const data = await this.pointsService.updateConfig(user.associationId, dto);
    return { data };
  }

  @Post('grant')
  @ApiOperation({ summary: 'Creditar pontos manualmente para um usuário' })
  @ApiResponse({ status: 201, description: 'Pontos creditados com sucesso' })
  async grantPoints(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AdminGrantDto,
  ) {
    const data = await this.pointsService.adminGrantPoints(
      user.sub,
      dto.userId,
      dto.amount,
      dto.reason,
    );
    return { data };
  }

  @Post('deduct')
  @ApiOperation({ summary: 'Debitar pontos manualmente de um usuário' })
  @ApiResponse({ status: 201, description: 'Pontos debitados com sucesso' })
  async deductPoints(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AdminDeductDto,
  ) {
    const data = await this.pointsService.adminDeductPoints(
      user.sub,
      dto.userId,
      dto.amount,
      dto.reason,
    );
    return { data };
  }

  @Post('refund/:transactionId')
  @ApiOperation({ summary: 'Estornar uma transação específica' })
  @ApiResponse({ status: 201, description: 'Estorno realizado com sucesso' })
  async refundTransaction(
    @CurrentUser() user: JwtPayload,
    @Param('transactionId') transactionId: string,
    @Body() dto: AdminRefundDto,
  ) {
    const data = await this.pointsService.adminRefundTransaction(
      user.sub,
      transactionId,
      dto.reason,
    );
    return { data };
  }

  @Get('reports')
  @ApiOperation({ summary: 'Obter relatórios do sistema de pontos' })
  @ApiResponse({ status: 200, description: 'Relatórios retornados' })
  async getReports(
    @CurrentUser() user: JwtPayload,
    @Query() query: ReportQueryDto,
  ) {
    const data = await this.pointsService.getReports(
      user.associationId,
      query.period || ReportPeriod.MONTH,
    );
    return { data };
  }
}
