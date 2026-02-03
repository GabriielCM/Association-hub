import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMaxSize, ArrayMinSize } from 'class-validator';

export class UpdateBadgesDisplayDto {
  @ApiProperty({
    description: 'IDs dos badges a serem exibidos no perfil (máx 3)',
    type: [String],
    example: ['badge-1', 'badge-2', 'badge-3'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  badgeIds: string[];
}
