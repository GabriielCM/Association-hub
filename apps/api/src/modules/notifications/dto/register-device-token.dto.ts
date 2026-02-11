import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DevicePlatform } from '@prisma/client';

export class RegisterDeviceTokenDto {
  @ApiProperty({ description: 'Expo push token', example: 'ExponentPushToken[xxxxxx]' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Plataforma do dispositivo', enum: DevicePlatform })
  @IsEnum(DevicePlatform)
  platform: DevicePlatform;
}
