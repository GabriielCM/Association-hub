import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { MessageContentType } from '@prisma/client';

export class SendMessageDto {
  @ApiProperty({
    description: 'Conteúdo da mensagem',
    maxLength: 4000,
    example: 'Olá, tudo bem?',
  })
  @IsString()
  @MaxLength(4000)
  content: string;

  @ApiPropertyOptional({
    description: 'Tipo do conteúdo',
    enum: MessageContentType,
    default: 'TEXT',
  })
  @IsOptional()
  @IsEnum(MessageContentType)
  contentType?: MessageContentType = MessageContentType.TEXT;

  @ApiPropertyOptional({
    description: 'URL da mídia (para imagem ou áudio)',
  })
  @IsOptional()
  @IsUrl()
  mediaUrl?: string;

  @ApiPropertyOptional({
    description: 'ID da mensagem sendo respondida',
  })
  @IsOptional()
  @IsString()
  replyToId?: string;
}
