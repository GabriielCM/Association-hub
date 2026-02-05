import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class AddReactionDto {
  @ApiProperty({
    description: 'Emoji da reação',
    example: '👍',
    maxLength: 10,
  })
  @IsString()
  @MaxLength(10)
  emoji: string;
}
