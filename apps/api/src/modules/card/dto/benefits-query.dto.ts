import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum BenefitsSortBy {
  NAME = 'name',
  DISTANCE = 'distance',
  RECENT = 'recent',
}

export class BenefitsQueryDto {
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

  @ApiPropertyOptional({ description: 'Buscar por nome do parceiro' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por categoria (slug)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    enum: BenefitsSortBy,
    default: BenefitsSortBy.NAME,
    description: 'Ordenar por',
  })
  @IsOptional()
  @IsEnum(BenefitsSortBy)
  sortBy?: BenefitsSortBy = BenefitsSortBy.NAME;
}

export class NearbyQueryDto {
  @ApiPropertyOptional({ description: 'Latitude do usuário', example: -23.5505 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ description: 'Longitude do usuário', example: -46.6333 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ default: 10, description: 'Raio de busca em km' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  radius?: number = 10;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
