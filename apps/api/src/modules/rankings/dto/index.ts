import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum RankingPeriod {
  ALL_TIME = 'all_time',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
}

export class RankingQueryDto {
  @ApiPropertyOptional({
    enum: RankingPeriod,
    default: RankingPeriod.ALL_TIME,
  })
  @IsOptional()
  @IsEnum(RankingPeriod)
  period?: RankingPeriod = RankingPeriod.ALL_TIME;

  @ApiPropertyOptional({ default: 10, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export interface RankingEntry {
  position: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  value: number;
  isCurrentUser: boolean;
}

export interface RankingResponseDto {
  type: string;
  period: string;
  updatedAt: Date;
  entries: RankingEntry[];
  currentUser?: {
    position: number;
    value: number;
  };
}
