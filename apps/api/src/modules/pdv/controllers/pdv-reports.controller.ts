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
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/types';
import { ReportsQueryDto } from '../../../common/dto/reports-query.dto';
import { PdvReportsService } from '../pdv-reports.service';

@ApiTags('admin/pdv/reports')
@Controller('admin/pdv/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class PdvReportsController {
  constructor(private readonly reportsService: PdvReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Relatorio de vendas do PDV' })
  @ApiResponse({ status: 200, description: 'Relatorio de vendas' })
  async getSalesReport(
    @Query() query: ReportsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const report = await this.reportsService.getSalesAnalytics(user.associationId, query);
    return {
      success: true,
      data: report,
    };
  }

  @Get('export')
  @ApiOperation({ summary: 'Exportar vendas do PDV em CSV' })
  @ApiResponse({ status: 200, description: 'Arquivo CSV' })
  async exportSalesCsv(
    @Query() query: ReportsQueryDto,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportSalesCsv(user.associationId, query);
    const filename = `pdv-vendas-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
