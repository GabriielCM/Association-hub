import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  generateCsv,
  CsvColumn,
  formatMoney,
  formatDateTimePtBr,
  resolvePeriodDates,
} from '../../common/utils/csv-export';
import { ReportsQueryDto } from '../../common/dto/reports-query.dto';
import type { SalesReport, SalesReportByPeriod, SalesReportByProduct, SalesReportByPaymentMethod } from '@ahub/shared/src/types';

@Injectable()
export class PdvReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesAnalytics(associationId: string, query: ReportsQueryDto): Promise<SalesReport> {
    const { start, end } = resolvePeriodDates(query.period, query.startDate, query.endDate);

    // Get all PDVs for this association
    const pdvIds = await this.prisma.pdv.findMany({
      where: { associationId },
      select: { id: true },
    });
    const pdvIdList = pdvIds.map((p) => p.id);

    if (pdvIdList.length === 0) {
      return this.emptyReport(query.period || 'month', start, end);
    }

    // Fetch all sales in the period
    const sales = await this.prisma.pdvSale.findMany({
      where: {
        pdvId: { in: pdvIdList },
        createdAt: { gte: start, lte: end },
      },
      include: {
        checkout: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Summary
    let totalPointsRevenue = 0;
    let totalMoneyRevenue = 0;
    let totalCashback = 0;

    const byPeriodMap = new Map<string, SalesReportByPeriod>();
    const byProductMap = new Map<string, SalesReportByProduct>();
    const byMethodMap = new Map<string, SalesReportByPaymentMethod>();

    for (const sale of sales) {
      const points = sale.totalPoints ?? 0;
      const money = Number(sale.totalMoney ?? 0);
      const cashback = sale.cashbackEarned ?? 0;

      totalPointsRevenue += points;
      totalMoneyRevenue += money;
      totalCashback += cashback;

      // Group by period
      const dateKey = this.getDateKey(sale.createdAt, query.groupBy || 'day');
      const existing = byPeriodMap.get(dateKey) || { date: dateKey, orders: 0, pointsRevenue: 0, moneyRevenue: 0 };
      existing.orders += 1;
      existing.pointsRevenue += points;
      existing.moneyRevenue += money;
      byPeriodMap.set(dateKey, existing);

      // Group by product (from checkout items)
      if (sale.checkout?.items) {
        const items = sale.checkout.items as any[];
        for (const item of items) {
          const productId = item.product_id || item.productId || 'unknown';
          const productName = item.name || 'Produto';
          const prod = byProductMap.get(productId) || {
            productId,
            productName,
            quantitySold: 0,
            pointsRevenue: 0,
            moneyRevenue: 0,
          };
          prod.quantitySold += item.quantity || 1;
          prod.pointsRevenue += (item.unit_price_points || 0) * (item.quantity || 1);
          prod.moneyRevenue += (item.unit_price_money || 0) * (item.quantity || 1);
          byProductMap.set(productId, prod);
        }
      }

      // Group by payment method
      const method = sale.paymentMethod || 'UNKNOWN';
      const methodEntry = byMethodMap.get(method) || { method, count: 0, totalPoints: 0, totalMoney: 0 };
      methodEntry.count += 1;
      methodEntry.totalPoints += points;
      methodEntry.totalMoney += money;
      byMethodMap.set(method, methodEntry);
    }

    const totalOrders = sales.length;
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

  async exportSalesCsv(associationId: string, query: ReportsQueryDto): Promise<Buffer> {
    const { start, end } = resolvePeriodDates(query.period, query.startDate, query.endDate);

    const pdvIds = await this.prisma.pdv.findMany({
      where: { associationId },
      select: { id: true },
    });

    const sales = await this.prisma.pdvSale.findMany({
      where: {
        pdvId: { in: pdvIds.map((p) => p.id) },
        createdAt: { gte: start, lte: end },
      },
      include: {
        pdv: { select: { name: true } },
        checkout: { select: { code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const columns: CsvColumn<(typeof sales)[0]>[] = [
      { header: 'Data', accessor: (r) => formatDateTimePtBr(r.createdAt) },
      { header: 'PDV', accessor: (r) => r.pdv?.name || '' },
      { header: 'Codigo Checkout', accessor: (r) => r.checkout?.code || '' },
      { header: 'Metodo Pagamento', accessor: (r) => r.paymentMethod },
      { header: 'Pontos', accessor: (r) => r.totalPoints ?? 0 },
      { header: 'Valor (R$)', accessor: (r) => formatMoney(Number(r.totalMoney ?? 0)) },
      { header: 'Cashback', accessor: (r) => r.cashbackEarned ?? 0 },
    ];

    return generateCsv(sales, columns);
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

  private emptyReport(period: string, start: Date, end: Date): SalesReport {
    return {
      period: period as any,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      summary: { totalOrders: 0, totalPointsRevenue: 0, totalMoneyRevenue: 0, totalCashback: 0, averageOrderValue: 0 },
      byPeriod: [],
      byProduct: [],
      byPaymentMethod: [],
    };
  }
}
