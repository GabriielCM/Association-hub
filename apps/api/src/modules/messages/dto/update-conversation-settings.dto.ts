import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateConversationSettingsDto {
  @ApiPropertyOptional({
    description: 'Silenciar notificações da conversa',
  })
  @IsOptional()
  @IsBoolean()
  isMuted?: boolean;

  @ApiPropertyOptional({
    description: 'Arquivar conversa',
  })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
