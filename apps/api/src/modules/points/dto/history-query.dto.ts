import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsDateString, Min, Max, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum TransactionTypeFilter {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export class HistoryQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  perPage?: number = 20;

  @ApiPropertyOptional({ enum: TransactionTypeFilter })
  @IsOptional()
  @IsEnum(TransactionTypeFilter)
  type?: TransactionTypeFilter;

  @ApiPropertyOptional({ description: 'Filtro por fonte (EVENT_CHECKIN, STRAVA_ACTIVITY, etc)' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Data inicial (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data final (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class TransactionDto {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  source: string;
  sourceId?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export class HistoryResponseDto {
  data: TransactionDto[];
  meta: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
  };
}
