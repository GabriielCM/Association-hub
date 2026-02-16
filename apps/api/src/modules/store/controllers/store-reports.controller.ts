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
import { StoreReportsService } from '../services/reports.service';

@ApiTags('admin/store/reports')
@Controller('admin/store/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class StoreReportsController {
  constructor(private readonly reportsService: StoreReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Relatorio de vendas da loja' })
  @ApiResponse({ status: 200, description: 'Relatorio de vendas' })
  async getSalesReport(@Query() query: ReportsQueryDto) {
    const report = await this.reportsService.getSalesAnalytics(query);
    return {
      success: true,
      data: report,
    };
  }

  @Get('products')
  @ApiOperation({ summary: 'Vendas por produto' })
  @ApiResponse({ status: 200, description: 'Breakdown por produto' })
  async getProductSalesReport(@Query() query: ReportsQueryDto) {
    const products = await this.reportsService.getProductSalesReport(query);
    return {
      success: true,
      data: products,
    };
  }

  @Get('export')
  @ApiOperation({ summary: 'Exportar vendas da loja em CSV' })
  @ApiResponse({ status: 200, description: 'Arquivo CSV' })
  async exportCsv(
    @Query() query: ReportsQueryDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportSalesCsv(query);
    const filename = `loja-vendas-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
