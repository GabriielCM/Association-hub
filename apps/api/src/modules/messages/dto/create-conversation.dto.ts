import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsArray,
  IsString,
  IsOptional,
  ArrayMinSize,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ConversationType } from '@prisma/client';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Tipo da conversa',
    enum: ConversationType,
    example: 'DIRECT',
  })
  @IsEnum(ConversationType)
  type: ConversationType;

  @ApiProperty({
    description: 'IDs dos participantes',
    example: ['user-123', 'user-456'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  participantIds: string[];

  @ApiPropertyOptional({
    description: 'Nome do grupo (obrigatório para grupos)',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  groupName?: string;

  @ApiPropertyOptional({
    description: 'Descrição do grupo',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  groupDescription?: string;

  @ApiPropertyOptional({
    description: 'URL da imagem do grupo',
  })
  @IsOptional()
  @IsUrl()
  groupImageUrl?: string;
}
