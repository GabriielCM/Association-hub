import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, MaxLength, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Nome da categoria', example: 'Alimentação' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Slug único da categoria',
    example: 'food',
  })
  @IsString()
  @MaxLength(30)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug deve conter apenas letras minúsculas, números e hífens',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Ícone da categoria (emoji ou nome)',
    default: 'gift',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Cor da categoria (hex)',
    default: '#6366F1',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Cor deve estar no formato hexadecimal (#RRGGBB)',
  })
  color?: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Nome da categoria' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: 'Ícone da categoria' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Cor da categoria (hex)' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Cor deve estar no formato hexadecimal (#RRGGBB)',
  })
  color?: string;

  @ApiPropertyOptional({ description: 'Ordem de exibição' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: 'Ativo?' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
