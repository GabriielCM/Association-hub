import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString, IsNumber, Min, ArrayMinSize, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantidade', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateCheckoutDto {
  @ApiProperty({ description: 'Itens do checkout', type: [CheckoutItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiPropertyOptional({ description: 'Método de pagamento pré-selecionado', enum: ['POINTS', 'PIX'] })
  @IsOptional()
  @IsIn(['POINTS', 'PIX'])
  paymentMethod?: 'POINTS' | 'PIX';
}

export class CheckoutStatusResponseDto {
  @ApiProperty({ description: 'Código do checkout' })
  code: string;

  @ApiProperty({ description: 'Status do checkout' })
  status: string;

  @ApiProperty({ description: 'Itens do checkout' })
  items: any[];

  @ApiProperty({ description: 'Total em pontos' })
  totalPoints: number;

  @ApiProperty({ description: 'Total em dinheiro (reais)' })
  totalMoney: number;

  @ApiProperty({ description: 'Data de expiração' })
  expiresAt: Date;

  @ApiProperty({ description: 'Método de pagamento escolhido (se houver)' })
  paymentMethod: string | null;
}
