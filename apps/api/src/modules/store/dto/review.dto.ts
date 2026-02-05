import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { ReviewStatus } from '@prisma/client';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID do pedido (para validar que comprou)' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'Nota de 1 a 5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Comentário' })
  @IsString()
  @IsOptional()
  comment?: string;
}

export class ModerateReviewDto {
  @ApiProperty({ description: 'Status da moderação', enum: ReviewStatus })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @ApiPropertyOptional({ description: 'Motivo (se rejeitado)' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ReviewResponseDto {
  @ApiProperty({ description: 'ID da avaliação' })
  id: string;

  @ApiProperty({ description: 'Nota' })
  rating: number;

  @ApiPropertyOptional({ description: 'Comentário' })
  comment?: string;

  @ApiProperty({ description: 'Status' })
  status: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Autor' })
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}
