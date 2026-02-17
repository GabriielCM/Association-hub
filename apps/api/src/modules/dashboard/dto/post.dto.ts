import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @ApiProperty({ description: 'Descrição do post', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;
}

export class UpdatePostDto {
  @ApiProperty({ description: 'Nova descrição do post', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;
}

export class PostAuthorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  avatar_url?: string;

  @ApiPropertyOptional({ description: 'Se o autor tem assinatura ativa (badge verificado)' })
  is_verified?: boolean;
}

export class PostContentDto {
  @ApiPropertyOptional()
  image_url?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  likes_count: number;

  @ApiProperty()
  comments_count: number;

  @ApiProperty()
  liked_by_me: boolean;
}

export class PostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['photo', 'poll', 'event'] })
  type: string;

  @ApiProperty({ type: PostAuthorDto })
  author: PostAuthorDto;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({ type: PostContentDto })
  content: PostContentDto;

  @ApiProperty()
  pinned: boolean;
}

export class CreatePostResponseDto {
  @ApiProperty({ type: PostResponseDto })
  post: PostResponseDto;

  @ApiProperty({ description: 'Pontos ganhos (10 se primeiro post do dia, 0 caso contrário)' })
  points_earned: number;

  @ApiProperty({ description: 'Mensagem para o usuário' })
  message: string;
}

export class FeedQueryDto {
  @ApiPropertyOptional({ description: 'Offset para paginação', default: 0 })
  @IsOptional()
  @Type(() => Number)
  offset?: number = 0;

  @ApiPropertyOptional({ description: 'Limite de posts', default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}

export class FeedResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  posts: PostResponseDto[];

  @ApiProperty()
  has_more: boolean;
}

export class LikeResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  likes_count: number;
}
