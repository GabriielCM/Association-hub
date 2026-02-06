'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

import { Button } from '@/components/ui';
import { usePointsReports } from '@/lib/hooks/useAdminPoints';
import { exportCsv } from '@/lib/api/points.api';
import { formatPoints } from '@ahub/shared/utils';

export default function PointsReportsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const { data: report, isLoading } = usePointsReports(period);

  const handleExport = async () => {
    if (!report) return;
    try {
      const blob = await exportCsv(report.startDate, report.endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pontos-${report.startDate}-${report.endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatorios de Pontos</h1>
          <p className="text-muted-foreground">Analise detalhada do sistema de pontos</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={!report}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {(['today', 'week', 'month', 'year'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              period === p
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Ano'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-40 rounded-lg bg-muted" />
          <div className="h-60 rounded-lg bg-muted" />
        </div>
      ) : report ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <SummaryCard label="Em Circulacao" value={`${formatPoints(report.summary.totalInCirculation)} pts`} />
            <SummaryCard label="Total Ganho" value={`${formatPoints(report.summary.totalEarned)} pts`} />
            <SummaryCard label="Total Gasto" value={`${formatPoints(report.summary.totalSpent)} pts`} />
            <SummaryCard label="Transacoes" value={report.summary.totalTransactions.toString()} />
            <SummaryCard label="Usuarios com Saldo" value={report.summary.totalUsersWithBalance.toString()} />
          </div>

          {/* By Source */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold">Pontos por Origem</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">Origem</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Transacoes</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {report.bySource.map((item) => (
                    <tr key={item.source} className="border-b border-border/50">
                      <td className="py-2">{item.source}</td>
                      <td className="py-2 text-right text-muted-foreground">{item.count}</td>
                      <td className="py-2 text-right font-semibold">{formatPoints(item.total)} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* By Destination */}
          {report.byDestination.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="mb-4 text-lg font-semibold">Pontos por Destino</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">Destino</th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">Transacoes</th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byDestination.map((item) => (
                      <tr key={item.destination} className="border-b border-border/50">
                        <td className="py-2">{item.destination}</td>
                        <td className="py-2 text-right text-muted-foreground">{item.count}</td>
                        <td className="py-2 text-right font-semibold">{formatPoints(item.total)} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Earners */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold">Top Ganhadores</h2>
            <div className="space-y-2">
              {report.topEarners.map((earner, i) => (
                <div key={earner.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span>{earner.name}</span>
                  </div>
                  <span className="font-semibold">{formatPoints(earner.earned)} pts</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
