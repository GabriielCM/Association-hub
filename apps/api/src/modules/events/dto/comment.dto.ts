import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Texto do comentário',
    minLength: 1,
    maxLength: 1000,
    example: 'Evento incrível! Mal posso esperar.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text: string;
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
