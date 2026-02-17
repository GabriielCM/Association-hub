import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface AdminStatsResponse {
  members: {
    total: number;
    newThisMonth: number;
    changePercent: number;
  };
  events: {
    active: number;
    changePercent: number;
  };
  sales: {
    monthlyRevenue: number;
    changePercent: number;
  };
  points: {
    distributedThisMonth: number;
    changePercent: number;
  };
  posts: {
    thisMonth: number;
  };
  reports: {
    pending: number;
  };
  charts: {
    membersByMonth: Array<{ month: string; count: number }>;
    pointsByDay: Array<{ date: string; earned: number; spent: number }>;
    eventAttendance: Array<{ event: string; attendance: number; capacity: number }>;
    revenueByMonth: Array<{ month: string; store: number; pdv: number }>;
  };
}

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(associationId: string): Promise<AdminStatsResponse> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalMembers,
      newMembersThisMonth,
      newMembersLastMonth,
      activeEvents,
      activeEventsLastMonth,
      pointsThisMonth,
      pointsLastMonth,
      salesThisMonth,
      salesLastMonth,
      postsThisMonth,
      pendingReports,
      membersByMonth,
      pointsByDay,
      eventAttendance,
      revenueByMonth,
    ] = await Promise.all([
      // Total members
      this.prisma.user.count({
        where: { associationId, status: 'ACTIVE' },
      }),

      // New members this month
      this.prisma.user.count({
        where: {
          associationId,
          createdAt: { gte: startOfMonth },
        },
      }),

      // New members last month
      this.prisma.user.count({
        where: {
          associationId,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),

      // Active events (SCHEDULED or ONGOING)
      this.prisma.event.count({
        where: {
          associationId,
          status: { in: ['SCHEDULED', 'ONGOING'] },
        },
      }),

      // Active events last month
      this.prisma.event.count({
        where: {
          associationId,
          status: { in: ['SCHEDULED', 'ONGOING'] },
          startDate: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),

      // Points distributed this month (credits only)
      this.prisma.pointTransaction.aggregate({
        where: {
          user: { associationId },
          createdAt: { gte: startOfMonth },
          amount: { gt: 0 },
        },
        _sum: { amount: true },
      }),

      // Points distributed last month
      this.prisma.pointTransaction.aggregate({
        where: {
          user: { associationId },
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          amount: { gt: 0 },
        },
        _sum: { amount: true },
      }),

      // Sales this month (money revenue from orders)
      this.prisma.order.aggregate({
        where: {
          user: { associationId },
          createdAt: { gte: startOfMonth },
          status: { in: ['CONFIRMED', 'READY', 'COMPLETED'] },
        },
        _sum: { moneyPaid: true },
      }),

      // Sales last month
      this.prisma.order.aggregate({
        where: {
          user: { associationId },
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: { in: ['CONFIRMED', 'READY', 'COMPLETED'] },
        },
        _sum: { moneyPaid: true },
      }),

      // Posts this month
      this.prisma.post.count({
        where: {
          author: { associationId },
          createdAt: { gte: startOfMonth },
        },
      }),

      // Pending reports
      this.prisma.report.count({
        where: {
          post: { author: { associationId } },
          status: 'PENDING',
        },
      }),

      // Charts: Members by month (last 12 months)
      this.getMembersByMonth(associationId, 12),

      // Charts: Points by day (last 30 days)
      this.getPointsByDay(associationId, 30),

      // Charts: Event attendance (last 5 events)
      this.getEventAttendance(associationId, 5),

      // Charts: Revenue by month (last 6 months)
      this.getRevenueByMonth(associationId, 6),
    ]);

    const currentPointsDistributed = pointsThisMonth._sum?.amount ?? 0;
    const lastMonthPointsDistributed = pointsLastMonth._sum?.amount ?? 0;
    const currentSales = Number(salesThisMonth._sum?.moneyPaid ?? 0);
    const lastMonthSales = Number(salesLastMonth._sum?.moneyPaid ?? 0);

    return {
      members: {
        total: totalMembers,
        newThisMonth: newMembersThisMonth,
        changePercent: this.calcChangePercent(newMembersThisMonth, newMembersLastMonth),
      },
      events: {
        active: activeEvents,
        changePercent: this.calcChangePercent(activeEvents, activeEventsLastMonth),
      },
      sales: {
        monthlyRevenue: currentSales,
        changePercent: this.calcChangePercent(currentSales, lastMonthSales),
      },
      points: {
        distributedThisMonth: currentPointsDistributed,
        changePercent: this.calcChangePercent(currentPointsDistributed, lastMonthPointsDistributed),
      },
      posts: {
        thisMonth: postsThisMonth,
      },
      reports: {
        pending: pendingReports,
      },
      charts: {
        membersByMonth,
        pointsByDay,
        eventAttendance,
        revenueByMonth,
      },
    };
  }

  private async getMembersByMonth(
    associationId: string,
    months: number,
  ): Promise<Array<{ month: string; count: number }>> {
    const results: Array<{ month: string; count: number }> = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const count = await this.prisma.user.count({
        where: {
          associationId,
          createdAt: { lte: endDate },
          status: 'ACTIVE',
        },
      });

      results.push({
        month: date.toISOString().slice(0, 7), // YYYY-MM
        count,
      });
    }

    return results;
  }

  private async getPointsByDay(
    associationId: string,
    days: number,
  ): Promise<Array<{ date: string; earned: number; spent: number }>> {
    const results: Array<{ date: string; earned: number; spent: number }> = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [earned, spent] = await Promise.all([
        this.prisma.pointTransaction.aggregate({
          where: {
            user: { associationId },
            createdAt: { gte: dayStart, lt: dayEnd },
            amount: { gt: 0 },
          },
          _sum: { amount: true },
        }),
        this.prisma.pointTransaction.aggregate({
          where: {
            user: { associationId },
            createdAt: { gte: dayStart, lt: dayEnd },
            amount: { lt: 0 },
          },
          _sum: { amount: true },
        }),
      ]);

      results.push({
        date: dayStart.toISOString().slice(0, 10),
        earned: earned._sum?.amount ?? 0,
        spent: Math.abs(spent._sum?.amount ?? 0),
      });
    }

    return results;
  }

  private async getEventAttendance(
    associationId: string,
    limit: number,
  ): Promise<Array<{ event: string; attendance: number; capacity: number }>> {
    const events = await this.prisma.event.findMany({
      where: {
        associationId,
        status: { in: ['ENDED', 'ONGOING'] },
      },
      select: {
        title: true,
        capacity: true,
        _count: {
          select: { confirmations: true },
        },
      },
      orderBy: { startDate: 'desc' },
      take: limit,
    });

    return events.map((event) => ({
      event: event.title,
      attendance: event._count.confirmations,
      capacity: event.capacity || 0,
    }));
  }

  private async getRevenueByMonth(
    associationId: string,
    months: number,
  ): Promise<Array<{ month: string; store: number; pdv: number }>> {
    const results: Array<{ month: string; store: number; pdv: number }> = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const [storeRevenue, pdvRevenue] = await Promise.all([
        this.prisma.order.aggregate({
          where: {
            user: { associationId },
            source: 'STORE',
            createdAt: { gte: monthStart, lte: monthEnd },
            status: { in: ['CONFIRMED', 'READY', 'COMPLETED'] },
          },
          _sum: { moneyPaid: true },
        }),
        this.prisma.order.aggregate({
          where: {
            user: { associationId },
            source: 'PDV',
            createdAt: { gte: monthStart, lte: monthEnd },
            status: { in: ['CONFIRMED', 'READY', 'COMPLETED'] },
          },
          _sum: { moneyPaid: true },
        }),
      ]);

      results.push({
        month: monthStart.toISOString().slice(0, 7),
        store: Number(storeRevenue._sum?.moneyPaid ?? 0),
        pdv: Number(pdvRevenue._sum?.moneyPaid ?? 0),
      });
    }

    return results;
  }

  private calcChangePercent(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}
