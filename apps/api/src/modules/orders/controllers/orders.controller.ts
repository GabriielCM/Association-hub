import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/types';
import { OrdersService } from '../orders.service';
import { VouchersService } from '../vouchers.service';
import { OrdersQueryDto } from '../dto/orders-query.dto';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly vouchersService: VouchersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar pedidos do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos' })
  async getMyOrders(@CurrentUser() user: JwtPayload, @Query() query: OrdersQueryDto) {
    const result = await this.ordersService.getUserOrders(user.sub, query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('vouchers')
  @ApiOperation({ summary: 'Listar vouchers do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de vouchers ativos' })
  async getMyVouchers(@CurrentUser() user: JwtPayload) {
    const vouchers = await this.vouchersService.getUserVouchers(user.sub, {
      includeUsed: false,
      includeExpired: false,
    });
    return {
      success: true,
      data: vouchers,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Detalhes do pedido' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async getOrder(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const order = await this.ordersService.getOrderById(id, user.sub);
    return {
      success: true,
      data: order,
    };
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Comprovante do pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Comprovante gerado' })
  async getReceipt(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const receipt = await this.ordersService.getReceipt(id, user.sub);
    return {
      success: true,
      data: receipt,
    };
  }

  @Get(':id/vouchers')
  @ApiOperation({ summary: 'Vouchers do pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Lista de vouchers do pedido' })
  async getOrderVouchers(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const vouchers = await this.ordersService.getOrderVouchers(id, user.sub);
    return {
      success: true,
      data: vouchers,
    };
  }
}
