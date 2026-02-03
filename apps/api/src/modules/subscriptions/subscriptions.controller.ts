import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import type { JwtPayload } from '../../common/types';
import {
  SubscribeDto,
  ChangePlanDto,
  CancelSubscriptionDto,
  HistoryQueryDto,
  CreatePlanDto,
  UpdatePlanDto,
  SuspendUserDto,
  SubscribersQueryDto,
  ReportQueryDto,
  ReportPeriod,
} from './dto';

// ==========================================
// USER CONTROLLER
// ==========================================

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Listar todos os planos disponíveis' })
  @ApiResponse({ status: 200, description: 'Planos retornados com sucesso' })
  async getPlans(@CurrentUser() user: JwtPayload) {
    const data = await this.subscriptionsService.getPlans(
      user.sub,
      user.associationId,
    );
    return { success: true, data };
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Obter detalhes de um plano' })
  @ApiResponse({ status: 200, description: 'Detalhes do plano' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  async getPlanDetails(
    @CurrentUser() user: JwtPayload,
    @Param('id') planId: string,
  ) {
    const data = await this.subscriptionsService.getPlanDetails(planId, user.sub);
    return { success: true, data };
  }

  @Get('my')
  @ApiOperation({ summary: 'Obter minha assinatura atual' })
  @ApiResponse({ status: 200, description: 'Assinatura retornada' })
  async getMySubscription(@CurrentUser() user: JwtPayload) {
    const data = await this.subscriptionsService.getMySubscription(user.sub);
    return { success: true, data };
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Assinar um plano' })
  @ApiResponse({ status: 201, description: 'Assinatura criada' })
  @ApiResponse({ status: 400, description: 'Já possui assinatura ativa' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  async subscribe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubscribeDto,
  ) {
    const data = await this.subscriptionsService.subscribe(user.sub, dto.planId);
    return { success: true, data };
  }

  @Post('change')
  @ApiOperation({ summary: 'Trocar para outro plano' })
  @ApiResponse({ status: 200, description: 'Plano alterado' })
  @ApiResponse({ status: 400, description: 'Já possui este plano ou sem assinatura' })
  async changePlan(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePlanDto,
  ) {
    const data = await this.subscriptionsService.changePlan(user.sub, dto.planId);
    return { success: true, data };
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancelar assinatura' })
  @ApiResponse({ status: 200, description: 'Assinatura cancelada' })
  @ApiResponse({ status: 400, description: 'Sem assinatura ativa' })
  async cancel(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CancelSubscriptionDto,
  ) {
    const data = await this.subscriptionsService.cancel(user.sub, dto.reason);
    return { success: true, data };
  }

  @Get('history')
  @ApiOperation({ summary: 'Histórico de assinaturas' })
  @ApiResponse({ status: 200, description: 'Histórico retornado' })
  async getHistory(
    @CurrentUser() user: JwtPayload,
    @Query() query: HistoryQueryDto,
  ) {
    const data = await this.subscriptionsService.getHistory(
      user.sub,
      query.page || 1,
      query.limit || 20,
    );
    return { success: true, data };
  }

  @Get('benefits')
  @ApiOperation({ summary: 'Obter benefícios ativos do usuário' })
  @ApiResponse({ status: 200, description: 'Benefícios retornados' })
  async getBenefits(@CurrentUser() user: JwtPayload) {
    const data = await this.subscriptionsService.getBenefits(user.sub);
    return { success: true, data };
  }
}

// ==========================================
// ADMIN CONTROLLER
// ==========================================

@ApiTags('admin/subscriptions')
@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Listar todos os planos (ativos e inativos)' })
  @ApiQuery({ name: 'include_inactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Planos retornados' })
  async getPlans(
    @CurrentUser() user: JwtPayload,
    @Query('include_inactive') includeInactive: boolean = true,
  ) {
    const data = await this.subscriptionsService.getAdminPlans(
      user.associationId,
      includeInactive,
    );
    return { success: true, data };
  }

  @Post('plans')
  @ApiOperation({ summary: 'Criar novo plano' })
  @ApiResponse({ status: 201, description: 'Plano criado' })
  @ApiResponse({ status: 400, description: 'Limite de planos ou dados inválidos' })
  @ApiResponse({ status: 409, description: 'Nome já existe' })
  async createPlan(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePlanDto,
  ) {
    const data = await this.subscriptionsService.createPlan(
      user.associationId,
      user.sub,
      dto,
    );
    return { success: true, data };
  }

  @Put('plans/:id')
  @ApiOperation({ summary: 'Atualizar plano' })
  @ApiResponse({ status: 200, description: 'Plano atualizado' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  async updatePlan(
    @Param('id') planId: string,
    @Body() dto: UpdatePlanDto,
  ) {
    const data = await this.subscriptionsService.updatePlan(planId, dto);
    return { success: true, data };
  }

  @Delete('plans/:id')
  @ApiOperation({ summary: 'Desativar plano (soft delete)' })
  @ApiResponse({ status: 200, description: 'Plano desativado' })
  @ApiResponse({ status: 404, description: 'Plano não encontrado' })
  async deletePlan(@Param('id') planId: string) {
    const data = await this.subscriptionsService.deletePlan(planId);
    return { success: true, data };
  }

  @Get('subscribers')
  @ApiOperation({ summary: 'Listar assinantes' })
  @ApiResponse({ status: 200, description: 'Assinantes retornados' })
  async getSubscribers(
    @CurrentUser() user: JwtPayload,
    @Query() query: SubscribersQueryDto,
  ) {
    const data = await this.subscriptionsService.getSubscribers(
      user.associationId,
      query,
    );
    return { success: true, data };
  }

  @Post('users/:id/suspend')
  @ApiOperation({ summary: 'Suspender assinatura de usuário' })
  @ApiResponse({ status: 200, description: 'Assinatura suspensa' })
  @ApiResponse({ status: 404, description: 'Usuário não possui assinatura' })
  async suspendUser(
    @CurrentUser() user: JwtPayload,
    @Param('id') userId: string,
    @Body() dto: SuspendUserDto,
  ) {
    const data = await this.subscriptionsService.suspendUser(
      user.sub,
      userId,
      dto.reason,
    );
    return { success: true, data };
  }

  @Post('users/:id/activate')
  @ApiOperation({ summary: 'Reativar assinatura de usuário' })
  @ApiResponse({ status: 200, description: 'Assinatura reativada' })
  @ApiResponse({ status: 404, description: 'Usuário não possui assinatura' })
  async activateUser(
    @CurrentUser() user: JwtPayload,
    @Param('id') userId: string,
  ) {
    const data = await this.subscriptionsService.activateUser(user.sub, userId);
    return { success: true, data };
  }

  @Get('report')
  @ApiOperation({ summary: 'Relatório consolidado de assinaturas' })
  @ApiResponse({ status: 200, description: 'Relatório retornado' })
  async getReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ReportQueryDto,
  ) {
    const data = await this.subscriptionsService.getReport(
      user.associationId,
      query.period || ReportPeriod.THIRTY_DAYS,
    );
    return { success: true, data };
  }
}
