import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({ description: 'ID da variação (se aplicável)' })
  @IsString()
  @IsOptional()
  variantId?: string;

  @ApiProperty({ description: 'Quantidade', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'Nova quantidade', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CartResponseDto {
  @ApiProperty({ description: 'ID do carrinho' })
  id: string;

  @ApiProperty({ description: 'Itens do carrinho' })
  items: CartItemResponseDto[];

  @ApiProperty({ description: 'Subtotal em pontos' })
  subtotalPoints: number;

  @ApiProperty({ description: 'Subtotal em reais' })
  subtotalMoney: number;

  @ApiProperty({ description: 'Total de itens' })
  itemCount: number;

  @ApiPropertyOptional({ description: 'Reserva expira em' })
  reservedUntil?: Date;
}

export class CartItemResponseDto {
  @ApiProperty({ description: 'ID do item' })
  id: string;

  @ApiProperty({ description: 'Produto' })
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    type: string;
  };

  @ApiPropertyOptional({ description: 'Variação' })
  variant?: {
    id: string;
    name: string;
    imageUrl?: string;
  };

  @ApiProperty({ description: 'Quantidade' })
  quantity: number;

  @ApiProperty({ description: 'Preço unitário em pontos' })
  unitPricePoints: number;

  @ApiProperty({ description: 'Preço unitário em reais' })
  unitPriceMoney: number;

  @ApiProperty({ description: 'Total em pontos' })
  totalPoints: number;

  @ApiProperty({ description: 'Total em reais' })
  totalMoney: number;
}
