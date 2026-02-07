import {
  Controller,
  Get,
  Put,
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
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtPayload } from '../../common/types';
import { CardService } from './card.service';
import { CardHistoryQueryDto, ListCardsQueryDto, UpdateCardStatusDto } from './dto';

@ApiTags('Card')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user/card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  @ApiOperation({ summary: 'Obter dados da carteirinha' })
  @ApiResponse({ status: 200, description: 'Carteirinha retornada com sucesso' })
  async getCard(@CurrentUser() user: JwtPayload) {
    const data = await this.cardService.getCard(user.sub);
    return { success: true, data };
  }

  @Get('status')
  @ApiOperation({ summary: 'Obter status da carteirinha' })
  @ApiResponse({ status: 200, description: 'Status retornado com sucesso' })
  async getCardStatus(@CurrentUser() user: JwtPayload) {
    const data = await this.cardService.getCardStatus(user.sub);
    return { success: true, data };
  }

  @Get('qrcode')
  @ApiOperation({ summary: 'Obter QR Code da carteirinha' })
  @ApiResponse({ status: 200, description: 'QR Code retornado com sucesso' })
  @ApiResponse({ status: 400, description: 'Carteirinha inativa' })
  async getQrCode(@CurrentUser() user: JwtPayload) {
    const data = await this.cardService.getQrCode(user.sub);
    return { success: true, data };
  }

  @Get('history')
  @ApiOperation({ summary: 'Obter histórico de uso da carteirinha' })
  @ApiResponse({ status: 200, description: 'Histórico retornado com sucesso' })
  async getCardHistory(@CurrentUser() user: JwtPayload, @Query() query: CardHistoryQueryDto) {
    const data = await this.cardService.getCardHistory(user.sub, query);
    return { success: true, data };
  }
}

// ===========================================
// ADMIN CONTROLLER
// ===========================================

@ApiTags('Admin - Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/cards')
export class AdminCardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  @ApiOperation({ summary: 'Listar carteirinhas' })
  @ApiResponse({ status: 200, description: 'Carteirinhas retornadas com sucesso' })
  async listCards(@CurrentUser() user: JwtPayload, @Query() query: ListCardsQueryDto) {
    const data = await this.cardService.listCards(user.associationId, query);
    return { success: true, data };
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Alterar status da carteirinha' })
  @ApiResponse({ status: 200, description: 'Status alterado com sucesso' })
  @ApiResponse({ status: 404, description: 'Carteirinha não encontrada' })
  async updateCardStatus(@Param('id') cardId: string, @Body() dto: UpdateCardStatusDto) {
    const data = await this.cardService.updateCardStatus(cardId, dto);
    return { success: true, data };
  }
}
