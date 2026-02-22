import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsIn,
  Min,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType, PaymentOptions } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ description: 'ID da categoria' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'Nome do produto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Slug único' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ description: 'Descrição curta' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional({ description: 'Descrição completa' })
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiPropertyOptional({ description: 'Tipo do produto', enum: ProductType })
  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @ApiPropertyOptional({ description: 'Preço em pontos' })
  @IsInt()
  @Min(0)
  @IsOptional()
  pricePoints?: number;

  @ApiPropertyOptional({ description: 'Preço em reais' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMoney?: number;

  @ApiPropertyOptional({ description: 'Opções de pagamento', enum: PaymentOptions })
  @IsEnum(PaymentOptions)
  @IsOptional()
  paymentOptions?: PaymentOptions;

  @ApiPropertyOptional({ description: 'Permitir pagamento misto', default: true })
  @IsBoolean()
  @IsOptional()
  allowMixedPayment?: boolean;

  @ApiPropertyOptional({ description: 'Tipo de estoque', default: 'limited' })
  @IsString()
  @IsOptional()
  stockType?: string;

  @ApiPropertyOptional({ description: 'Quantidade em estoque' })
  @IsInt()
  @Min(0)
  @IsOptional()
  stockCount?: number;

  @ApiPropertyOptional({ description: 'Limite por usuário' })
  @IsInt()
  @Min(1)
  @IsOptional()
  limitPerUser?: number;

  @ApiPropertyOptional({ description: 'Percentual de cashback' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cashbackPercent?: number;

  @ApiPropertyOptional({ description: 'Dias de validade do voucher (se tipo = VOUCHER)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  voucherValidityDays?: number;

  @ApiPropertyOptional({ description: 'Local de retirada' })
  @IsString()
  @IsOptional()
  pickupLocation?: string;

  @ApiPropertyOptional({ description: 'IDs dos planos elegíveis', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  eligiblePlans?: string[];

  @ApiPropertyOptional({ description: 'Produto em destaque', default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'ID da categoria' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Nome do produto' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Slug único' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: 'Descrição curta' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional({ description: 'Descrição completa' })
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiPropertyOptional({ description: 'Tipo do produto', enum: ProductType })
  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @ApiPropertyOptional({ description: 'Preço em pontos' })
  @IsInt()
  @Min(0)
  @IsOptional()
  pricePoints?: number;

  @ApiPropertyOptional({ description: 'Preço em reais' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMoney?: number;

  @ApiPropertyOptional({ description: 'Opções de pagamento', enum: PaymentOptions })
  @IsEnum(PaymentOptions)
  @IsOptional()
  paymentOptions?: PaymentOptions;

  @ApiPropertyOptional({ description: 'Permitir pagamento misto' })
  @IsBoolean()
  @IsOptional()
  allowMixedPayment?: boolean;

  @ApiPropertyOptional({ description: 'Tipo de estoque' })
  @IsString()
  @IsOptional()
  stockType?: string;

  @ApiPropertyOptional({ description: 'Quantidade em estoque' })
  @IsInt()
  @Min(0)
  @IsOptional()
  stockCount?: number;

  @ApiPropertyOptional({ description: 'Limite por usuário' })
  @IsInt()
  @Min(1)
  @IsOptional()
  limitPerUser?: number;

  @ApiPropertyOptional({ description: 'Percentual de cashback' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cashbackPercent?: number;

  @ApiPropertyOptional({ description: 'Dias de validade do voucher' })
  @IsInt()
  @Min(1)
  @IsOptional()
  voucherValidityDays?: number;

  @ApiPropertyOptional({ description: 'Local de retirada' })
  @IsString()
  @IsOptional()
  pickupLocation?: string;

  @ApiPropertyOptional({ description: 'IDs dos planos elegíveis', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  eligiblePlans?: string[];

  @ApiPropertyOptional({ description: 'Produto ativo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Produto em destaque' })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class ProductQueryDto {
  @ApiPropertyOptional({ description: 'ID da categoria' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Tipo de produto', enum: ProductType })
  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @ApiPropertyOptional({ description: 'Busca por nome' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Apenas produtos em destaque' })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Apenas produtos promocionais' })
  @IsBoolean()
  @IsOptional()
  promotional?: boolean;

  @ApiPropertyOptional({ description: 'Página', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Ordenação',
    enum: ['recent', 'price_asc', 'price_desc', 'best_selling', 'name_asc'],
  })
  @IsIn(['recent', 'price_asc', 'price_desc', 'best_selling', 'name_asc'])
  @IsOptional()
  sort?: string;
}

export class CreateVariantDto {
  @ApiProperty({ description: 'SKU único' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ description: 'Nome da variação', example: 'M - Azul' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Atributos', example: { size: 'M', color: 'Azul' } })
  @IsObject()
  attributes: Record<string, string>;

  @ApiPropertyOptional({ description: 'Preço em pontos (override)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  pricePoints?: number;

  @ApiPropertyOptional({ description: 'Preço em reais (override)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMoney?: number;

  @ApiPropertyOptional({ description: 'Estoque', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stockCount?: number;

  @ApiPropertyOptional({ description: 'URL da imagem' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateVariantDto {
  @ApiPropertyOptional({ description: 'Nome da variação' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Preço em pontos' })
  @IsInt()
  @Min(0)
  @IsOptional()
  pricePoints?: number;

  @ApiPropertyOptional({ description: 'Preço em reais' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMoney?: number;

  @ApiPropertyOptional({ description: 'Estoque' })
  @IsInt()
  @Min(0)
  @IsOptional()
  stockCount?: number;

  @ApiPropertyOptional({ description: 'Ativo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SetPromotionDto {
  @ApiProperty({ description: 'Preço promocional em pontos' })
  @IsInt()
  @Min(0)
  @IsOptional()
  promotionalPricePoints?: number;

  @ApiProperty({ description: 'Preço promocional em reais' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  promotionalPriceMoney?: number;

  @ApiProperty({ description: 'Data de término da promoção' })
  @IsString()
  endsAt: string;
}
