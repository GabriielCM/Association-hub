import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PdvPaymentMethod } from '@prisma/client';

export class PayCheckoutDto {
  @ApiProperty({ description: 'Método de pagamento', enum: PdvPaymentMethod })
  @IsEnum(PdvPaymentMethod)
  paymentMethod: PdvPaymentMethod;
}

export class PayWithPixResponseDto {
  @ApiProperty({ description: 'ID do PaymentIntent do Stripe' })
  paymentIntentId: string;

  @ApiProperty({ description: 'QR Code PIX em base64/URL' })
  pixQrCode: string;

  @ApiProperty({ description: 'Código PIX copia e cola' })
  pixCopyPaste: string;

  @ApiProperty({ description: 'Data de expiração do PIX' })
  expiresAt: Date;
}

export class PayWithPointsResponseDto {
  @ApiProperty({ description: 'Sucesso do pagamento' })
  success: boolean;

  @ApiProperty({ description: 'ID da transação de pontos' })
  transactionId: string;

  @ApiProperty({ description: 'Novo saldo de pontos' })
  newBalance: number;

  @ApiPropertyOptional({ description: 'ID do pedido criado' })
  orderId?: string;

  @ApiPropertyOptional({ description: 'Código do pedido' })
  orderCode?: string;
}
