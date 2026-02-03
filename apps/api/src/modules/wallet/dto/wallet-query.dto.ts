import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

export enum SummaryPeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class WalletSummaryQueryDto {
  @ApiPropertyOptional({
    enum: SummaryPeriod,
    default: SummaryPeriod.MONTH,
    description: 'Período do resumo',
  })
  @IsOptional()
  @IsEnum(SummaryPeriod)
  period?: SummaryPeriod = SummaryPeriod.MONTH;
}
