import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePdvCategoryDto {
  @ApiProperty({ description: 'Nome da categoria', example: 'Bebidas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

export class UpdatePdvCategoryDto {
  @ApiProperty({ description: 'Novo nome da categoria', example: 'Lanches' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
