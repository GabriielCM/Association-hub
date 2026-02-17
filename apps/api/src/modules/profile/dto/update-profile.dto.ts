import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  ValidateNested,
} from 'class-validator';

export class SocialLinksDto {
  @ApiPropertyOptional({ description: 'Instagram username', maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9._]*$/, { message: 'Username Instagram inválido' })
  instagram?: string;

  @ApiPropertyOptional({ description: 'Facebook username', maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  facebook?: string;

  @ApiPropertyOptional({ description: 'X (Twitter) username', maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]*$/, { message: 'Username X inválido' })
  x?: string;
}

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

  @ApiPropertyOptional({ description: 'Links de redes sociais', type: SocialLinksDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;
}
