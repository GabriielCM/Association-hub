import {
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  IsOptional,
  IsUrl,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { EventCategory, BadgeCriteria } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @IsEnum(EventCategory)
  category: EventCategory;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex color' })
  color?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  locationName: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  locationAddress?: string;

  @IsOptional()
  @IsUrl()
  bannerFeed?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  bannerDisplay?: string[];

  @IsInt()
  @Min(1)
  @Max(10000)
  pointsTotal: number;

  @IsInt()
  @Min(1)
  @Max(20)
  checkinsCount: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440) // max 24 hours in minutes
  checkinInterval?: number;

  @IsOptional()
  @IsString()
  badgeId?: string;

  @IsOptional()
  @IsEnum(BadgeCriteria)
  badgeCriteria?: BadgeCriteria;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsUrl()
  externalLink?: string;
}
