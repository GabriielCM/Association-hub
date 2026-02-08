import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ScanQrDto {
  @ApiProperty({ description: 'Dados do QR Code escaneado (JSON string)' })
  @IsString()
  @IsNotEmpty()
  qrCodeData: string;

  @ApiProperty({ description: 'Hash do QR Code para validação' })
  @IsString()
  @IsOptional()
  qrCodeHash?: string;
}

export enum QrCodeType {
  MEMBER_CARD = 'member_card',
  EVENT_CHECKIN = 'event_checkin',
  USER_TRANSFER = 'user_transfer',
  PDV_PAYMENT = 'pdv_payment',
}

export interface QrScanResult {
  type: QrCodeType;
  valid: boolean;
  error?: string;
  data?: any;
  action?: string;
}
