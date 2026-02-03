import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Nome do usuário', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Username único (@username)',
    maxLength: 30,
    example: 'joaosilva',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'Username deve conter apenas letras minúsculas, números e underscore',
  })
  username?: string;

  @ApiPropertyOptional({ description: 'Bio do perfil', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  bio?: string;

  @ApiPropertyOptional({ description: 'Telefone de contato' })
  @IsOptional()
  @IsString()
  phone?: string;
}
