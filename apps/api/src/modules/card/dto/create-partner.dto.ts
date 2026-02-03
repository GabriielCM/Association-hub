import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsUrl,
  IsBoolean,
  IsArray,
  IsEnum,
  MaxLength,
  IsObject,
} from 'class-validator';
import { AudienceType } from '@prisma/client';

export class CreatePartnerDto {
  @ApiProperty({ description: 'ID da categoria' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Nome do parceiro', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'URL do logo' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'URL do banner' })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @ApiProperty({ description: 'Benefício oferecido', example: '15% de desconto' })
  @IsString()
  @MaxLength(200)
  benefit: string;

  @ApiPropertyOptional({ description: 'Instruções de uso' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  instructions?: string;

  // Address
  @ApiPropertyOptional({ description: 'Rua' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ description: 'Cidade' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Estado' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'CEP' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  lng?: number;

  // Contact
  @ApiPropertyOptional({ description: 'Telefone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Website' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Instagram (sem @)' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ description: 'Facebook' })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({ description: 'WhatsApp' })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  // Business hours as JSON
  @ApiPropertyOptional({
    description: 'Horário de funcionamento',
    example: { monday: '09:00-18:00', tuesday: '09:00-18:00' },
  })
  @IsOptional()
  @IsObject()
  businessHours?: Record<string, string>;

  // Audience
  @ApiPropertyOptional({
    enum: AudienceType,
    isArray: true,
    default: ['ALL'],
    description: 'Público-alvo',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AudienceType, { each: true })
  eligibleAudiences?: AudienceType[];

  @ApiPropertyOptional({
    description: 'IDs de planos elegíveis (se público = SPECIFIC_PLANS)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligiblePlanIds?: string[];

  @ApiPropertyOptional({
    default: true,
    description: 'Mostrar para usuários não elegíveis?',
  })
  @IsOptional()
  @IsBoolean()
  showLocked?: boolean;
}

export class UpdatePartnerDto extends CreatePartnerDto {
  @ApiPropertyOptional({ description: 'Ativo?' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Badge NOVO?' })
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;
}
