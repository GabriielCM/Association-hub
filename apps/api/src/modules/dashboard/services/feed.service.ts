import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { PostResponseDto, PostAuthorDto, PostContentDto } from '../dto/post.dto';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(
    associationId: string,
    userId: string,
    offset = 0,
    limit = 10,
  ): Promise<{ posts: PostResponseDto[]; has_more: boolean }> {
    // Get suspended user IDs to exclude their posts
    const suspendedUserIds = await this.getSuspendedUserIds(associationId);

    const posts = await this.prisma.post.findMany({
      where: {
        associationId,
        deletedAt: null,
        isHidden: false,
        authorId: { notIn: suspendedUserIds },
      },
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
        poll: {
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
            votes: {
              where: { userId },
              select: { optionId: true },
            },
          },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip: offset,
      take: limit + 1, // Fetch one extra to check if there's more
    });

    const hasMore = posts.length > limit;
    const resultPosts = hasMore ? posts.slice(0, limit) : posts;

    return {
      posts: resultPosts.map((post) => this.formatPost(post, userId)),
      has_more: hasMore,
    };
  }

  async getPreview(
    associationId: string,
    limit = 3,
  ): Promise<any[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        associationId,
        deletedAt: null,
        isHidden: false,
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
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return posts.map((post) => ({
      id: post.id,
      type: post.type.toLowerCase(),
      author: {
        name: post.author.name,
        avatar_url: post.author.avatarUrl,
      },
      image_url: post.imageUrl,
      description: post.description?.slice(0, 100),
      likes_count: post.likesCount,
      comments_count: post.commentsCount,
    }));
  }

  private async getSuspendedUserIds(associationId: string): Promise<string[]> {
    const now = new Date();

    const suspensions = await this.prisma.userSuspension.findMany({
      where: {
        associationId,
        liftedAt: null,
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      select: { userId: true },
    });

    return suspensions.map((s) => s.userId);
  }

  private formatPost(post: any, currentUserId: string): PostResponseDto {
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

    // Add poll data if exists
    if (post.poll) {
      const userVote = post.poll.votes?.[0];
      (content as any).poll = {
        id: post.poll.id,
        question: post.poll.question,
        options: post.poll.options.map((opt: any) => ({
          text: opt.text,
          votes_count: opt.votesCount,
        })),
        total_votes: post.poll.totalVotes,
        user_voted: !!userVote,
        user_vote_option: userVote?.optionId,
        ends_at: post.poll.endsAt,
        ended: post.poll.endedAt !== null,
      };
    }

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
