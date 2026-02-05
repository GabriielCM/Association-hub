import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidatePickupDto {
  @ApiProperty({ description: 'Código do QR ou código do pedido', example: 'ABC123' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class MarkVoucherUsedDto {
  @ApiProperty({ description: 'Código do voucher' })
  @IsString()
  @IsNotEmpty()
  voucherCode: string;
}
