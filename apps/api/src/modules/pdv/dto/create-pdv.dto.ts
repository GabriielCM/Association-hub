import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional, IsEnum } from 'class-validator';
import { PdvStatus } from '@prisma/client';

export class CreatePdvDto {
  @ApiProperty({ description: 'Nome do PDV', example: 'PDV Bar Principal' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Localização do PDV', example: 'Térreo - Entrada Principal' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ description: 'Configurações do display' })
  @IsObject()
  @IsOptional()
  displayConfig?: {
    theme?: string;
    idleTimeout?: number;
    checkoutTimeout?: number;
  };
}

export class UpdatePdvDto {
  @ApiPropertyOptional({ description: 'Nome do PDV' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Localização do PDV' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Status do PDV', enum: PdvStatus })
  @IsEnum(PdvStatus)
  @IsOptional()
  status?: PdvStatus;

  @ApiPropertyOptional({ description: 'Configurações do display' })
  @IsObject()
  @IsOptional()
  displayConfig?: {
    theme?: string;
    idleTimeout?: number;
    checkoutTimeout?: number;
  };
}
