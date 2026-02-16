'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui';
import { PeriodSelector } from '@/components/admin/shared/PeriodSelector';
import { ReportSummaryCards } from '@/components/admin/shared/ReportSummaryCards';
import { SalesChart } from '@/components/admin/shared/SalesChart';
import { ExportCsvButton } from '@/components/admin/shared/ExportCsvButton';
import { useStoreReport, useProductSalesReport } from '@/lib/hooks/useAdminStoreReports';
import { exportStoreCsv } from '@/lib/api/store.api';
import type { ReportPeriod } from '@ahub/shared/types';

export default function StoreReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const { data: report, isLoading } = useStoreReport(period);
  const { data: productReport } = useProductSalesReport(period);

  const summary = report?.summary;

  const handleExport = async () => {
    const blob = await exportStoreCsv({ period });
    return blob;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/store">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Relatorios da Loja</h1>
            <p className="text-sm text-muted-foreground">
              Vendas, receita e desempenho de produtos
            </p>
          </div>
        </div>
        <ExportCsvButton
          onExport={handleExport}
          filename={`loja-relatorio-${period}`}
        />
      </div>

      {/* Period Selector */}
      <PeriodSelector value={period} onChange={setPeriod} />

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : summary ? (
        <ReportSummaryCards
          items={[
            {
              label: 'Total Pedidos',
              value: summary.totalOrders?.toLocaleString('pt-BR') ?? '0',
            },
            {
              label: 'Receita Pontos',
              value: `${(summary.totalPointsRevenue ?? 0).toLocaleString('pt-BR')} pts`,
            },
            {
              label: 'Receita R$',
              value: `R$ ${(summary.totalMoneyRevenue ?? 0).toFixed(2)}`,
            },
            {
              label: 'Cashback',
              value: `${(summary.totalCashback ?? 0).toLocaleString('pt-BR')} pts`,
            },
          ]}
        />
      ) : null}

      {/* Chart */}
      {report?.byPeriod && report.byPeriod.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Vendas por Periodo</h2>
          <SalesChart data={report.byPeriod} />
        </div>
      )}

      {/* Product Sales Table */}
      {productReport && productReport.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Vendas por Produto</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Produto</th>
                  <th className="px-4 py-3 text-right font-medium">Qtd Vendida</th>
                  <th className="px-4 py-3 text-right font-medium">Receita Pontos</th>
                  <th className="px-4 py-3 text-right font-medium">Receita R$</th>
                </tr>
              </thead>
              <tbody>
                {productReport.map((item: any) => (
                  <tr key={item.productId} className="border-b">
                    <td className="px-4 py-3 font-medium">{item.productName}</td>
                    <td className="px-4 py-3 text-right">
                      {item.quantitySold?.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(item.pointsRevenue ?? 0).toLocaleString('pt-BR')} pts
                    </td>
                    <td className="px-4 py-3 text-right">
                      R$ {(item.moneyRevenue ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Method Breakdown */}
      {report?.byPaymentMethod && report.byPaymentMethod.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Por Metodo de Pagamento</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Metodo</th>
                  <th className="px-4 py-3 text-right font-medium">Pedidos</th>
                  <th className="px-4 py-3 text-right font-medium">Pontos</th>
                  <th className="px-4 py-3 text-right font-medium">R$</th>
                </tr>
              </thead>
              <tbody>
                {report.byPaymentMethod.map((item: any) => (
                  <tr key={item.method} className="border-b">
                    <td className="px-4 py-3 font-medium">{item.method}</td>
                    <td className="px-4 py-3 text-right">{item.count}</td>
                    <td className="px-4 py-3 text-right">
                      {(item.totalPoints ?? 0).toLocaleString('pt-BR')} pts
                    </td>
                    <td className="px-4 py-3 text-right">
                      R$ {(item.totalMoney ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
