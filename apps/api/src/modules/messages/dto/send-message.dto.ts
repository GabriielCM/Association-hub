import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { MessageContentType } from '@prisma/client';

export class SendMessageDto {
  @ApiPropertyOptional({
    description: 'Conteúdo da mensagem',
    maxLength: 4000,
    example: 'Olá, tudo bem?',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  content?: string;

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
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({
    description: 'Duração do áudio em segundos',
  })
  @IsOptional()
  @IsNumber()
  mediaDuration?: number;

  @ApiPropertyOptional({
    description: 'ID da mensagem sendo respondida',
  })
  @IsOptional()
  @IsString()
  replyToId?: string;
}
