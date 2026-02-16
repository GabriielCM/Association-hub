import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';

export class ReportsQueryDto {
  @ApiPropertyOptional({
    description: 'Período pré-definido',
    enum: ['today', 'week', 'month', 'year'],
    example: 'month',
  })
  @IsEnum(['today', 'week', 'month', 'year'])
  @IsOptional()
  period?: 'today' | 'week' | 'month' | 'year' = 'month';

  @ApiPropertyOptional({
    description: 'Data inicial (sobrescreve period)',
    example: '2026-01-01',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Data final',
    example: '2026-12-31',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Agrupar por',
    enum: ['day', 'week', 'month'],
    example: 'day',
  })
  @IsEnum(['day', 'week', 'month'])
  @IsOptional()
  groupBy?: 'day' | 'week' | 'month' = 'day';
}
