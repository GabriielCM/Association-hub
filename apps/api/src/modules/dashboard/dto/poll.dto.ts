import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ArrayMinSize,
  ArrayMaxSize,
  Max,
} from 'class-validator';

export class CreatePollDto {
  @ApiProperty({ description: 'Pergunta da enquete', minLength: 10, maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  question: string;

  @ApiProperty({ description: 'Opções da enquete (2-4)', type: [String] })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  options: string[];

  @ApiPropertyOptional({ description: 'Duração em dias (opcional)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  duration_days?: number;
}

export class VotePollDto {
  @ApiProperty({ description: 'Índice da opção escolhida (0-based)' })
  @IsInt()
  @Min(0)
  @Max(3)
  option_index: number;
}

export class PollOptionResultDto {
  @ApiProperty()
  text: string;

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  votes: number;
}

export class PollResultsDto {
  @ApiProperty({ type: [PollOptionResultDto] })
  options: PollOptionResultDto[];

  @ApiProperty()
  total_votes: number;
}

export class VotePollResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: PollResultsDto })
  results: PollResultsDto;
}

export class CreatePollResponseDto {
  @ApiProperty()
  poll: any; // Full poll object

  @ApiProperty({ description: 'Pontos ganhos (10 se primeiro post do dia)' })
  points_earned: number;
}

export class PollResultsResponseDto {
  @ApiProperty({ type: PollResultsDto })
  results: PollResultsDto;
}
