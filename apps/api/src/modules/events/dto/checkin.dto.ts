import { IsString, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckinDto {
  @ApiProperty({ description: 'ID do evento', example: 'evt_abc123' })
  @IsString()
  eventId: string;

  @ApiProperty({ description: 'Número do check-in (1 a N)', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  checkinNumber: number;

  @ApiProperty({ description: 'Token de segurança do QR Code' })
  @IsString()
  securityToken: string;

  @ApiProperty({ description: 'Timestamp do QR Code (em ms)', example: 1706745600000 })
  @IsNumber()
  timestamp: number;
}
