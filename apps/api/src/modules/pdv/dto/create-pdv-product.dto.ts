import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreatePdvProductDto {
  @ApiProperty({ description: 'Nome do produto', example: 'Cerveja Long Neck' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Descrição do produto' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'URL da imagem do produto' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Preço em pontos', example: 50 })
  @IsNumber()
  @IsPositive()
  pricePoints: number;

  @ApiProperty({ description: 'Preço em reais', example: 15.0 })
  @IsNumber()
  @IsPositive()
  priceMoney: number;

  @ApiPropertyOptional({ description: 'Categoria do produto', example: 'Bebidas' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Estoque inicial', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;
}

export class UpdatePdvProductDto {
  @ApiPropertyOptional({ description: 'Nome do produto' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Descrição do produto' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'URL da imagem do produto' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Preço em pontos' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  pricePoints?: number;

  @ApiPropertyOptional({ description: 'Preço em reais' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  priceMoney?: number;

  @ApiPropertyOptional({ description: 'Categoria do produto' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Estoque' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ description: 'Produto ativo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateStockDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Quantidade a ajustar (positivo = entrada, negativo = saída)' })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ description: 'Motivo do ajuste' })
  @IsString()
  @IsOptional()
  reason?: string;
}
