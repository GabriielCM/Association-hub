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

    const STATUS_LABELS: Record<string, string> = {
      PENDING: 'Pedido realizado',
      CONFIRMED: 'Em preparação',
      READY: 'Pronto para retirada',
      COMPLETED: 'Entregue',
      CANCELLED: 'Cancelado',
    };

    const timeline = ((order as any).statusHistory ?? []).map((entry: any) => ({
      status: entry.status,
      label: STATUS_LABELS[entry.status] ?? entry.status,
      description: entry.notes ?? undefined,
      createdAt: entry.createdAt,
    }));

    const { statusHistory, ...orderData } = order as any;

    return {
      success: true,
      data: {
        ...orderData,
        timeline,
      },
    };
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Comprovante do pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Comprovante gerado' })
  async getReceipt(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.ordersService.getReceipt(id, user.sub);
    const { receipt, order, user: orderUser } = result;
    const receiptData = receipt.data as any;

    const formatPrice = (points: number, money: number) => {
      if (points > 0 && money > 0) return `${points} pts + R$ ${money.toFixed(2)}`;
      if (points > 0) return `${points} pts`;
      if (money > 0) return `R$ ${money.toFixed(2)}`;
      return 'Grátis';
    };

    return {
      success: true,
      data: {
        receiptNumber: receipt.receiptNumber,
        order: {
          code: order.code,
          createdAt: order.createdAt,
        },
        user: {
          name: orderUser.name,
          email: orderUser.email,
          memberSince: orderUser.createdAt,
        },
        items: (receiptData.items ?? order.items).map((item: any) => ({
          name: item.name ?? item.productName,
          quantity: item.quantity,
          unitPrice: formatPrice(item.unitPricePoints, Number(item.unitPriceMoney ?? 0)),
          total: formatPrice(item.totalPoints, Number(item.totalMoney ?? 0)),
        })),
        subtotal: formatPrice(
          receiptData.subtotalPoints ?? order.subtotalPoints,
          Number(receiptData.subtotalMoney ?? order.subtotalMoney ?? 0),
        ),
        payment: {
          pointsUsed: receiptData.pointsUsed ?? order.pointsUsed ?? 0,
          moneyPaid: Number(receiptData.moneyPaid ?? order.moneyPaid ?? 0),
          cashback: receiptData.cashbackEarned ?? order.cashbackEarned ?? 0,
        },
        pickupLocation: order.pickupLocation ?? undefined,
      },
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
