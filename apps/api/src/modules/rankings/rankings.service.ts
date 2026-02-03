import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RankingPeriod, RankingEntry } from './dto';

@Injectable()
export class RankingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPointsRanking(
    currentUserId: string,
    associationId: string,
    period: RankingPeriod,
    limit: number,
  ) {
    const { startDate } = this.getPeriodDates(period);

    // Get users in association with their points
    const users = await this.prisma.user.findMany({
      where: { associationId, status: 'ACTIVE' },
      include: {
        points: true,
      },
    });

    let entries: { userId: string; name: string; avatar?: string; value: number }[];

    if (period === RankingPeriod.ALL_TIME) {
      // Use lifetime earned
      entries = users
        .map((u) => ({
          userId: u.id,
          name: u.name,
          avatar: u.avatarUrl || undefined,
          value: u.points?.lifetimeEarned || 0,
        }))
        .sort((a, b) => b.value - a.value);
    } else {
      // Sum transactions in period
      const transactions = await this.prisma.pointTransaction.groupBy({
        by: ['userId'],
        where: {
          userId: { in: users.map((u) => u.id) },
          amount: { gt: 0 },
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      });

      const txMap = new Map(transactions.map((t) => [t.userId, t._sum.amount || 0]));

      entries = users
        .map((u) => ({
          userId: u.id,
          name: u.name,
          avatar: u.avatarUrl || undefined,
          value: txMap.get(u.id) || 0,
        }))
        .sort((a, b) => b.value - a.value);
    }

    // Find current user position
    const currentUserIndex = entries.findIndex((e) => e.userId === currentUserId);
    const currentUserEntry = entries[currentUserIndex];

    // Format response
    const rankedEntries: RankingEntry[] = entries.slice(0, limit).map((e, i) => ({
      position: i + 1,
      userId: e.userId,
      userName: e.name,
      userAvatar: e.avatar,
      value: e.value,
      isCurrentUser: e.userId === currentUserId,
    }));

    return {
      type: 'points',
      period,
      updatedAt: new Date(),
      entries: rankedEntries,
      currentUser: currentUserEntry
        ? {
            position: currentUserIndex + 1,
            value: currentUserEntry.value,
          }
        : undefined,
    };
  }

  async getEventsRanking(
    currentUserId: string,
    associationId: string,
    period: RankingPeriod,
    limit: number,
  ) {
    const { startDate } = this.getPeriodDates(period);

    // Get users in association
    const users = await this.prisma.user.findMany({
      where: { associationId, status: 'ACTIVE' },
      select: { id: true, name: true, avatarUrl: true },
    });

    // Count check-ins per user
    const whereClause: any = {
      userId: { in: users.map((u) => u.id) },
      source: 'EVENT_CHECKIN',
    };

    if (period !== RankingPeriod.ALL_TIME) {
      whereClause.createdAt = { gte: startDate };
    }

    const checkIns = await this.prisma.pointTransaction.groupBy({
      by: ['userId'],
      where: whereClause,
      _count: { _all: true },
    });

    const checkInMap = new Map(checkIns.map((c) => [c.userId, c._count._all]));

    const entries = users
      .map((u) => ({
        userId: u.id,
        name: u.name,
        avatar: u.avatarUrl || undefined,
        value: checkInMap.get(u.id) || 0,
      }))
      .sort((a, b) => b.value - a.value);

    const currentUserIndex = entries.findIndex((e) => e.userId === currentUserId);
    const currentUserEntry = entries[currentUserIndex];

    const rankedEntries: RankingEntry[] = entries.slice(0, limit).map((e, i) => ({
      position: i + 1,
      userId: e.userId,
      userName: e.name,
      userAvatar: e.avatar,
      value: e.value,
      isCurrentUser: e.userId === currentUserId,
    }));

    return {
      type: 'events',
      period,
      updatedAt: new Date(),
      entries: rankedEntries,
      currentUser: currentUserEntry
        ? {
            position: currentUserIndex + 1,
            value: currentUserEntry.value,
          }
        : undefined,
    };
  }

  async getStravaRanking(
    currentUserId: string,
    associationId: string,
    period: RankingPeriod,
    limit: number,
  ) {
    const { startDate } = this.getPeriodDates(period);

    // Get users in association with strava connection
    const users = await this.prisma.user.findMany({
      where: { associationId, status: 'ACTIVE' },
      select: { id: true, name: true, avatarUrl: true },
    });

    // Get strava connections
    const connections = await this.prisma.stravaConnection.findMany({
      where: { userId: { in: users.map((u) => u.id) } },
      select: { id: true, userId: true },
    });

    if (connections.length === 0) {
      return {
        type: 'strava',
        period,
        updatedAt: new Date(),
        entries: [],
        currentUser: undefined,
      };
    }

    // Sum km from activities
    const whereClause: any = {
      connectionId: { in: connections.map((c) => c.id) },
    };

    if (period !== RankingPeriod.ALL_TIME) {
      whereClause.activityDate = { gte: startDate };
    }

    const activities = await this.prisma.stravaActivity.groupBy({
      by: ['connectionId'],
      where: whereClause,
      _sum: { distanceKm: true },
    });

    const connectionUserMap = new Map(connections.map((c) => [c.id, c.userId]));
    const kmMap = new Map<string, number>();

    for (const act of activities) {
      const userId = connectionUserMap.get(act.connectionId);
      if (userId) {
        kmMap.set(userId, (kmMap.get(userId) || 0) + (act._sum.distanceKm || 0));
      }
    }

    const entries = users
      .map((u) => ({
        userId: u.id,
        name: u.name,
        avatar: u.avatarUrl || undefined,
        value: Math.round((kmMap.get(u.id) || 0) * 10) / 10, // Round to 1 decimal
      }))
      .sort((a, b) => b.value - a.value);

    const currentUserIndex = entries.findIndex((e) => e.userId === currentUserId);
    const currentUserEntry = entries[currentUserIndex];

    const rankedEntries: RankingEntry[] = entries.slice(0, limit).map((e, i) => ({
      position: i + 1,
      userId: e.userId,
      userName: e.name,
      userAvatar: e.avatar,
      value: e.value,
      isCurrentUser: e.userId === currentUserId,
    }));

    return {
      type: 'strava',
      period,
      updatedAt: new Date(),
      entries: rankedEntries,
      currentUser: currentUserEntry
        ? {
            position: currentUserIndex + 1,
            value: currentUserEntry.value,
          }
        : undefined,
    };
  }

  private getPeriodDates(period: RankingPeriod): { startDate: Date } {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case RankingPeriod.WEEKLY:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case RankingPeriod.MONTHLY:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case RankingPeriod.ALL_TIME:
      default:
        startDate = new Date(0); // Beginning of time
    }

    return { startDate };
  }
}
