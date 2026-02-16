import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ReportsQueryDto } from '../../../common/dto/reports-query.dto';
import { OrdersReportsService } from '../orders-reports.service';

@ApiTags('admin/orders/reports')
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class OrdersReportsController {
  constructor(private readonly reportsService: OrdersReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Contadores resumo dos pedidos' })
  @ApiResponse({ status: 200, description: 'Contadores de status' })
  async getSummary() {
    const counters = await this.reportsService.getSummaryCounters();
    return {
      success: true,
      data: counters,
    };
  }

  @Get('reports/sales')
  @ApiOperation({ summary: 'Relatorio de vendas dos pedidos' })
  @ApiResponse({ status: 200, description: 'Relatorio de vendas' })
  async getSalesReport(@Query() query: ReportsQueryDto) {
    const report = await this.reportsService.getSalesAnalytics(query);
    return {
      success: true,
      data: report,
    };
  }

  @Get('reports/export')
  @ApiOperation({ summary: 'Exportar pedidos em CSV' })
  @ApiResponse({ status: 200, description: 'Arquivo CSV' })
  async exportCsv(
    @Query() query: ReportsQueryDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportOrdersCsv(query);
    const filename = `pedidos-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
