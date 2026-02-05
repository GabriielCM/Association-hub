import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { PostType } from '@prisma/client';
import { ModerationService } from './moderation.service';
import { PointsService } from '../../points/points.service';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  PostResponseDto,
  PostAuthorDto,
  PostContentDto,
  CreatePostResponseDto,
} from '../dto/post.dto';

const RATE_LIMIT_POSTS_PER_HOUR = 3;
const DAILY_POST_POINTS = 10;

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moderationService: ModerationService,
    private readonly pointsService: PointsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createPost(
    userId: string,
    associationId: string,
    imageUrl: string,
    description: string,
  ): Promise<CreatePostResponseDto> {
    // Check suspension
    await this.moderationService.checkSuspension(userId, associationId);

    // Check rate limit
    await this.checkRateLimit(userId);

    // Create post
    const post = await this.prisma.post.create({
      data: {
        authorId: userId,
        associationId,
        type: PostType.PHOTO,
        imageUrl,
        description,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Award points for first daily post
    const pointsEarned = await this.awardDailyPostPoints(userId, post.id);

    // Build response
    const postResponse = this.formatPostResponse(post, userId);

    const message =
      pointsEarned > 0
        ? `Post publicado! +${pointsEarned} pontos`
        : 'Post publicado!';

    return {
      post: postResponse,
      points_earned: pointsEarned,
      message,
    };
  }

  async getPost(postId: string, userId: string): Promise<PostResponseDto> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    if (!post || post.deletedAt || post.isHidden) {
      throw new NotFoundException('Post não encontrado');
    }

    return this.formatPostResponse(post, userId);
  }

  async updatePost(
    postId: string,
    userId: string,
    description: string,
  ): Promise<PostResponseDto> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, deletedAt: true },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post não encontrado');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('Você só pode editar seus próprios posts');
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: { description },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return this.formatPostResponse(updated, userId);
  }

  async deletePost(
    postId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, deletedAt: true },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post não encontrado');
    }

    if (!isAdmin && post.authorId !== userId) {
      throw new ForbiddenException('Você só pode deletar seus próprios posts');
    }

    // Soft delete
    await this.prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });
  }

  async likePost(
    postId: string,
    userId: string,
    associationId: string,
  ): Promise<number> {
    await this.moderationService.checkSuspension(userId, associationId);

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, deletedAt: true },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post não encontrado');
    }

    // Check if already liked
    const existingLike = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existingLike) {
      throw new BadRequestException('Você já curtiu este post');
    }

    // Create like and increment counter
    await this.prisma.$transaction([
      this.prisma.postLike.create({
        data: { postId, userId },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);

    // Send notification to author (if not self)
    if (post.authorId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      await this.notificationsService.create({
        userId: post.authorId,
        type: 'NEW_LIKE',
        category: 'SOCIAL',
        title: 'Nova curtida',
        body: `${user?.name || 'Alguém'} curtiu seu post`,
        data: { postId },
        actionUrl: `/posts/${postId}`,
      });
    }

    const updatedPost = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { likesCount: true },
    });

    return updatedPost?.likesCount || 0;
  }

  async unlikePost(postId: string, userId: string): Promise<number> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, deletedAt: true },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post não encontrado');
    }

    const existingLike = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (!existingLike) {
      throw new BadRequestException('Você não curtiu este post');
    }

    await this.prisma.$transaction([
      this.prisma.postLike.delete({
        where: { postId_userId: { postId, userId } },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);

    const updatedPost = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { likesCount: true },
    });

    return updatedPost?.likesCount || 0;
  }

  // Internal method for creating event posts
  async createEventPost(
    associationId: string,
    eventId: string,
    imageUrl: string,
    description: string,
    authorId: string,
  ): Promise<string> {
    const post = await this.prisma.post.create({
      data: {
        authorId,
        associationId,
        type: PostType.EVENT,
        eventId,
        imageUrl,
        description,
      },
    });

    return post.id;
  }

  async updateEventPost(eventId: string, description: string): Promise<void> {
    await this.prisma.post.updateMany({
      where: { eventId },
      data: { description },
    });
  }

  async deleteEventPost(eventId: string): Promise<void> {
    await this.prisma.post.updateMany({
      where: { eventId },
      data: { deletedAt: new Date() },
    });
  }

  private async checkRateLimit(userId: string): Promise<void> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentPostsCount = await this.prisma.post.count({
      where: {
        authorId: userId,
        createdAt: { gte: oneHourAgo },
        type: PostType.PHOTO, // Only count user posts, not event posts
      },
    });

    if (recentPostsCount >= RATE_LIMIT_POSTS_PER_HOUR) {
      throw new BadRequestException(
        `Limite de ${RATE_LIMIT_POSTS_PER_HOUR} posts por hora atingido`,
      );
    }
  }

  private async awardDailyPostPoints(
    userId: string,
    postId: string,
  ): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user already got points today
    const tracker = await this.prisma.dailyPostTracker.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (tracker?.pointsAwarded) {
      return 0;
    }

    // Award points
    await this.pointsService.creditPoints(
      userId,
      DAILY_POST_POINTS,
      'DAILY_POST',
      'Primeiro post do dia',
      { postId },
    );

    // Track it
    await this.prisma.dailyPostTracker.upsert({
      where: { userId_date: { userId, date: today } },
      create: {
        userId,
        date: today,
        firstPostId: postId,
        pointsAwarded: true,
      },
      update: { pointsAwarded: true, firstPostId: postId },
    });

    return DAILY_POST_POINTS;
  }

  private formatPostResponse(post: any, currentUserId: string): PostResponseDto {
    const liked = post.likes?.length > 0;

    const author: PostAuthorDto = {
      id: post.author.id,
      name: post.author.name,
      avatar_url: post.author.avatarUrl || undefined,
    };

    const content: PostContentDto = {
      image_url: post.imageUrl || undefined,
      description: post.description || undefined,
      likes_count: post.likesCount,
      comments_count: post.commentsCount,
      liked_by_me: liked,
    };

    return {
      id: post.id,
      type: post.type.toLowerCase(),
      author,
      created_at: post.createdAt,
      content,
      pinned: post.isPinned,
    };
  }
}
