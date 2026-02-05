import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
  MinLength,
  IsDateString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BookingPeriodType, SpaceStatus } from '@prisma/client';

// ===========================================
// SHIFT DTO (for space configuration)
// ===========================================

export class ShiftDto {
  @ApiProperty({ example: 'Manhã' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '12:00' })
  @IsString()
  endTime: string;
}

// ===========================================
// CREATE SPACE DTO
// ===========================================

export class CreateSpaceDto {
  @ApiProperty({ example: 'Churrasqueira 1' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Churrasqueira coberta com capacidade para 30 pessoas' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  @Max(1000)
  capacity: number;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/image1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ example: 150.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fee?: number;

  @ApiProperty({ enum: BookingPeriodType, example: 'DAY' })
  @IsEnum(BookingPeriodType)
  periodType: BookingPeriodType;

  @ApiPropertyOptional({ type: [ShiftDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftDto)
  shifts?: ShiftDto[];

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiPropertyOptional({ example: '22:00' })
  @IsOptional()
  @IsString()
  closingTime?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minDurationHours?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(365)
  minAdvanceDays?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  maxAdvanceDays?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(12)
  bookingIntervalMonths?: number;

  @ApiPropertyOptional({ example: ['space-id-1', 'space-id-2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  blockedSpaceIds?: string[];
}

export class UpdateSpaceDto extends PartialType(CreateSpaceDto) {}

// ===========================================
// SPACE STATUS DTO
// ===========================================

export class UpdateSpaceStatusDto {
  @ApiProperty({ enum: SpaceStatus, example: 'MAINTENANCE' })
  @IsEnum(SpaceStatus)
  status: SpaceStatus;
}

// ===========================================
// SPACE BLOCK DTO
// ===========================================

export class CreateSpaceBlockDto {
  @ApiProperty({ example: '2026-03-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Manutenção programada' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class CreateSpaceBlockBulkDto {
  @ApiProperty({ type: [String], example: ['2026-03-15', '2026-03-16'] })
  @IsArray()
  @IsDateString({}, { each: true })
  dates: string[];

  @ApiPropertyOptional({ example: 'Feriado prolongado' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

// ===========================================
// QUERY DTOs
// ===========================================

export class SpaceQueryDto {
  @ApiPropertyOptional({ enum: SpaceStatus })
  @IsOptional()
  @IsEnum(SpaceStatus)
  status?: SpaceStatus;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class SpaceAvailabilityQueryDto {
  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-03-31' })
  @IsDateString()
  endDate: string;
}

// ===========================================
// RESPONSE DTOs (for Swagger documentation)
// ===========================================

export class SpaceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  capacity: number;

  @ApiProperty()
  images: string[];

  @ApiPropertyOptional()
  mainImageUrl?: string;

  @ApiProperty()
  fee: number;

  @ApiProperty({ enum: BookingPeriodType })
  periodType: BookingPeriodType;

  @ApiPropertyOptional()
  shifts?: ShiftDto[];

  @ApiPropertyOptional()
  openingTime?: string;

  @ApiPropertyOptional()
  closingTime?: string;

  @ApiPropertyOptional()
  minDurationHours?: number;

  @ApiProperty()
  minAdvanceDays: number;

  @ApiProperty()
  maxAdvanceDays: number;

  @ApiProperty()
  bookingIntervalMonths: number;

  @ApiProperty()
  blockedSpaceIds: string[];

  @ApiProperty({ enum: SpaceStatus })
  status: SpaceStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SpaceAvailabilityResponseDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  available: boolean;

  @ApiPropertyOptional()
  reason?: 'blocked' | 'booked' | 'maintenance' | 'past' | 'outside_advance';

  @ApiPropertyOptional()
  shift?: string;
}
