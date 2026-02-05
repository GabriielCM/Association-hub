import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { FeedReactionType } from '@prisma/client';
import { ModerationService } from './moderation.service';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  CommentResponseDto,
  CommentReactionsDto,
} from '../dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moderationService: ModerationService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getComments(
    postId: string,
    userId: string,
    offset = 0,
    limit = 20,
  ): Promise<{ comments: CommentResponseDto[]; total: number }> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, deletedAt: true },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post não encontrado');
    }

    const [comments, total] = await Promise.all([
      this.prisma.feedComment.findMany({
        where: {
          postId,
          parentId: null, // Only top-level comments
          deletedAt: null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          reactions: true,
          replies: {
            where: { deletedAt: null },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
              reactions: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.feedComment.count({
        where: { postId, parentId: null, deletedAt: null },
      }),
    ]);

    return {
      comments: comments.map((c) => this.formatComment(c, userId)),
      total,
    };
  }

  async createComment(
    postId: string,
    userId: string,
    associationId: string,
    text: string,
    parentId?: string,
  ): Promise<CommentResponseDto> {
    await this.moderationService.checkSuspension(userId, associationId);

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, deletedAt: true },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post não encontrado');
    }

    // Validate parent comment if provided
    let parentComment = null;
    if (parentId) {
      parentComment = await this.prisma.feedComment.findUnique({
        where: { id: parentId },
        select: { id: true, parentId: true, authorId: true },
      });

      if (!parentComment) {
        throw new NotFoundException('Comentário pai não encontrado');
      }

      // Only allow 1 level of nesting
      if (parentComment.parentId) {
        throw new BadRequestException(
          'Respostas não podem ter mais de 1 nível',
        );
      }
    }

    // Create comment
    const comment = await this.prisma.feedComment.create({
      data: {
        postId,
        authorId: userId,
        text,
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        reactions: true,
      },
    });

    // Increment post comment count
    await this.prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    // Send notifications
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    // Notify post author (if not self)
    if (post.authorId !== userId && !parentId) {
      await this.notificationsService.create({
        userId: post.authorId,
        type: 'NEW_COMMENT',
        category: 'SOCIAL',
        title: 'Novo comentário',
        body: `${user?.name || 'Alguém'} comentou no seu post`,
        data: { postId, commentId: comment.id },
        actionUrl: `/posts/${postId}`,
      });
    }

    // Notify parent comment author (if reply and not self)
    if (parentComment && parentComment.authorId !== userId) {
      await this.notificationsService.create({
        userId: parentComment.authorId,
        type: 'COMMENT_REPLY',
        category: 'SOCIAL',
        title: 'Nova resposta',
        body: `${user?.name || 'Alguém'} respondeu seu comentário`,
        data: { postId, commentId: comment.id, parentId },
        actionUrl: `/posts/${postId}`,
      });
    }

    return this.formatComment(comment, userId);
  }

  async deleteComment(
    commentId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<void> {
    const comment = await this.prisma.feedComment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true, deletedAt: true },
    });

    if (!comment || comment.deletedAt) {
      throw new NotFoundException('Comentário não encontrado');
    }

    if (!isAdmin && comment.authorId !== userId) {
      throw new ForbiddenException(
        'Você só pode deletar seus próprios comentários',
      );
    }

    // Soft delete
    await this.prisma.feedComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    // Decrement post comment count
    await this.prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
    });
  }

  async addReaction(
    commentId: string,
    userId: string,
    associationId: string,
    reactionType: 'heart' | 'thumbs_up' | 'laugh' | 'wow',
  ): Promise<void> {
    await this.moderationService.checkSuspension(userId, associationId);

    const comment = await this.prisma.feedComment.findUnique({
      where: { id: commentId },
      select: { id: true, deletedAt: true },
    });

    if (!comment || comment.deletedAt) {
      throw new NotFoundException('Comentário não encontrado');
    }

    const type = this.mapReactionType(reactionType);

    // Upsert reaction (replace if different type)
    await this.prisma.feedCommentReaction.upsert({
      where: {
        commentId_userId_type: { commentId, userId, type },
      },
      create: { commentId, userId, type },
      update: {},
    });
  }

  async removeReaction(commentId: string, userId: string): Promise<void> {
    const comment = await this.prisma.feedComment.findUnique({
      where: { id: commentId },
      select: { id: true },
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    // Delete all reactions from this user on this comment
    await this.prisma.feedCommentReaction.deleteMany({
      where: { commentId, userId },
    });
  }

  private formatComment(comment: any, currentUserId: string): CommentResponseDto {
    const reactions = this.countReactions(comment.reactions);
    const myReaction = this.findUserReaction(comment.reactions, currentUserId);

    return {
      id: comment.id,
      author: {
        id: comment.author.id,
        name: comment.author.name,
        avatar_url: comment.author.avatarUrl || undefined,
      },
      text: comment.text,
      created_at: comment.createdAt,
      reactions,
      my_reaction: myReaction,
      replies: comment.replies?.map((r: any) =>
        this.formatComment(r, currentUserId),
      ),
    };
  }

  private countReactions(reactions: any[]): CommentReactionsDto {
    const counts: CommentReactionsDto = {
      heart: 0,
      thumbs_up: 0,
      laugh: 0,
      wow: 0,
    };

    for (const r of reactions || []) {
      const key = r.type.toLowerCase() as keyof CommentReactionsDto;
      if (key in counts) {
        counts[key]++;
      }
    }

    return counts;
  }

  private findUserReaction(
    reactions: any[],
    userId: string,
  ): FeedReactionType | null {
    const userReaction = reactions?.find((r) => r.userId === userId);
    return userReaction?.type || null;
  }

  private mapReactionType(type: string): FeedReactionType {
    const map: Record<string, FeedReactionType> = {
      heart: FeedReactionType.HEART,
      thumbs_up: FeedReactionType.THUMBS_UP,
      laugh: FeedReactionType.LAUGH,
      wow: FeedReactionType.WOW,
    };
    return map[type] || FeedReactionType.HEART;
  }
}
