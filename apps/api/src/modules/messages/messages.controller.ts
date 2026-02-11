import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/types';
import { MessagesService } from './messages.service';
import { AddReactionDto } from './dto/add-reaction.dto';

@ApiTags('Mensagens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('media/upload')
  @ApiOperation({ summary: 'Upload de mídia para mensagem' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de mídia (max 10MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Mídia enviada com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp|mp3|m4a|mp4|mpeg|ogg)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const uploadsDir = join(process.cwd(), 'uploads', 'messages', user.sub);
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, file.buffer);

    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/uploads/messages/${user.sub}/${fileName}`;

    return { success: true, data: { url } };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiResponse({ status: 204, description: 'Mensagem excluída' })
  @ApiResponse({ status: 404, description: 'Mensagem não encontrada' })
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.messagesService.deleteMessage(user.sub, id);
  }

  @Post(':id/reactions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adicionar reação à mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiResponse({ status: 201, description: 'Reação adicionada' })
  async addReaction(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AddReactionDto
  ) {
    await this.messagesService.addReaction(user.sub, id, dto.emoji);
    return { success: true };
  }

  @Delete(':id/reactions/:emoji')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover reação da mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiParam({ name: 'emoji', description: 'Emoji da reação' })
  @ApiResponse({ status: 204, description: 'Reação removida' })
  async removeReaction(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('emoji') emoji: string
  ) {
    await this.messagesService.removeReaction(user.sub, id, emoji);
  }
}
