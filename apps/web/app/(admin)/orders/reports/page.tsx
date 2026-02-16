'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui';
import { useOrdersReport } from '@/lib/hooks/useAdminOrders';
import { exportOrdersCsv } from '@/lib/api/orders.api';
import { ReportSummaryCards } from '@/components/admin/shared/ReportSummaryCards';
import { PeriodSelector } from '@/components/admin/shared/PeriodSelector';
import { SalesChart } from '@/components/admin/shared/SalesChart';
import { ExportCsvButton } from '@/components/admin/shared/ExportCsvButton';
import type { ReportPeriod } from '@ahub/shared/types';

export default function OrdersReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const { data: report, isLoading } = useOrdersReport({ period });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Relatorios de Pedidos</h1>
            <p className="text-muted-foreground">Analise de vendas e desempenho</p>
          </div>
        </div>
        <ExportCsvButton
          onExport={() => exportOrdersCsv({ period })}
          filename={`pedidos-${period}-${new Date().toISOString().split('T')[0]}.csv`}
          disabled={!report}
        />
      </div>

      {/* Period Selector */}
      <PeriodSelector value={period} onChange={setPeriod} />

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 rounded-lg bg-muted" />
          <div className="h-60 rounded-lg bg-muted" />
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <ReportSummaryCards
            items={[
              { label: 'Total Pedidos', value: report.summary.totalOrders.toString() },
              { label: 'Receita Pontos', value: `${report.summary.totalPointsRevenue.toLocaleString('pt-BR')} pts` },
              { label: 'Receita Dinheiro', value: `R$ ${report.summary.totalMoneyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
              { label: 'Cashback Distribuido', value: `${report.summary.totalCashback.toLocaleString('pt-BR')} pts` },
              { label: 'Valor Medio', value: report.summary.averageOrderValue.toFixed(0) },
            ]}
            columns={5}
          />

          {/* Sales Chart */}
          <SalesChart data={report.byPeriod} />

          {/* By Product */}
          {report.byProduct.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="mb-4 text-lg font-semibold">Vendas por Produto</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">Produto</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Qtd Vendida</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Pontos</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Dinheiro</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byProduct.map((item) => (
                    <tr key={item.productId} className="border-b border-border/50">
                      <td className="py-2">{item.productName}</td>
                      <td className="py-2 text-right">{item.quantitySold}</td>
                      <td className="py-2 text-right">{item.pointsRevenue.toLocaleString('pt-BR')} pts</td>
                      <td className="py-2 text-right">R$ {item.moneyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* By Payment Method */}
          {report.byPaymentMethod.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="mb-4 text-lg font-semibold">Por Metodo de Pagamento</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">Metodo</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Pedidos</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Pontos</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Dinheiro</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byPaymentMethod.map((item) => (
                    <tr key={item.method} className="border-b border-border/50">
                      <td className="py-2">{item.method}</td>
                      <td className="py-2 text-right">{item.count}</td>
                      <td className="py-2 text-right">{item.totalPoints.toLocaleString('pt-BR')} pts</td>
                      <td className="py-2 text-right">R$ {item.totalMoney.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
