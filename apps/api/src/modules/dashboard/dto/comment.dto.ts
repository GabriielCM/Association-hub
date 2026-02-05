import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeedReactionType } from '@prisma/client';

export class CreateCommentDto {
  @ApiProperty({ description: 'Texto do comentário', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;

  @ApiPropertyOptional({ description: 'ID do comentário pai (para respostas)' })
  @IsOptional()
  @IsString()
  parent_id?: string;
}

export class CommentAuthorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  avatar_url?: string;
}

export class CommentReactionsDto {
  @ApiProperty({ default: 0 })
  heart: number;

  @ApiProperty({ default: 0 })
  thumbs_up: number;

  @ApiProperty({ default: 0 })
  laugh: number;

  @ApiProperty({ default: 0 })
  wow: number;
}

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: CommentAuthorDto })
  author: CommentAuthorDto;

  @ApiProperty()
  text: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({ type: CommentReactionsDto })
  reactions: CommentReactionsDto;

  @ApiPropertyOptional({ enum: FeedReactionType })
  my_reaction?: FeedReactionType | null;

  @ApiPropertyOptional({ type: [CommentResponseDto] })
  replies?: CommentResponseDto[];
}

export class CommentsQueryDto {
  @ApiPropertyOptional({ description: 'Offset para paginação', default: 0 })
  @IsOptional()
  @Type(() => Number)
  offset?: number = 0;

  @ApiPropertyOptional({ description: 'Limite de comentários', default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export class CommentsListResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  comments: CommentResponseDto[];

  @ApiProperty()
  total: number;
}

export class AddReactionDto {
  @ApiProperty({ enum: ['heart', 'thumbs_up', 'laugh', 'wow'] })
  @IsEnum(['heart', 'thumbs_up', 'laugh', 'wow'])
  reaction: 'heart' | 'thumbs_up' | 'laugh' | 'wow';
}
