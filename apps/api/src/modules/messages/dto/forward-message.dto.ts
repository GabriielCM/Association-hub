import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class ForwardMessageDto {
  @ApiProperty({
    description: 'IDs das conversas destino',
    example: ['conv_123', 'conv_456'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  conversation_ids: string[];
}
