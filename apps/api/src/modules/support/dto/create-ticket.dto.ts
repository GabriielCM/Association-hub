import { IsString, IsEnum, IsOptional, IsArray, MinLength, MaxLength, ArrayMaxSize } from 'class-validator';
import { TicketCategory } from '@prisma/client';

export class CreateTicketDto {
  @IsEnum(TicketCategory)
  category: TicketCategory;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  subject: string;

  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  attachmentIds?: string[];
}

export class CreateAutomaticTicketDto {
  @IsString()
  errorType: string;

  @IsOptional()
  deviceInfo?: {
    platform: 'ios' | 'android';
    osVersion: string;
    appVersion: string;
    deviceModel: string;
    stackTrace?: string;
  };
}

export class CreateTicketMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  attachmentIds?: string[];
}

export class RateTicketDto {
  @IsString()
  rating: number; // 1-5

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
