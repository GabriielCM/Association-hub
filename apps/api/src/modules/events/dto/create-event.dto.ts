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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventCategory, BadgeCriteria } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty({
    description: 'Título do evento',
    minLength: 5,
    maxLength: 100,
    example: 'Happy Hour de Fim de Ano',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada do evento',
    minLength: 10,
    maxLength: 2000,
    example: 'Venha celebrar conosco o encerramento de mais um ano incrível!',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({
    description: 'Categoria do evento',
    enum: EventCategory,
    example: 'SOCIAL',
  })
  @IsEnum(EventCategory)
  category: EventCategory;

  @ApiPropertyOptional({
    description: 'Cor do evento em hexadecimal',
    pattern: '^#[0-9A-Fa-f]{6}$',
    example: '#6366F1',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex color' })
  color?: string;

  @ApiProperty({
    description: 'Data/hora de início (ISO 8601)',
    example: '2024-12-20T19:00:00Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Data/hora de término (ISO 8601)',
    example: '2024-12-20T23:00:00Z',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Nome do local',
    minLength: 3,
    maxLength: 200,
    example: 'Salão Principal',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  locationName: string;

  @ApiPropertyOptional({
    description: 'Endereço completo do local',
    maxLength: 500,
    example: 'Av. Paulista, 1000 - São Paulo, SP',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  locationAddress?: string;

  @ApiPropertyOptional({
    description: 'URL do banner para o feed',
    example: 'https://storage.ahub.com.br/events/banner-feed.jpg',
  })
  @IsOptional()
  @IsUrl()
  bannerFeed?: string;

  @ApiPropertyOptional({
    description: 'URLs dos banners para display (TV/Kiosk)',
    type: [String],
    example: ['https://storage.ahub.com.br/events/display-1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  bannerDisplay?: string[];

  @ApiProperty({
    description: 'Total de pontos a distribuir no evento',
    minimum: 1,
    maximum: 10000,
    example: 100,
  })
  @IsInt()
  @Min(1)
  @Max(10000)
  pointsTotal: number;

  @ApiProperty({
    description: 'Quantidade de check-ins do evento',
    minimum: 1,
    maximum: 20,
    example: 3,
  })
  @IsInt()
  @Min(1)
  @Max(20)
  checkinsCount: number;

  @ApiPropertyOptional({
    description: 'Intervalo entre check-ins (minutos)',
    minimum: 0,
    maximum: 1440,
    example: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  checkinInterval?: number;

  @ApiPropertyOptional({
    description: 'ID do badge a conceder',
    example: 'badge_abc123',
  })
  @IsOptional()
  @IsString()
  badgeId?: string;

  @ApiPropertyOptional({
    description: 'Critério para ganhar o badge',
    enum: BadgeCriteria,
    example: 'ALL_CHECKINS',
  })
  @IsOptional()
  @IsEnum(BadgeCriteria)
  badgeCriteria?: BadgeCriteria;

  @ApiPropertyOptional({
    description: 'Capacidade máxima de participantes',
    minimum: 1,
    example: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Link externo relacionado ao evento',
    example: 'https://exemplo.com/inscricao',
  })
  @IsOptional()
  @IsUrl()
  externalLink?: string;
}
