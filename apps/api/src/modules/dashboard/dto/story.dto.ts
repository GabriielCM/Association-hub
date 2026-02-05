import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { StoryType } from '@prisma/client';

export class CreateTextStoryDto {
  @ApiProperty({ enum: ['TEXT'], description: 'Tipo do story' })
  @IsEnum(['TEXT'])
  type: 'TEXT';

  @ApiProperty({ description: 'Texto do story', maxLength: 280 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
  text: string;

  @ApiPropertyOptional({ description: 'Cor de fundo (hex)', example: '#FF5733' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor deve ser um hex válido (#RRGGBB)' })
  background_color?: string;
}

export class StoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: StoryType })
  type: StoryType;

  @ApiPropertyOptional()
  url?: string;

  @ApiPropertyOptional()
  text?: string;

  @ApiPropertyOptional()
  background_color?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  expires_at: Date;
}

export class StoryUserListItemDto {
  @ApiProperty()
  user_id: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  avatar_url?: string;

  @ApiProperty()
  has_unseen: boolean;

  @ApiProperty()
  stories_count: number;
}

export class StoriesListResponseDto {
  @ApiProperty({ type: [StoryUserListItemDto] })
  stories: StoryUserListItemDto[];
}

export class UserStoriesResponseDto {
  @ApiProperty({ type: [StoryResponseDto] })
  stories: StoryResponseDto[];
}

export class StoryViewDto {
  @ApiProperty()
  user_id: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  avatar_url?: string;

  @ApiProperty()
  viewed_at: Date;
}

export class StoryViewsResponseDto {
  @ApiProperty({ type: [StoryViewDto] })
  views: StoryViewDto[];

  @ApiProperty()
  total_views: number;
}
