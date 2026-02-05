import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min, Max, IsString } from 'class-validator';
import { OrderPaymentMethod } from '@prisma/client';

export class ValidateCheckoutDto {
  @ApiPropertyOptional({ description: 'ID do plano de assinatura (para descontos)' })
  @IsString()
  @IsOptional()
  subscriptionPlanId?: string;
}

export class ProcessCheckoutDto {
  @ApiProperty({ description: 'Método de pagamento', enum: OrderPaymentMethod })
  @IsEnum(OrderPaymentMethod)
  paymentMethod: OrderPaymentMethod;

  @ApiPropertyOptional({ description: 'Pontos a usar (para pagamento misto)', minimum: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  pointsToUse?: number;
}

export class CheckoutValidationResponseDto {
  @ApiProperty({ description: 'Carrinho é válido' })
  isValid: boolean;

  @ApiPropertyOptional({ description: 'Erros de validação', type: [String] })
  errors?: string[];

  @ApiProperty({ description: 'Itens do carrinho' })
  items: any[];

  @ApiProperty({ description: 'Subtotal em pontos' })
  subtotalPoints: number;

  @ApiProperty({ description: 'Subtotal em reais' })
  subtotalMoney: number;

  @ApiPropertyOptional({ description: 'Desconto de assinatura (%)' })
  subscriptionDiscount?: number;

  @ApiPropertyOptional({ description: 'Valor do desconto em pontos' })
  discountPoints?: number;

  @ApiPropertyOptional({ description: 'Valor do desconto em reais' })
  discountMoney?: number;

  @ApiProperty({ description: 'Total final em pontos' })
  totalPoints: number;

  @ApiProperty({ description: 'Total final em reais' })
  totalMoney: number;

  @ApiProperty({ description: 'Opções de pagamento disponíveis', type: [String] })
  availablePaymentMethods: string[];

  @ApiProperty({ description: 'Saldo do usuário em pontos' })
  userBalance: number;

  @ApiProperty({ description: 'Pode pagar apenas com pontos' })
  canPayWithPoints: boolean;
}

export class CreateStripeIntentDto {
  @ApiProperty({ description: 'Valor em reais a pagar com dinheiro' })
  @IsInt()
  @Min(100) // Mínimo R$ 1,00
  amountMoney: number;

  @ApiPropertyOptional({ description: 'Pontos a usar junto com o pagamento' })
  @IsInt()
  @Min(0)
  @IsOptional()
  pointsToUse?: number;
}

export class StripeIntentResponseDto {
  @ApiProperty({ description: 'ID do PaymentIntent' })
  paymentIntentId: string;

  @ApiProperty({ description: 'Client secret para Stripe Elements' })
  clientSecret: string;

  @ApiProperty({ description: 'Valor em centavos' })
  amount: number;
}
