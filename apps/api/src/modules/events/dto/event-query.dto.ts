import {
  IsOptional,
  IsInt,
  IsString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventCategory, EventStatus } from '@prisma/client';

export enum EventFilter {
  ALL = 'all',
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  PAST = 'past',
  CONFIRMED = 'confirmed',
}

export class EventQueryDto {
  @ApiPropertyOptional({ description: 'Número da página', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  perPage?: number = 20;

  @ApiPropertyOptional({
    description: 'Filtro de eventos',
    enum: EventFilter,
    default: EventFilter.UPCOMING,
  })
  @IsOptional()
  @IsEnum(EventFilter)
  filter?: EventFilter = EventFilter.UPCOMING;

  @ApiPropertyOptional({
    description: 'Categoria do evento',
    enum: EventCategory,
  })
  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory;

  @ApiPropertyOptional({ description: 'Busca por título ou descrição' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class AdminEventQueryDto extends EventQueryDto {
  @ApiPropertyOptional({
    description: 'Status do evento (apenas admin)',
    enum: EventStatus,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
