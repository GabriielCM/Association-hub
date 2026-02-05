import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddFavoriteDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsString()
  @IsNotEmpty()
  productId: string;
}

export class FavoriteResponseDto {
  @ApiProperty({ description: 'ID do favorito' })
  id: string;

  @ApiProperty({ description: 'Produto' })
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    pricePoints?: number;
    priceMoney?: number;
    imageUrl?: string;
    type: string;
    isAvailable: boolean;
  };

  @ApiProperty({ description: 'Data de adição' })
  createdAt: Date;
}
