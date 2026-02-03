import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RankingsService } from './rankings.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import type { JwtPayload } from '../../common/types';
import { RankingQueryDto, RankingPeriod } from './dto';

@ApiTags('rankings')
@Controller('rankings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get('points')
  @ApiOperation({ summary: 'Ranking geral por pontos acumulados' })
  @ApiResponse({ status: 200, description: 'Ranking retornado com sucesso' })
  async getPointsRanking(
    @CurrentUser() user: JwtPayload,
    @Query() query: RankingQueryDto,
  ) {
    const data = await this.rankingsService.getPointsRanking(
      user.sub,
      user.associationId,
      query.period || RankingPeriod.ALL_TIME,
      query.limit || 10,
    );
    return { data };
  }

  @Get('events')
  @ApiOperation({ summary: 'Ranking por check-ins em eventos' })
  @ApiResponse({ status: 200, description: 'Ranking retornado com sucesso' })
  async getEventsRanking(
    @CurrentUser() user: JwtPayload,
    @Query() query: RankingQueryDto,
  ) {
    const data = await this.rankingsService.getEventsRanking(
      user.sub,
      user.associationId,
      query.period || RankingPeriod.ALL_TIME,
      query.limit || 10,
    );
    return { data };
  }

  @Get('strava')
  @ApiOperation({ summary: 'Ranking por atividades físicas (km)' })
  @ApiResponse({ status: 200, description: 'Ranking retornado com sucesso' })
  async getStravaRanking(
    @CurrentUser() user: JwtPayload,
    @Query() query: RankingQueryDto,
  ) {
    const data = await this.rankingsService.getStravaRanking(
      user.sub,
      user.associationId,
      query.period || RankingPeriod.ALL_TIME,
      query.limit || 10,
    );
    return { data };
  }
}
