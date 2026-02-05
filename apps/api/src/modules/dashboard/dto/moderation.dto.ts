import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReportReason, ReportStatus } from '@prisma/client';

export class CreateReportDto {
  @ApiProperty({ enum: ReportReason })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiPropertyOptional({ description: 'Descrição adicional', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class ReportResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  report_id: string;
}

export class ReporterDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  avatar_url?: string;
}

export class ReportListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['post', 'comment'] })
  type: string;

  @ApiProperty()
  target_id: string;

  @ApiProperty({ enum: ReportReason })
  reason: ReportReason;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ type: ReporterDto })
  reporter: ReporterDto;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({ enum: ReportStatus })
  status: ReportStatus;
}

export class ReportsListResponseDto {
  @ApiProperty({ type: [ReportListItemDto] })
  reports: ReportListItemDto[];
}

export class ReportsQueryDto {
  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  offset?: number = 0;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export class SuspendUserDto {
  @ApiProperty({ description: 'Duração em dias (null = permanente)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration_days?: number;

  @ApiProperty({ description: 'Motivo da suspensão', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

export class SuspendUserResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiPropertyOptional()
  suspended_until?: Date;
}

export class ResolveReportDto {
  @ApiProperty({ enum: ['RESOLVED', 'DISMISSED'] })
  @IsEnum(['RESOLVED', 'DISMISSED'])
  status: 'RESOLVED' | 'DISMISSED';

  @ApiPropertyOptional({ description: 'Notas sobre a resolução', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  resolution?: string;
}
