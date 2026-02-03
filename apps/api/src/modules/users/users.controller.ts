import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
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

  @Put('profile')
  @ApiOperation({ summary: 'Atualizar perfil do usuário' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() data: { name?: string; phone?: string; avatarUrl?: string },
  ) {
    const profile = await this.usersService.updateProfile(user.sub, data);
    return {
      success: true,
      data: profile,
    };
  }
}
