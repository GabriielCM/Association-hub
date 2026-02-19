import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiPropertyOptional({
    description: 'Tipo de conteúdo do comentário',
    enum: ['TEXT', 'IMAGE'],
    default: 'TEXT',
  })
  @IsOptional()
  @IsEnum(['TEXT', 'IMAGE'])
  contentType?: 'TEXT' | 'IMAGE' = 'TEXT';

  @ApiPropertyOptional({
    description:
      'Texto do comentário (obrigatório para TEXT, opcional como legenda para IMAGE)',
    minLength: 1,
    maxLength: 1000,
    example: 'Evento incrível! Mal posso esperar.',
  })
  @ValidateIf((o) => o.contentType === 'TEXT' || !o.contentType)
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text?: string;

  @ApiPropertyOptional({
    description: 'URL da mídia (retornada pelo endpoint de upload)',
  })
  @ValidateIf((o) => o.contentType === 'IMAGE')
  @IsString()
  mediaUrl?: string;
}

export class CommentQueryDto {
  @ApiPropertyOptional({ description: 'Número da página', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  perPage?: number = 20;
}
