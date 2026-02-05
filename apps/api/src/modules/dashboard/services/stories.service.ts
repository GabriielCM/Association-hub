import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { StoryType } from '@prisma/client';
import {
  StoryUserListItemDto,
  StoryResponseDto,
  StoryViewDto,
} from '../dto/story.dto';

const MAX_STORIES_PER_DAY = 10;
const STORY_DURATION_HOURS = 24;

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async listStories(
    userId: string,
    associationId: string,
  ): Promise<StoryUserListItemDto[]> {
    const now = new Date();

    // Get all users with active stories in the association
    const usersWithStories = await this.prisma.story.groupBy({
      by: ['userId'],
      where: {
        associationId,
        expiresAt: { gt: now },
      },
      _count: { id: true },
    });

    if (usersWithStories.length === 0) {
      return [];
    }

    const userIds = usersWithStories.map((u) => u.userId);

    // Get user details
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });

    // Get which stories the current user has viewed
    const viewedStories = await this.prisma.storyView.findMany({
      where: {
        viewerId: userId,
        story: {
          userId: { in: userIds },
          expiresAt: { gt: now },
        },
      },
      select: { storyId: true },
    });

    const viewedStoryIds = new Set(viewedStories.map((v) => v.storyId));

    // Get story IDs for each user to check unseen status
    const allStories = await this.prisma.story.findMany({
      where: {
        userId: { in: userIds },
        expiresAt: { gt: now },
      },
      select: { id: true, userId: true },
    });

    // Group stories by user
    const storiesByUser = new Map<string, string[]>();
    for (const story of allStories) {
      const existing = storiesByUser.get(story.userId) || [];
      existing.push(story.id);
      storiesByUser.set(story.userId, existing);
    }

    // Build response
    const result: StoryUserListItemDto[] = users.map((user) => {
      const userStoryIds = storiesByUser.get(user.id) || [];
      const hasUnseen = userStoryIds.some((id) => !viewedStoryIds.has(id));

      return {
        user_id: user.id,
        username: user.name,
        avatar_url: user.avatarUrl || undefined,
        has_unseen: hasUnseen,
        stories_count: userStoryIds.length,
      };
    });

    // Sort: unseen first, then by stories count
    result.sort((a, b) => {
      if (a.has_unseen && !b.has_unseen) return -1;
      if (!a.has_unseen && b.has_unseen) return 1;
      return b.stories_count - a.stories_count;
    });

    return result;
  }

  async createStory(
    userId: string,
    associationId: string,
    data: {
      type: StoryType;
      mediaUrl?: string;
      text?: string;
      backgroundColor?: string;
    },
  ): Promise<StoryResponseDto> {
    // Check daily limit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayStoriesCount = await this.prisma.story.count({
      where: {
        userId,
        createdAt: { gte: todayStart },
      },
    });

    if (todayStoriesCount >= MAX_STORIES_PER_DAY) {
      throw new BadRequestException(
        `Limite de ${MAX_STORIES_PER_DAY} stories por dia atingido`,
      );
    }

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + STORY_DURATION_HOURS);

    const story = await this.prisma.story.create({
      data: {
        userId,
        associationId,
        type: data.type,
        mediaUrl: data.mediaUrl,
        text: data.text,
        backgroundColor: data.backgroundColor,
        expiresAt,
      },
    });

    return {
      id: story.id,
      type: story.type,
      url: story.mediaUrl || undefined,
      text: story.text || undefined,
      background_color: story.backgroundColor || undefined,
      created_at: story.createdAt,
      expires_at: story.expiresAt,
    };
  }

  async getUserStories(
    targetUserId: string,
    viewerId: string,
  ): Promise<StoryResponseDto[]> {
    const now = new Date();

    const stories = await this.prisma.story.findMany({
      where: {
        userId: targetUserId,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'asc' },
    });

    return stories.map((story) => ({
      id: story.id,
      type: story.type,
      url: story.mediaUrl || undefined,
      text: story.text || undefined,
      background_color: story.backgroundColor || undefined,
      created_at: story.createdAt,
      expires_at: story.expiresAt,
    }));
  }

  async recordView(storyId: string, viewerId: string): Promise<void> {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, userId: true, expiresAt: true },
    });

    if (!story) {
      throw new NotFoundException('Story não encontrado');
    }

    if (story.expiresAt < new Date()) {
      throw new NotFoundException('Story expirado');
    }

    // Don't record view for own story
    if (story.userId === viewerId) {
      return;
    }

    // Upsert view (ignore if already exists)
    await this.prisma.storyView.upsert({
      where: {
        storyId_viewerId: { storyId, viewerId },
      },
      create: {
        storyId,
        viewerId,
      },
      update: {}, // No update needed
    });
  }

  async getViews(
    storyId: string,
    userId: string,
  ): Promise<{ views: StoryViewDto[]; total_views: number }> {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      select: { userId: true },
    });

    if (!story) {
      throw new NotFoundException('Story não encontrado');
    }

    // Only owner can see views
    if (story.userId !== userId) {
      throw new ForbiddenException(
        'Apenas o criador pode ver as visualizações',
      );
    }

    const views = await this.prisma.storyView.findMany({
      where: { storyId },
      include: {
        viewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
    });

    return {
      views: views.map((v) => ({
        user_id: v.viewer.id,
        username: v.viewer.name,
        avatar_url: v.viewer.avatarUrl || undefined,
        viewed_at: v.viewedAt,
      })),
      total_views: views.length,
    };
  }

  async deleteStory(storyId: string, userId: string): Promise<void> {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      select: { userId: true },
    });

    if (!story) {
      throw new NotFoundException('Story não encontrado');
    }

    if (story.userId !== userId) {
      throw new ForbiddenException('Você só pode deletar seus próprios stories');
    }

    await this.prisma.story.delete({
      where: { id: storyId },
    });
  }

  async hasUnviewedStories(
    userId: string,
    associationId: string,
  ): Promise<boolean> {
    const now = new Date();

    // Get all active stories in the association (excluding user's own)
    const activeStories = await this.prisma.story.findMany({
      where: {
        associationId,
        expiresAt: { gt: now },
        userId: { not: userId },
      },
      select: { id: true },
    });

    if (activeStories.length === 0) {
      return false;
    }

    const storyIds = activeStories.map((s) => s.id);

    // Get viewed stories
    const viewedCount = await this.prisma.storyView.count({
      where: {
        viewerId: userId,
        storyId: { in: storyIds },
      },
    });

    return viewedCount < storyIds.length;
  }
}
