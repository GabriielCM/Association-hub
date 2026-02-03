import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class PdvPaymentDto {
  @ApiProperty({ description: 'Código do checkout' })
  @IsString()
  @IsNotEmpty()
  checkoutCode: string;

  @ApiPropertyOptional({ description: 'Confirmação de biometria no frontend' })
  @IsOptional()
  biometricConfirmed?: boolean;
}

export class CheckoutDetailsResponse {
  checkoutCode: string;
  pdvName: string;
  items: {
    name: string;
    quantity: number;
    pricePoints: number;
  }[];
  totalPoints: number;
  createdAt: Date;
  expiresAt: Date;
  isExpired: boolean;
}
