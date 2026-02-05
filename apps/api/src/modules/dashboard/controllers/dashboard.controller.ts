import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { DashboardService } from '../services/dashboard.service';
import { DashboardSummaryResponseDto } from '../dto/dashboard-summary.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Obter resumo do dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Resumo do dashboard',
    type: DashboardSummaryResponseDto,
  })
  async getSummary(@Request() req: any): Promise<DashboardSummaryResponseDto> {
    return this.dashboardService.getSummary(
      req.user.id,
      req.user.associationId,
    );
  }
}
