import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UploadService } from '../../../common/services/upload.service';
import { StoriesService } from '../services/stories.service';
import { StoryType } from '@prisma/client';
import {
  CreateTextStoryDto,
  StoriesListResponseDto,
  UserStoriesResponseDto,
  StoryResponseDto,
  StoryViewsResponseDto,
} from '../dto/story.dto';

@ApiTags('Stories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stories')
export class StoriesController {
  constructor(
    private readonly storiesService: StoriesService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar stories disponíveis' })
  @ApiResponse({ status: 200, type: StoriesListResponseDto })
  async listStories(@Request() req: any): Promise<StoriesListResponseDto> {
    const stories = await this.storiesService.listStories(
      req.user.id,
      req.user.associationId,
    );
    return { stories };
  }

  @Post()
  @ApiOperation({ summary: 'Criar story de texto' })
  @ApiResponse({ status: 201, type: StoryResponseDto })
  async createTextStory(
    @Request() req: any,
    @Body() dto: CreateTextStoryDto,
  ): Promise<StoryResponseDto> {
    return this.storiesService.createStory(
      req.user.id,
      req.user.associationId,
      {
        type: StoryType.TEXT,
        text: dto.text,
        backgroundColor: dto.background_color,
      },
    );
  }

  @Post('media')
  @ApiOperation({ summary: 'Criar story com mídia (imagem/vídeo)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, type: StoryResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async createMediaStory(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<StoryResponseDto> {
    const uploaded = await this.uploadService.uploadStoryMedia(file);
    const mediaUrl = uploaded.url;
    const isVideo = file.mimetype.startsWith('video/');

    return this.storiesService.createStory(
      req.user.id,
      req.user.associationId,
      {
        type: isVideo ? StoryType.VIDEO : StoryType.IMAGE,
        mediaUrl,
      },
    );
  }

  @Get(':user_id')
  @ApiOperation({ summary: 'Obter stories de um usuário' })
  @ApiResponse({ status: 200, type: UserStoriesResponseDto })
  async getUserStories(
    @Request() req: any,
    @Param('user_id') targetUserId: string,
  ): Promise<UserStoriesResponseDto> {
    const stories = await this.storiesService.getUserStories(
      targetUserId,
      req.user.id,
    );
    return { stories };
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Registrar visualização de story' })
  @ApiResponse({ status: 200 })
  async recordView(
    @Request() req: any,
    @Param('id') storyId: string,
  ): Promise<{ success: boolean }> {
    await this.storiesService.recordView(storyId, req.user.id);
    return { success: true };
  }

  @Get(':id/views')
  @ApiOperation({ summary: 'Obter visualizações do story (apenas próprio)' })
  @ApiResponse({ status: 200, type: StoryViewsResponseDto })
  async getViews(
    @Request() req: any,
    @Param('id') storyId: string,
  ): Promise<StoryViewsResponseDto> {
    return this.storiesService.getViews(storyId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar story (apenas próprio)' })
  @ApiResponse({ status: 200 })
  async deleteStory(
    @Request() req: any,
    @Param('id') storyId: string,
  ): Promise<{ success: boolean }> {
    await this.storiesService.deleteStory(storyId, req.user.id);
    return { success: true };
  }
}
