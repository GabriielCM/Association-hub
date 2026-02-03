import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CardUsageType } from '@prisma/client';

export class CardHistoryQueryDto {
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

  @ApiPropertyOptional({
    enum: CardUsageType,
    description: 'Filtrar por tipo de uso',
  })
  @IsOptional()
  @IsEnum(CardUsageType)
  type?: CardUsageType;
}
