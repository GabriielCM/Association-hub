import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsPositive,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdminGrantDto {
  @ApiProperty({ description: 'ID do usuário' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Quantidade de pontos', minimum: 1 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Motivo do crédito' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

export class AdminDeductDto {
  @ApiProperty({ description: 'ID do usuário' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Quantidade de pontos', minimum: 1 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Motivo do débito' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

export class AdminRefundDto {
  @ApiProperty({ description: 'Motivo do estorno' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

export enum ReportPeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class ReportQueryDto {
  @ApiPropertyOptional({ enum: ReportPeriod, default: ReportPeriod.MONTH })
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod = ReportPeriod.MONTH;
}

export class ExportQueryDto {
  @ApiProperty({ description: 'Data inicial (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Data final (YYYY-MM-DD)' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: ['credit', 'debit'] })
  @IsOptional()
  @IsString()
  type?: 'credit' | 'debit';
}

export class UpdateConfigDto {
  @ApiPropertyOptional({ description: 'Pontos por check-in em eventos' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  checkInPoints?: number;

  @ApiPropertyOptional({ description: 'Pontos por post diário' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  dailyPostPoints?: number;

  @ApiPropertyOptional({ description: 'Pontos Strava por km (corrida)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  stravaRunPointsPerKm?: number;

  @ApiPropertyOptional({ description: 'Pontos Strava por km (bike)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  stravaRidePointsPerKm?: number;

  @ApiPropertyOptional({ description: 'Limite diário de km Strava' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  stravaDailyLimitKm?: number;

  @ApiPropertyOptional({ description: 'Tipos de atividade Strava elegíveis' })
  @IsOptional()
  @IsString({ each: true })
  stravaEligibleTypes?: string[];

  @ApiPropertyOptional({ description: 'Strava habilitado' })
  @IsOptional()
  stravaEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Post diário habilitado' })
  @IsOptional()
  dailyPostEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Taxa de conversão pontos para R$' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  pointsToMoneyRate?: number;
}
