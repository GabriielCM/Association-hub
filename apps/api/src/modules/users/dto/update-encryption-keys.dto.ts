import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateEncryptionKeysDto {
  @ApiProperty({ description: 'Chave pública X25519 (base64)' })
  @IsString()
  publicKey: string;

  @ApiPropertyOptional({ description: 'Chave privada encriptada para backup (base64)' })
  @IsOptional()
  @IsString()
  encryptedPrivateKey?: string;

  @ApiPropertyOptional({ description: 'Nonce do backup da chave privada (base64)' })
  @IsOptional()
  @IsString()
  encryptedPrivateKeyNonce?: string;

  @ApiPropertyOptional({ description: 'Salt PBKDF2 para derivação da chave de backup (base64)' })
  @IsOptional()
  @IsString()
  encryptionKeySalt?: string;
}
