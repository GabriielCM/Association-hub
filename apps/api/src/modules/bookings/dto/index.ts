import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BookingPeriodType, BookingStatus } from '@prisma/client';

// ===========================================
// CREATE BOOKING DTO
// ===========================================

export class CreateBookingDto {
  @ApiProperty({ example: 'space-id-123' })
  @IsString()
  spaceId: string;

  @ApiProperty({ example: '2026-03-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: BookingPeriodType, example: 'DAY' })
  @IsEnum(BookingPeriodType)
  periodType: BookingPeriodType;

  // For SHIFT bookings
  @ApiPropertyOptional({ example: 'Manhã' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  shiftName?: string;

  // For HOUR bookings
  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsOptional()
  @IsString()
  endTime?: string;
}

// ===========================================
// APPROVAL/REJECTION DTOs
// ===========================================

export class ApproveBookingDto {
  // No additional fields needed for approval
}

export class RejectBookingDto {
  @ApiPropertyOptional({ example: 'Conflito com evento interno' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class CancelBookingDto {
  @ApiPropertyOptional({ example: 'Não poderei comparecer' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

// ===========================================
// WAITLIST DTOs
// ===========================================

export class JoinWaitlistDto {
  @ApiProperty({ example: 'space-id-123' })
  @IsString()
  spaceId: string;

  @ApiProperty({ example: '2026-03-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: BookingPeriodType, example: 'DAY' })
  @IsEnum(BookingPeriodType)
  periodType: BookingPeriodType;

  @ApiPropertyOptional({ example: 'Manhã' })
  @IsOptional()
  @IsString()
  shiftName?: string;

  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsOptional()
  @IsString()
  endTime?: string;
}

export class ConfirmWaitlistDto {
  @ApiProperty({ example: true })
  accept: boolean;
}

// ===========================================
// QUERY DTOs
// ===========================================

export class BookingQueryDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ example: 'space-id-123' })
  @IsOptional()
  @IsString()
  spaceId?: string;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

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

export class AdminBookingQueryDto extends BookingQueryDto {
  @ApiPropertyOptional({ example: 'user-id-123' })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class MyBookingsQueryDto {
  @ApiPropertyOptional({ enum: ['pending', 'approved', 'history'] })
  @IsOptional()
  @IsString()
  tab?: 'pending' | 'approved' | 'history';

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

// ===========================================
// RESPONSE DTOs
// ===========================================

export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  spaceId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  date: Date;

  @ApiProperty({ enum: BookingPeriodType })
  periodType: BookingPeriodType;

  @ApiPropertyOptional()
  shiftName?: string;

  @ApiPropertyOptional()
  shiftStart?: string;

  @ApiPropertyOptional()
  shiftEnd?: string;

  @ApiPropertyOptional()
  startTime?: string;

  @ApiPropertyOptional()
  endTime?: string;

  @ApiPropertyOptional()
  totalFee?: number;

  @ApiPropertyOptional()
  discountApplied?: number;

  @ApiPropertyOptional()
  finalFee?: number;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class WaitlistPositionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  position: number;

  @ApiProperty()
  spaceId: string;

  @ApiProperty()
  date: Date;

  @ApiPropertyOptional()
  notifiedAt?: Date;

  @ApiPropertyOptional()
  expiresAt?: Date;
}
