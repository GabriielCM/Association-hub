'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Coins, TrendingUp, TrendingDown, Users } from 'lucide-react';

import { Button } from '@/components/ui';
import { usePointsReports } from '@/lib/hooks/useAdminPoints';
import { formatPoints } from '@ahub/shared/utils';

export default function PointsOverviewPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const { data: report, isLoading } = usePointsReports(period);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sistema de Pontos</h1>
          <p className="text-muted-foreground">Visao geral e gestao de pontos</p>
        </div>
        <div className="flex gap-2">
          <Link href="/points/config">
            <Button variant="outline">Configuracao</Button>
          </Link>
          <Link href="/points/reports">
            <Button variant="outline">Relatorios</Button>
          </Link>
        </div>
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

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : report ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Em Circulacao"
            value={formatPoints(report.summary.totalInCirculation)}
            subtitle="pts"
            icon={<Coins className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="Total Ganho"
            value={formatPoints(report.summary.totalEarned)}
            subtitle="no periodo"
            icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          />
          <StatCard
            title="Total Gasto"
            value={formatPoints(report.summary.totalSpent)}
            subtitle="no periodo"
            icon={<TrendingDown className="h-5 w-5 text-red-500" />}
          />
          <StatCard
            title="Usuarios Ativos"
            value={report.summary.totalUsersWithBalance.toString()}
            subtitle="com saldo"
            icon={<Users className="h-5 w-5 text-blue-500" />}
          />
        </div>
      ) : null}

      {/* Top Earners */}
      {report?.topEarners && report.topEarners.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Top Ganhadores</h2>
          <div className="space-y-3">
            {report.topEarners.map((earner, i) => (
              <div
                key={earner.id}
                className="flex items-center justify-between border-b border-border pb-2 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="font-medium">{earner.name}</span>
                </div>
                <span className="font-semibold text-primary">
                  {formatPoints(earner.earned)} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Source breakdown */}
      {report?.bySource && report.bySource.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Por Origem</h2>
          <div className="space-y-2">
            {report.bySource.map((item) => (
              <div key={item.source} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.source}</span>
                <div className="flex gap-4">
                  <span className="text-sm">{item.count} transacoes</span>
                  <span className="text-sm font-semibold">{formatPoints(item.total)} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon}
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className="ml-1 text-sm text-muted-foreground">{subtitle}</span>
      </div>
    </div>
  );
}
