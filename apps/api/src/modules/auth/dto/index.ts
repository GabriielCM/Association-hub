import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'Senha123' })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'Senha123!' })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'Senha deve conter pelo menos uma letra maiúscula' })
  @Matches(/[a-z]/, { message: 'Senha deve conter pelo menos uma letra minúscula' })
  @Matches(/[0-9]/, { message: 'Senha deve conter pelo menos um número' })
  password: string;

  @ApiProperty({ example: '11999999999', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class AuthTokensDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ example: 900 })
  expiresIn: number;
}

export class AuthResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: AuthTokensDto })
  data: AuthTokensDto;
}
