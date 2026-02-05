import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AttachmentsService } from '../attachments.service';

interface AuthUser {
  id: string;
  associationId: string;
  role: string;
}

@ApiTags('support')
@Controller('support/attachments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get('config')
  @ApiOperation({ summary: 'Configuração de anexos permitidos' })
  @ApiResponse({ status: 200, description: 'Tipos de arquivo permitidos' })
  getConfig() {
    return this.attachmentsService.getAllowedMimeTypes();
  }

  @Post()
  @ApiOperation({ summary: 'Upload de anexo para ticket/chat' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Arquivo enviado com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo não fornecido ou tipo inválido' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadFile(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // In production, this would upload to S3 and return the URL
    // For now, we'll simulate with a placeholder URL
    const url = `https://cdn.ahub.com/support/uploads/${user.id}/${Date.now()}_${file.originalname}`;

    return this.attachmentsService.registerUpload({
      userId: user.id,
      associationId: user.associationId,
      filename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url,
    });
  }
}
