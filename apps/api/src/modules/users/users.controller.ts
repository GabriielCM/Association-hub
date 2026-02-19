import { Controller, Get, Put, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateEncryptionKeysDto } from './dto/update-encryption-keys.dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import type { JwtPayload } from '../../common/types';

@ApiTags('users')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    const profile = await this.usersService.getProfile(user.sub);
    return {
      success: true,
      data: profile,
    };
  }

  // ─── E2E Encryption Endpoints ─────────────────────────────

  @Put('encryption-keys')
  @ApiOperation({ summary: 'Salvar/atualizar chaves de encriptação E2E' })
  @ApiResponse({ status: 200, description: 'Chaves salvas com sucesso' })
  async updateEncryptionKeys(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateEncryptionKeysDto
  ) {
    return this.usersService.updateEncryptionKeys(user.sub, dto);
  }

  @Get('encryption-keys/backup')
  @ApiOperation({ summary: 'Obter backup encriptado da chave privada' })
  @ApiResponse({ status: 200, description: 'Backup retornado' })
  async getEncryptionKeyBackup(@CurrentUser() user: JwtPayload) {
    const backup = await this.usersService.getEncryptedPrivateKeyBackup(user.sub);
    if (!backup) {
      throw new NotFoundException('Nenhum backup de chave encontrado');
    }
    return backup;
  }

  @Get(':userId/public-key')
  @ApiOperation({ summary: 'Obter chave pública de um usuário' })
  @ApiResponse({ status: 200, description: 'Chave pública retornada' })
  async getUserPublicKey(@Param('userId') userId: string) {
    const publicKey = await this.usersService.getPublicKey(userId);
    if (!publicKey) {
      throw new NotFoundException('Chave pública não encontrada para este usuário');
    }
    return { userId, publicKey };
  }
}
