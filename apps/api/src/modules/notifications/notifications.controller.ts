import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/types';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { UpdateNotificationSettingsDto } from './dto/update-settings.dto';
import { UpdateDoNotDisturbDto } from './dto/update-dnd.dto';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { NotificationCategory } from '@prisma/client';

@ApiTags('Notificações')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ============================================
  // NOTIFICATIONS
  // ============================================

  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de notificações' })
  async findAll(@CurrentUser() user: JwtPayload, @Query() query: NotificationQueryDto) {
    if (query.grouped) {
      return this.notificationsService.findGrouped(user.sub, query);
    }
    return this.notificationsService.findAll(user.sub, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obter contadores de não lidas por categoria' })
  @ApiResponse({ status: 200, description: 'Contadores de notificações não lidas' })
  async getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.getUnreadCount(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma notificação' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({ status: 200, description: 'Detalhes da notificação' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationsService.findOne(user.sub, id);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  async markAsRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.sub, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({ status: 200, description: 'Número de notificações marcadas' })
  async markAllAsRead(@CurrentUser() user: JwtPayload) {
    const count = await this.notificationsService.markAllAsRead(user.sub);
    return { markedAsRead: count };
  }

  @Post('read-category/:category')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar todas as notificações de uma categoria como lidas' })
  @ApiParam({ name: 'category', enum: NotificationCategory })
  @ApiResponse({ status: 200, description: 'Número de notificações marcadas' })
  async markCategoryAsRead(
    @CurrentUser() user: JwtPayload,
    @Param('category') category: NotificationCategory
  ) {
    const count = await this.notificationsService.markCategoryAsRead(user.sub, category);
    return { markedAsRead: count };
  }

  @Post('group/:groupKey/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar grupo de notificações como lido' })
  @ApiParam({ name: 'groupKey', description: 'Chave do grupo' })
  @ApiResponse({ status: 200, description: 'Número de notificações marcadas' })
  async markGroupAsRead(
    @CurrentUser() user: JwtPayload,
    @Param('groupKey') groupKey: string
  ) {
    const count = await this.notificationsService.markGroupAsRead(user.sub, groupKey);
    return { markedAsRead: count };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir notificação' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({ status: 204, description: 'Notificação excluída' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.notificationsService.delete(user.sub, id);
  }

  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Excluir todas as notificações lidas' })
  @ApiResponse({ status: 200, description: 'Número de notificações excluídas' })
  async clearRead(@CurrentUser() user: JwtPayload) {
    const count = await this.notificationsService.clearRead(user.sub);
    return { deleted: count };
  }

  // ============================================
  // DEVICE TOKENS (Push Notifications)
  // ============================================

  @Post('device-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar device token para push notifications' })
  @ApiResponse({ status: 200, description: 'Token registrado' })
  async registerDeviceToken(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RegisterDeviceTokenDto
  ) {
    await this.notificationsService.registerDeviceToken(user.sub, dto.token, dto.platform);
    return { success: true };
  }

  @Delete('device-token/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover device token' })
  @ApiParam({ name: 'token', description: 'Push token a remover' })
  @ApiResponse({ status: 204, description: 'Token removido' })
  async removeDeviceToken(
    @CurrentUser() user: JwtPayload,
    @Param('token') token: string
  ) {
    await this.notificationsService.removeDeviceToken(user.sub, token);
  }

  // ============================================
  // SETTINGS
  // ============================================

  @Get('settings')
  @ApiOperation({ summary: 'Obter configurações de notificação' })
  @ApiResponse({ status: 200, description: 'Configurações por categoria' })
  async getSettings(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.getAllSettings(user.sub);
  }

  @Get('settings/:category')
  @ApiOperation({ summary: 'Obter configurações de uma categoria' })
  @ApiParam({ name: 'category', enum: NotificationCategory })
  @ApiResponse({ status: 200, description: 'Configurações da categoria' })
  async getCategorySettings(
    @CurrentUser() user: JwtPayload,
    @Param('category') category: NotificationCategory
  ) {
    const settings = await this.notificationsService.getSettings(user.sub, category);
    const types = this.notificationsService.getCategoryTypes(category);
    return { ...settings, types };
  }

  @Put('settings/:category')
  @ApiOperation({ summary: 'Atualizar configurações de uma categoria' })
  @ApiParam({ name: 'category', enum: NotificationCategory })
  @ApiResponse({ status: 200, description: 'Configurações atualizadas' })
  async updateSettings(
    @CurrentUser() user: JwtPayload,
    @Param('category') category: NotificationCategory,
    @Body() dto: UpdateNotificationSettingsDto
  ) {
    return this.notificationsService.updateSettings(user.sub, category, dto);
  }

  // ============================================
  // DO NOT DISTURB
  // ============================================

  @Get('dnd')
  @ApiOperation({ summary: 'Obter configurações de Não Perturbe' })
  @ApiResponse({ status: 200, description: 'Configurações DND' })
  async getDnd(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.getDndSettings(user.sub);
  }

  @Put('dnd')
  @ApiOperation({ summary: 'Atualizar configurações de Não Perturbe' })
  @ApiResponse({ status: 200, description: 'Configurações DND atualizadas' })
  async updateDnd(@CurrentUser() user: JwtPayload, @Body() dto: UpdateDoNotDisturbDto) {
    return this.notificationsService.updateDndSettings(user.sub, dto);
  }
}
