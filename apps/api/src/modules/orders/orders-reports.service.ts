import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import {
  generateCsv,
  CsvColumn,
  formatMoney,
  formatDateTimePtBr,
  resolvePeriodDates,
} from '../../common/utils/csv-export';
import { ReportsQueryDto } from '../../common/dto/reports-query.dto';
import type { SalesReport, SalesReportByPeriod, SalesReportByProduct, SalesReportByPaymentMethod, OrdersSummaryCounters } from '@ahub/shared/src/types';

@Injectable()
export class OrdersReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummaryCounters(): Promise<OrdersSummaryCounters> {
    const counts = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const revenue = await this.prisma.order.aggregate({
      where: { status: { not: OrderStatus.CANCELLED } },
      _sum: {
        moneyPaid: true,
        pointsUsed: true,
      },
    });

    const statusMap: Record<string, number> = {};
    for (const item of counts) {
      statusMap[item.status] = item._count.id;
    }

    return {
      pending: statusMap[OrderStatus.PENDING] || 0,
      confirmed: statusMap[OrderStatus.CONFIRMED] || 0,
      ready: statusMap[OrderStatus.READY] || 0,
      completed: statusMap[OrderStatus.COMPLETED] || 0,
      cancelled: statusMap[OrderStatus.CANCELLED] || 0,
      totalRevenueMoney: Number(revenue._sum.moneyPaid ?? 0),
      totalRevenuePoints: revenue._sum.pointsUsed ?? 0,
    };
  }

  async getSalesAnalytics(query: ReportsQueryDto): Promise<SalesReport> {
    const { start, end } = resolvePeriodDates(query.period, query.startDate, query.endDate);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: OrderStatus.CANCELLED },
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    let totalPointsRevenue = 0;
    let totalMoneyRevenue = 0;
    let totalCashback = 0;

    const byPeriodMap = new Map<string, SalesReportByPeriod>();
    const byProductMap = new Map<string, SalesReportByProduct>();
    const byMethodMap = new Map<string, SalesReportByPaymentMethod>();

    for (const order of orders) {
      const points = order.pointsUsed ?? 0;
      const money = Number(order.moneyPaid ?? 0);
      const cashback = order.cashbackEarned ?? 0;

      totalPointsRevenue += points;
      totalMoneyRevenue += money;
      totalCashback += cashback;

      // By period
      const dateKey = this.getDateKey(order.createdAt, query.groupBy || 'day');
      const period = byPeriodMap.get(dateKey) || { date: dateKey, orders: 0, pointsRevenue: 0, moneyRevenue: 0 };
      period.orders += 1;
      period.pointsRevenue += points;
      period.moneyRevenue += money;
      byPeriodMap.set(dateKey, period);

      // By product
      for (const item of order.items) {
        const prod = byProductMap.get(item.productId) || {
          productId: item.productId,
          productName: item.productName,
          quantitySold: 0,
          pointsRevenue: 0,
          moneyRevenue: 0,
        };
        prod.quantitySold += item.quantity;
        prod.pointsRevenue += item.totalPoints;
        prod.moneyRevenue += Number(item.totalMoney);
        byProductMap.set(item.productId, prod);
      }

      // By payment method
      const method = order.paymentMethod;
      const entry = byMethodMap.get(method) || { method, count: 0, totalPoints: 0, totalMoney: 0 };
      entry.count += 1;
      entry.totalPoints += points;
      entry.totalMoney += money;
      byMethodMap.set(method, entry);
    }

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? (totalPointsRevenue + totalMoneyRevenue) / totalOrders : 0;

    return {
      period: query.period || 'month',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      summary: {
        totalOrders,
        totalPointsRevenue,
        totalMoneyRevenue,
        totalCashback,
        averageOrderValue,
      },
      byPeriod: Array.from(byPeriodMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
      byProduct: Array.from(byProductMap.values()).sort((a, b) => b.quantitySold - a.quantitySold),
      byPaymentMethod: Array.from(byMethodMap.values()),
    };
  }

  async exportOrdersCsv(query: ReportsQueryDto): Promise<Buffer> {
    const { start, end } = resolvePeriodDates(query.period, query.startDate, query.endDate);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const columns: CsvColumn<(typeof orders)[0]>[] = [
      { header: 'Data', accessor: (r) => formatDateTimePtBr(r.createdAt) },
      { header: 'Codigo', accessor: (r) => r.code },
      { header: 'Usuario', accessor: (r) => r.userId },
      { header: 'Origem', accessor: (r) => r.source },
      { header: 'Status', accessor: (r) => r.status },
      { header: 'Metodo Pagamento', accessor: (r) => r.paymentMethod },
      { header: 'Itens', accessor: (r) => r.items.length },
      { header: 'Pontos Usados', accessor: (r) => r.pointsUsed ?? 0 },
      { header: 'Valor Pago (R$)', accessor: (r) => formatMoney(Number(r.moneyPaid ?? 0)) },
      { header: 'Cashback', accessor: (r) => r.cashbackEarned ?? 0 },
    ];

    return generateCsv(orders, columns);
  }

  private getDateKey(date: Date, groupBy: string): string {
    const d = new Date(date);
    switch (groupBy) {
      case 'week': {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return d.toISOString().split('T')[0];
      }
      case 'month':
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-01`;
      case 'day':
      default:
        return d.toISOString().split('T')[0];
    }
  }
}
