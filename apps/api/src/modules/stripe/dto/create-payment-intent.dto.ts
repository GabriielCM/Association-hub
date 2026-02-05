import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsObject, IsOptional, IsPositive, IsString } from 'class-validator';

export enum PaymentSource {
  PDV = 'pdv',
  STORE = 'store',
}

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Valor em centavos (ex: R$ 10,00 = 1000)', minimum: 100 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Moeda (padrão: BRL)', default: 'brl' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Origem do pagamento', enum: PaymentSource })
  @IsEnum(PaymentSource)
  source: PaymentSource;

  @ApiPropertyOptional({ description: 'ID do checkout (PDV) ou carrinho (Store)' })
  @IsString()
  @IsOptional()
  sourceId?: string;

  @ApiPropertyOptional({ description: 'Metadados adicionais' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, string>;
}

export class PixPaymentResponseDto {
  @ApiProperty({ description: 'ID do PaymentIntent' })
  paymentIntentId: string;

  @ApiProperty({ description: 'Client secret para confirmação' })
  clientSecret: string;

  @ApiProperty({ description: 'QR Code PIX em base64' })
  pixQrCode: string;

  @ApiProperty({ description: 'Código PIX copia e cola' })
  pixCopyPaste: string;

  @ApiProperty({ description: 'Data de expiração do PIX' })
  expiresAt: Date;
}

export class CardPaymentResponseDto {
  @ApiProperty({ description: 'ID do PaymentIntent' })
  paymentIntentId: string;

  @ApiProperty({ description: 'Client secret para confirmação no frontend' })
  clientSecret: string;
}
