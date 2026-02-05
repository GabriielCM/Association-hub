import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CommentsService } from '../services/comments.service';
import { UserRole } from '@prisma/client';
import {
  CreateCommentDto,
  CommentsQueryDto,
  CommentsListResponseDto,
  CommentResponseDto,
  AddReactionDto,
} from '../dto/comment.dto';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'Listar comentários de um post' })
  @ApiResponse({ status: 200, type: CommentsListResponseDto })
  async getComments(
    @Request() req: any,
    @Param('postId') postId: string,
    @Query() query: CommentsQueryDto,
  ): Promise<CommentsListResponseDto> {
    return this.commentsService.getComments(
      postId,
      req.user.id,
      query.offset || 0,
      query.limit || 20,
    );
  }

  @Post('posts/:postId/comments')
  @ApiOperation({ summary: 'Criar comentário' })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  async createComment(
    @Request() req: any,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<{ comment: CommentResponseDto }> {
    const comment = await this.commentsService.createComment(
      postId,
      req.user.id,
      req.user.associationId,
      dto.text,
      dto.parent_id,
    );
    return { comment };
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Deletar comentário (próprio ou ADM)' })
  @ApiResponse({ status: 200 })
  @UseGuards(RolesGuard)
  async deleteComment(
    @Request() req: any,
    @Param('id') commentId: string,
  ): Promise<{ success: boolean }> {
    const isAdmin = req.user.role === UserRole.ADMIN;
    await this.commentsService.deleteComment(commentId, req.user.id, isAdmin);
    return { success: true };
  }

  @Post('comments/:id/react')
  @ApiOperation({ summary: 'Adicionar reação ao comentário' })
  @ApiResponse({ status: 200 })
  async addReaction(
    @Request() req: any,
    @Param('id') commentId: string,
    @Body() dto: AddReactionDto,
  ): Promise<{ success: boolean }> {
    await this.commentsService.addReaction(
      commentId,
      req.user.id,
      req.user.associationId,
      dto.reaction,
    );
    return { success: true };
  }

  @Delete('comments/:id/react')
  @ApiOperation({ summary: 'Remover reação do comentário' })
  @ApiResponse({ status: 200 })
  async removeReaction(
    @Request() req: any,
    @Param('id') commentId: string,
  ): Promise<{ success: boolean }> {
    await this.commentsService.removeReaction(commentId, req.user.id);
    return { success: true };
  }
}
