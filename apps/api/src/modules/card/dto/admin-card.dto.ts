import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CardStatus } from '@prisma/client';

export class UpdateCardStatusDto {
  @ApiProperty({
    enum: CardStatus,
    description: 'Novo status da carteirinha',
  })
  @IsEnum(CardStatus)
  status: CardStatus;

  @ApiPropertyOptional({ description: 'Motivo da alteração de status' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ListCardsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  perPage?: number = 20;

  @ApiPropertyOptional({ description: 'Buscar por nome ou número da carteirinha' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: CardStatus,
    description: 'Filtrar por status',
  })
  @IsOptional()
  @IsEnum(CardStatus)
  status?: CardStatus;
}
