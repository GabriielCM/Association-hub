import {
  Controller,
  Get,
  Post,
  Put,
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
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PostsService } from '../services/posts.service';
import { ModerationService } from '../services/moderation.service';
import { UserRole, ReportTargetType } from '@prisma/client';
import {
  CreatePostDto,
  UpdatePostDto,
  PostResponseDto,
  CreatePostResponseDto,
  LikeResponseDto,
} from '../dto/post.dto';
import { CreateReportDto, ReportResponseDto } from '../dto/moderation.dto';

@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly moderationService: ModerationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo post' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        description: { type: 'string', maxLength: 500 },
      },
      required: ['image', 'description'],
    },
  })
  @ApiResponse({ status: 201, type: CreatePostResponseDto })
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePostDto,
  ): Promise<CreatePostResponseDto> {
    // TODO: Upload file to S3 and get URL
    const imageUrl = `/uploads/posts/${file?.filename || 'temp'}`;

    return this.postsService.createPost(
      req.user.id,
      req.user.associationId,
      imageUrl,
      dto.description,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter post específico' })
  @ApiResponse({ status: 200, type: PostResponseDto })
  async getPost(
    @Request() req: any,
    @Param('id') postId: string,
  ): Promise<{ post: PostResponseDto }> {
    const post = await this.postsService.getPost(postId, req.user.id);
    return { post };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar descrição do post (apenas próprio)' })
  @ApiResponse({ status: 200, type: PostResponseDto })
  async updatePost(
    @Request() req: any,
    @Param('id') postId: string,
    @Body() dto: UpdatePostDto,
  ): Promise<{ post: PostResponseDto }> {
    const post = await this.postsService.updatePost(
      postId,
      req.user.id,
      dto.description,
    );
    return { post };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar post (próprio ou ADM)' })
  @ApiResponse({ status: 200 })
  @UseGuards(RolesGuard)
  async deletePost(
    @Request() req: any,
    @Param('id') postId: string,
  ): Promise<{ success: boolean }> {
    const isAdmin = req.user.role === UserRole.ADMIN;
    await this.postsService.deletePost(postId, req.user.id, isAdmin);
    return { success: true };
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Curtir post' })
  @ApiResponse({ status: 200, type: LikeResponseDto })
  async likePost(
    @Request() req: any,
    @Param('id') postId: string,
  ): Promise<LikeResponseDto> {
    const likesCount = await this.postsService.likePost(
      postId,
      req.user.id,
      req.user.associationId,
    );
    return { success: true, likes_count: likesCount };
  }

  @Delete(':id/like')
  @ApiOperation({ summary: 'Remover curtida do post' })
  @ApiResponse({ status: 200, type: LikeResponseDto })
  async unlikePost(
    @Request() req: any,
    @Param('id') postId: string,
  ): Promise<LikeResponseDto> {
    const likesCount = await this.postsService.unlikePost(postId, req.user.id);
    return { success: true, likes_count: likesCount };
  }

  @Post(':id/report')
  @ApiOperation({ summary: 'Denunciar post' })
  @ApiResponse({ status: 201, type: ReportResponseDto })
  async reportPost(
    @Request() req: any,
    @Param('id') postId: string,
    @Body() dto: CreateReportDto,
  ): Promise<ReportResponseDto> {
    const reportId = await this.moderationService.createReport(
      req.user.id,
      req.user.associationId,
      ReportTargetType.POST,
      postId,
      dto.reason,
      dto.description,
    );
    return { success: true, report_id: reportId };
  }
}
