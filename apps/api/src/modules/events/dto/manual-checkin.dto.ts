import { IsString, IsInt, Min, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManualCheckinDto {
  @ApiProperty({
    description: 'ID do usuário para fazer check-in manual',
    example: 'usr_abc123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Número do check-in (1 a N)',
    minimum: 1,
    example: 1,
  })
  @IsInt()
  @Min(1)
  checkinNumber: number;

  @ApiProperty({
    description: 'Motivo do check-in manual',
    minLength: 5,
    maxLength: 500,
    example: 'Usuário teve problemas técnicos com o QR Code',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason: string;
}
