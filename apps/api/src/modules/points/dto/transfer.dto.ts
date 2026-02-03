import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class TransferDto {
  @ApiProperty({ description: 'ID do destinatário' })
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @ApiProperty({ description: 'Quantidade de pontos a transferir', minimum: 1 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    description: 'Mensagem opcional',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  message?: string;
}

export class TransferResponseDto {
  @ApiProperty()
  transactionId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  recipient: {
    id: string;
    name: string;
    avatar?: string;
  };

  @ApiProperty()
  senderBalanceAfter: number;

  @ApiProperty()
  createdAt: Date;
}
