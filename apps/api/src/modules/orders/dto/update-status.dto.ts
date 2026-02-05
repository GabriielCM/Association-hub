import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({ description: 'Novo status do pedido', enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({ description: 'Observações sobre a mudança de status', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string;
}

export class BatchUpdateStatusDto {
  @ApiProperty({ description: 'IDs dos pedidos para atualizar', type: [String] })
  @IsString({ each: true })
  orderIds: string[];

  @ApiProperty({ description: 'Novo status dos pedidos', enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({ description: 'Observações sobre a mudança', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string;
}
