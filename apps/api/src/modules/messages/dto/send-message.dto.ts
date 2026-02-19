import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { MessageContentType } from '@prisma/client';

export class SendMessageDto {
  @ApiPropertyOptional({
    description: 'Conteúdo da mensagem (plaintext ou placeholder para mensagens encriptadas)',
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

  // E2E Encryption fields

  @ApiPropertyOptional({
    description: 'Conteúdo encriptado (base64 ciphertext)',
  })
  @IsOptional()
  @IsString()
  encryptedContent?: string;

  @ApiPropertyOptional({
    description: 'Nonce usado na encriptação (base64)',
  })
  @IsOptional()
  @IsString()
  nonce?: string;

  @ApiPropertyOptional({
    description: 'Se a mensagem é encriptada E2E',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isEncrypted?: boolean;
}
