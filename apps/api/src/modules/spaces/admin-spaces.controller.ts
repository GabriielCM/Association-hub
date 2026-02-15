import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import type { JwtPayload } from '../../common/types';
import { SpacesService } from './spaces.service';
import {
  CreateSpaceDto,
  UpdateSpaceDto,
  UpdateSpaceStatusDto,
  CreateSpaceBlockDto,
  CreateSpaceBlockBulkDto,
  SpaceQueryDto,
  SpaceResponseDto,
} from './dto';

@ApiTags('admin/spaces')
@ApiBearerAuth()
@Controller('espacos')
@UseGuards(JwtAuthGuard)
export class AdminSpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar espaço (ADM)' })
  @ApiResponse({ status: 201, description: 'Espaço criado com sucesso', type: SpaceResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createSpace(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateSpaceDto,
  ) {
    // TODO: Add role guard for ADMIN
    return this.spacesService.createSpace(user.associationId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar espaço (ADM)' })
  @ApiParam({ name: 'id', description: 'ID do espaço' })
  @ApiResponse({ status: 200, description: 'Espaço atualizado com sucesso', type: SpaceResponseDto })
  @ApiResponse({ status: 404, description: 'Espaço não encontrado' })
  async updateSpace(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateSpaceDto,
  ) {
    // TODO: Add role guard for ADMIN
    return this.spacesService.updateSpace(id, user.associationId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar espaço (ADM)' })
  @ApiParam({ name: 'id', description: 'ID do espaço' })
  @ApiResponse({ status: 200, description: 'Espaço deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Espaço não encontrado' })
  async deleteSpace(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    // TODO: Add role guard for ADMIN
    return this.spacesService.deleteSpace(id, user.associationId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar status do espaço (Gerente/ADM)' })
  @ApiParam({ name: 'id', description: 'ID do espaço' })
  @ApiResponse({ status: 200, description: 'Status alterado com sucesso', type: SpaceResponseDto })
  @ApiResponse({ status: 404, description: 'Espaço não encontrado' })
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateSpaceStatusDto,
  ) {
    // TODO: Add role guard for ADMIN/MANAGER
    return this.spacesService.updateStatus(id, user.associationId, dto);
  }

  // ===========================================
  // IMAGE MANAGEMENT
  // ===========================================

  @Post(':id/images')
  @ApiOperation({ summary: 'Upload de imagem do espaço (ADM)' })
  @ApiParam({ name: 'id', description: 'ID do espaço' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Imagem adicionada com sucesso' })
  @ApiResponse({ status: 404, description: 'Espaço não encontrado' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const uploadsDir = join(process.cwd(), 'uploads', 'spaces', id);
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = file.originalname.split('.').pop();
    const fileName = `img-${Date.now()}.${ext}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, file.buffer);

    const imageUrl = `/uploads/spaces/${id}/${fileName}`;

    const result = await this.spacesService.addImage(id, user.associationId, imageUrl);
    return { success: true, data: result };
  }

  @Delete(':id/images')
  @ApiOperation({ summary: 'Remover imagem do espaço (ADM)' })
  @ApiParam({ name: 'id', description: 'ID do espaço' })
  @ApiResponse({ status: 200, description: 'Imagem removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Espaço não encontrado' })
  async removeImage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { imageUrl: string },
  ) {
    const result = await this.spacesService.removeImage(id, user.associationId, body.imageUrl);
    return { success: true, data: result };
  }

  // ===========================================
  // BLOCK MANAGEMENT
  // ===========================================

  @Get(':id/bloqueios')
  @ApiOperation({ summary: 'Listar bloqueios do espaço' })
  @ApiParam({ name: 'id', description: 'ID do espaço' })
  @ApiResponse({ status: 200, description: 'Bloqueios retornados com sucesso' })
  async listBlocks(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.spacesService.listBlocks(id, user.associationId);
  }

  @Post(':id/bloqueios')
  @ApiOperation({ summary: 'Bloquear data do espaço (Gerente/ADM)' })
  @ApiParam({ name: 'id', description: 'ID do espaço' })
  @ApiResponse({ status: 201, description: 'Data bloqueada com sucesso' })
  @ApiResponse({ status: 400, description: 'Data inválida' })
  @ApiResponse({ status: 409, description: 'Data já bloqueada' })
  async createBlock(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateSpaceBlockDto,
  ) {
    // TODO: Add role guard for ADMIN/MANAGER
    return this.spacesService.createBlock(id, user.associationId, user.sub, dto);
  }

  @Post(':id/bloqueios/bulk')
  @ApiOperation({ summary: 'Bloquear múltiplas datas (Gerente/ADM)' })
  @ApiParam({ name: 'id', description: 'ID do espaço' })
  @ApiResponse({ status: 201, description: 'Datas bloqueadas com sucesso' })
  @ApiResponse({ status: 400, description: 'Datas inválidas' })
  async createBlockBulk(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateSpaceBlockBulkDto,
  ) {
    // TODO: Add role guard for ADMIN/MANAGER
    return this.spacesService.createBlockBulk(id, user.associationId, user.sub, dto);
  }

  @Delete(':id/bloqueios/:bloqueioId')
  @ApiOperation({ summary: 'Remover bloqueio de data (Gerente/ADM)' })
  @ApiParam({ name: 'id', description: 'ID do espaço' })
  @ApiParam({ name: 'bloqueioId', description: 'ID do bloqueio' })
  @ApiResponse({ status: 200, description: 'Bloqueio removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Bloqueio não encontrado' })
  async removeBlock(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('bloqueioId') bloqueioId: string,
  ) {
    // TODO: Add role guard for ADMIN/MANAGER
    return this.spacesService.removeBlock(id, bloqueioId, user.associationId);
  }
}
