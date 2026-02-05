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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/types';
import { OrdersService } from '../orders.service';
import { VouchersService } from '../vouchers.service';
import { AdminOrdersQueryDto } from '../dto/orders-query.dto';
import { UpdateStatusDto, BatchUpdateStatusDto } from '../dto/update-status.dto';
import { CancelOrderDto } from '../dto/cancel-order.dto';
import { ValidatePickupDto, MarkVoucherUsedDto } from '../dto/validate-pickup.dto';

@ApiTags('admin/orders')
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class OrdersAdminController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly vouchersService: VouchersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos' })
  async getAllOrders(@Query() query: AdminOrdersQueryDto) {
    const result = await this.ordersService.getAllOrders(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um pedido (visão admin)' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Detalhes do pedido' })
  async getOrder(@Param('id') id: string) {
    const order = await this.ordersService.getOrderById(id);
    return {
      success: true,
      data: order,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Status atualizado' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const order = await this.ordersService.updateStatus(id, dto, user.sub, 'Admin');
    return {
      success: true,
      data: order,
      message: `Status atualizado para ${dto.status}`,
    };
  }

  @Post('batch/status')
  @ApiOperation({ summary: 'Atualizar status de múltiplos pedidos' })
  @ApiResponse({ status: 200, description: 'Status atualizados' })
  async batchUpdateStatus(
    @Body() dto: BatchUpdateStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const results = await Promise.all(
      dto.orderIds.map((orderId) =>
        this.ordersService
          .updateStatus(orderId, { status: dto.status, notes: dto.notes }, user.sub, 'Admin')
          .catch((error) => ({ orderId, error: error.message })),
      ),
    );

    const succeeded = results.filter((r) => !('error' in r));
    const failed = results.filter((r) => 'error' in r);

    return {
      success: true,
      data: {
        processed: dto.orderIds.length,
        succeeded: succeeded.length,
        failed: failed.length,
        errors: failed,
      },
    };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancelar pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido cancelado' })
  async cancelOrder(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.ordersService.cancelOrder(id, dto, user.sub, true);
    return {
      success: true,
      data: result.order,
      refunds: result.refunds,
      message: 'Pedido cancelado com sucesso',
    };
  }

  @Post('pickup/validate')
  @ApiOperation({ summary: 'Validar QR de retirada' })
  @ApiResponse({ status: 200, description: 'QR validado' })
  async validatePickup(@Body() dto: ValidatePickupDto) {
    const result = await this.ordersService.validatePickup(dto.code);
    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Confirmar retirada do pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido entregue' })
  async completeOrder(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const order = await this.ordersService.completeOrder(id, user.sub, 'Admin');
    return {
      success: true,
      data: order,
      message: 'Pedido marcado como entregue',
    };
  }

  @Post('vouchers/:code/use')
  @ApiOperation({ summary: 'Marcar voucher como usado' })
  @ApiParam({ name: 'code', description: 'Código do voucher' })
  @ApiResponse({ status: 200, description: 'Voucher marcado como usado' })
  async markVoucherUsed(
    @Param('code') code: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const voucher = await this.vouchersService.markVoucherAsUsed(code, user.sub);
    return {
      success: true,
      data: voucher,
      message: 'Voucher utilizado com sucesso',
    };
  }

  @Get('vouchers/:code/validate')
  @ApiOperation({ summary: 'Validar voucher' })
  @ApiParam({ name: 'code', description: 'Código do voucher' })
  @ApiResponse({ status: 200, description: 'Resultado da validação' })
  async validateVoucher(@Param('code') code: string) {
    const result = await this.vouchersService.validateVoucher(code);
    return {
      success: true,
      data: result,
    };
  }
}
