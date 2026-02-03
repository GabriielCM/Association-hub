import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

export enum SummaryPeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class SummaryQueryDto {
  @ApiPropertyOptional({
    enum: SummaryPeriod,
    default: SummaryPeriod.MONTH,
    description: 'Período do resumo',
  })
  @IsOptional()
  @IsEnum(SummaryPeriod)
  period?: SummaryPeriod = SummaryPeriod.MONTH;
}

export class SummaryResponseDto {
  period: string;
  startDate: string;
  endDate: string;
  earned: number;
  spent: number;
  net: number;
  bySource: Record<string, number>;
  byDestination: Record<string, number>;
}
