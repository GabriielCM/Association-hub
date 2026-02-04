import {
  IsOptional,
  IsInt,
  IsString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventCategory, EventStatus } from '@prisma/client';

export enum EventFilter {
  ALL = 'all',
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  PAST = 'past',
  CONFIRMED = 'confirmed', // Events user confirmed
}

export class EventQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  perPage?: number = 20;

  @IsOptional()
  @IsEnum(EventFilter)
  filter?: EventFilter = EventFilter.UPCOMING;

  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory;

  @IsOptional()
  @IsString()
  search?: string;
}

export class AdminEventQueryDto extends EventQueryDto {
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
