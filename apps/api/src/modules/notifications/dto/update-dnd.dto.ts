import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  IsArray,
  IsInt,
  Min,
  Max,
  ArrayMaxSize,
} from 'class-validator';

export class UpdateDoNotDisturbDto {
  @ApiPropertyOptional({
    description: 'Habilitar modo Não Perturbe',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Hora de início (formato HH:mm)',
    example: '22:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime deve estar no formato HH:mm',
  })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Hora de término (formato HH:mm)',
    example: '07:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime deve estar no formato HH:mm',
  })
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Dias da semana ativos (0=Domingo, 6=Sábado)',
    example: [0, 1, 2, 3, 4, 5, 6],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];
}

export class DoNotDisturbResponseDto {
  @ApiProperty({ description: 'Modo DND habilitado' })
  enabled: boolean;

  @ApiProperty({ description: 'Hora de início', nullable: true })
  startTime: string | null;

  @ApiProperty({ description: 'Hora de término', nullable: true })
  endTime: string | null;

  @ApiProperty({ description: 'Dias da semana ativos', type: [Number] })
  daysOfWeek: number[];
}
