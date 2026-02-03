import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchUserQueryDto {
  @ApiProperty({ description: 'Termo de busca (min 2 caracteres)', minLength: 2 })
  @IsString()
  @MinLength(2)
  q: string;

  @ApiPropertyOptional({ default: 10, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number = 10;
}

export class RecentRecipientsQueryDto {
  @ApiPropertyOptional({ default: 5, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  limit?: number = 5;
}

export class UserSearchResultDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiPropertyOptional()
  memberSince?: string;
}

export class RecentRecipientDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiProperty()
  lastTransferAt: Date;
}
