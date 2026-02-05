import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { PointsService } from '../../points/points.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { StoriesService } from './stories.service';
import { FeedService } from './feed.service';
import { DashboardSummaryResponseDto, UserSummaryDto } from '../dto/dashboard-summary.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService,
    private readonly notificationsService: NotificationsService,
    private readonly storiesService: StoriesService,
    private readonly feedService: FeedService,
  ) {}

  async getSummary(
    userId: string,
    associationId: string,
  ): Promise<DashboardSummaryResponseDto> {
    // Fetch all data in parallel
    const [user, pointsData, unreadResult, hasStories, feedPreview] =
      await Promise.all([
        this.getUserData(userId),
        this.getPointsData(userId),
        this.notificationsService.getUnreadCount(userId),
        this.storiesService.hasUnviewedStories(userId, associationId),
        this.feedService.getPreview(associationId, 3),
      ]);

    const userSummary: UserSummaryDto = {
      name: user.name.split(' ')[0], // First name only
      avatar_url: user.avatarUrl,
      points: pointsData.balance,
      points_today: pointsData.todayVariation,
      points_chart: pointsData.last7Days,
    };

    return {
      user: userSummary,
      unread_notifications: unreadResult.total,
      has_stories: hasStories,
      feed_preview: feedPreview,
    };
  }

  private async getUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        avatarUrl: true,
      },
    });

    return {
      name: user?.name || 'Usuário',
      avatarUrl: user?.avatarUrl || null,
    };
  }

  private async getPointsData(userId: string) {
    // Get current balance
    const balance = await this.pointsService.getBalance(userId);

    // Get today's variation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = await this.prisma.pointTransaction.aggregate({
      where: {
        userId,
        createdAt: { gte: today },
      },
      _sum: { amount: true },
    });

    // Get last 7 days chart
    const last7Days = await this.getLast7DaysChart(userId);

    return {
      balance: balance.balance,
      todayVariation: todayTransactions._sum.amount || 0,
      last7Days,
    };
  }

  private async getLast7DaysChart(userId: string): Promise<number[]> {
    const result: number[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayTotal = await this.prisma.pointTransaction.aggregate({
        where: {
          userId,
          createdAt: {
            gte: dayStart,
            lt: dayEnd,
          },
          amount: { gt: 0 }, // Only credits
        },
        _sum: { amount: true },
      });

      result.push(dayTotal._sum.amount || 0);
    }

    return result;
  }
}
