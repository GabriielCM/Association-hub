import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../../common/types';
import { sanitizeFilename } from '../../common/utils';
import { ProfileService } from './profile.service';
import { UpdateProfileDto, UpdateBadgesDisplayDto } from './dto';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly configService: ConfigService,
  ) {}

  // ===========================================
  // PUBLIC PROFILE ENDPOINTS
  // ===========================================

  @Get(':id/profile')
  @ApiOperation({ summary: 'Obter perfil de um usuário' })
  @ApiResponse({ status: 200, description: 'Perfil retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getProfile(@Param('id') userId: string, @CurrentUser() user: JwtPayload) {
    const data = await this.profileService.getProfile(userId, user.sub);
    return { success: true, data };
  }

  @Get(':id/badges')
  @ApiOperation({ summary: 'Obter badges de um usuário' })
  @ApiResponse({ status: 200, description: 'Badges retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserBadges(@Param('id') userId: string) {
    const data = await this.profileService.getUserBadges(userId);
    return { success: true, data };
  }

  @Get(':id/rankings')
  @ApiOperation({ summary: 'Obter posições em rankings de um usuário' })
  @ApiResponse({ status: 200, description: 'Rankings retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserRankings(@Param('id') userId: string, @CurrentUser() user: JwtPayload) {
    const data = await this.profileService.getUserRankings(userId, user.associationId);
    return { success: true, data };
  }

  // ===========================================
  // PROFILE MANAGEMENT (OWN)
  // ===========================================

  @Put('profile')
  @ApiOperation({ summary: 'Atualizar perfil próprio' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  @ApiResponse({ status: 409, description: 'Username já em uso' })
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    const data = await this.profileService.updateProfile(user.sub, dto);
    return { success: true, data, message: 'Perfil atualizado com sucesso' };
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload de foto de perfil' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagem do avatar (max 5MB, jpg/png)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Save file to local disk (TODO: migrate to S3 in production)
    const uploadsDir = join(process.cwd(), 'uploads', 'avatars', user.sub);
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${sanitizeFilename(file.originalname)}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, file.buffer);

    // Use request host so the URL is reachable from the client
    const protocol = req.protocol;
    const host = req.get('host');
    const avatarUrl = `${protocol}://${host}/uploads/avatars/${user.sub}/${fileName}`;

    const data = await this.profileService.updateAvatar(user.sub, avatarUrl);
    return { success: true, data, message: 'Avatar atualizado com sucesso' };
  }

  @Post('cover')
  @ApiOperation({ summary: 'Upload de imagem de capa do perfil' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagem de capa (max 5MB, jpg/png)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Capa atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const uploadsDir = join(process.cwd(), 'uploads', 'covers', user.sub);
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${sanitizeFilename(file.originalname)}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, file.buffer);

    const protocol = req.protocol;
    const host = req.get('host');
    const coverImageUrl = `${protocol}://${host}/uploads/covers/${user.sub}/${fileName}`;

    const data = await this.profileService.updateCover(user.sub, coverImageUrl);
    return { success: true, data, message: 'Capa atualizada com sucesso' };
  }

  @Put('badges/display')
  @ApiOperation({ summary: 'Selecionar badges para exibir no perfil (máx 3)' })
  @ApiResponse({ status: 200, description: 'Badges atualizados com sucesso' })
  @ApiResponse({ status: 400, description: 'Badges inválidos' })
  async updateBadgesDisplay(@CurrentUser() user: JwtPayload, @Body() dto: UpdateBadgesDisplayDto) {
    const data = await this.profileService.updateBadgesDisplay(user.sub, dto);
    return { success: true, data, message: 'Badges atualizados com sucesso' };
  }

  // ===========================================
  // UTILITIES
  // ===========================================

  @Get('username/check')
  @ApiOperation({ summary: 'Verificar disponibilidade de username' })
  @ApiResponse({ status: 200, description: 'Disponibilidade verificada' })
  async checkUsername(@Query('username') username: string, @CurrentUser() user: JwtPayload) {
    const data = await this.profileService.checkUsernameAvailability(username, user.sub);
    return { success: true, data };
  }
}
