import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({
    description: 'Habilitar notificações push para esta categoria',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Habilitar notificações in-app para esta categoria',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;
}

export class NotificationSettingsResponseDto {
  @ApiProperty({ description: 'ID do usuário' })
  userId: string;

  @ApiProperty({ description: 'Categoria da notificação' })
  category: string;

  @ApiProperty({ description: 'Push habilitado' })
  pushEnabled: boolean;

  @ApiProperty({ description: 'In-app habilitado' })
  inAppEnabled: boolean;
}
