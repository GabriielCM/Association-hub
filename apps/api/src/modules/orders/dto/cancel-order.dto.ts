import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsBoolean, IsOptional } from 'class-validator';

export class CancelOrderDto {
  @ApiProperty({ description: 'Motivo do cancelamento', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({ description: 'Estornar pontos automaticamente', default: true })
  @IsBoolean()
  @IsOptional()
  refundPoints?: boolean = true;

  @ApiPropertyOptional({ description: 'Processar reembolso Stripe (se pagou com PIX/cartão)', default: true })
  @IsBoolean()
  @IsOptional()
  refundMoney?: boolean = true;
}
