import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsBoolean,
  IsObject,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

// ==========================================
// USER DTOs
// ==========================================

export class SubscribeDto {
  @ApiProperty({ description: 'ID do plano a assinar' })
  @IsString()
  @IsNotEmpty()
  planId: string;
}

export class ChangePlanDto {
  @ApiProperty({ description: 'ID do novo plano' })
  @IsString()
  @IsNotEmpty()
  planId: string;
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({ description: 'Motivo do cancelamento' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class HistoryQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}

// ==========================================
// ADMIN DTOs
// ==========================================

export class MutatorsDto {
  @ApiPropertyOptional({ description: 'Multiplicador de pontos em eventos', default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  points_events?: number;

  @ApiPropertyOptional({ description: 'Multiplicador de pontos Strava', default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  points_strava?: number;

  @ApiPropertyOptional({ description: 'Multiplicador de pontos posts', default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  points_posts?: number;

  @ApiPropertyOptional({ description: 'Desconto na loja (%)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_store?: number;

  @ApiPropertyOptional({ description: 'Desconto no PDV (%)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_pdv?: number;

  @ApiPropertyOptional({ description: 'Desconto em espaços (%)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount_spaces?: number;

  @ApiPropertyOptional({ description: 'Cashback (%)', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cashback?: number;
}

export class CreatePlanDto {
  @ApiProperty({ description: 'Nome do plano', minLength: 3, maxLength: 50 })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: 'Descrição do plano', minLength: 10, maxLength: 500 })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @ApiProperty({ description: 'Preço mensal em centavos', minimum: 1 })
  @IsNumber()
  @Min(1)
  @Max(999999)
  priceMonthly: number;

  @ApiPropertyOptional({ description: 'URL do ícone' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ description: 'Cor em hexadecimal', default: '#6366F1' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Ordem de exibição (1-3)', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Mutadores de benefícios' })
  @IsOptional()
  @IsObject()
  mutators?: MutatorsDto;
}

export class UpdatePlanDto {
  @ApiPropertyOptional({ description: 'Nome do plano', minLength: 3, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: 'Descrição do plano', minLength: 10, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Preço mensal em centavos' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  priceMonthly?: number;

  @ApiPropertyOptional({ description: 'URL do ícone' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ description: 'Cor em hexadecimal' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Ordem de exibição (1-3)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Mutadores de benefícios' })
  @IsOptional()
  @IsObject()
  mutators?: MutatorsDto;

  @ApiPropertyOptional({ description: 'Se o plano está ativo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SuspendUserDto {
  @ApiProperty({ description: 'Motivo da suspensão' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

export enum SubscriberStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

export class SubscribersQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por plano' })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiPropertyOptional({ enum: SubscriberStatus })
  @IsOptional()
  @IsEnum(SubscriberStatus)
  status?: SubscriberStatus;

  @ApiPropertyOptional({ description: 'Buscar por nome ou email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export enum ReportPeriod {
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  NINETY_DAYS = '90d',
  TWELVE_MONTHS = '12m',
}

export class ReportQueryDto {
  @ApiPropertyOptional({ enum: ReportPeriod, default: ReportPeriod.THIRTY_DAYS })
  @IsOptional()
  @IsEnum(ReportPeriod)
  period?: ReportPeriod = ReportPeriod.THIRTY_DAYS;
}

// ==========================================
// DEFAULT MUTATORS
// ==========================================

export const DEFAULT_MUTATORS: MutatorsDto = {
  points_events: 1.0,
  points_strava: 1.0,
  points_posts: 1.0,
  discount_store: 0,
  discount_pdv: 0,
  discount_spaces: 0,
  cashback: 5.0,
};
