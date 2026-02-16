'use client';

import type { SalesReportByPeriod } from '@ahub/shared/types';

interface SalesChartProps {
  data: SalesReportByPeriod[];
  showMoney?: boolean;
}

/** Simple bar chart using CSS for sales data - no external chart library needed */
export function SalesChart({ data, showMoney = true }: SalesChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sem dados no periodo selecionado
      </div>
    );
  }

  const maxPoints = Math.max(...data.map((d) => d.pointsRevenue), 1);
  const maxMoney = showMoney
    ? Math.max(...data.map((d) => d.moneyRevenue), 1)
    : 0;
  const maxValue = Math.max(maxPoints, maxMoney, 1);

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="mb-4 text-lg font-semibold">Vendas por Periodo</h2>
      <div className="flex items-end gap-1 overflow-x-auto" style={{ minHeight: 200 }}>
        {data.map((item) => {
          const pointsHeight = (item.pointsRevenue / maxValue) * 160;
          const moneyHeight = showMoney
            ? (item.moneyRevenue / maxValue) * 160
            : 0;

          return (
            <div
              key={item.date}
              className="flex flex-1 flex-col items-center gap-1"
              style={{ minWidth: 32 }}
            >
              <div className="flex items-end gap-0.5" style={{ height: 160 }}>
                <div
                  className="w-3 rounded-t bg-primary/80"
                  style={{ height: Math.max(pointsHeight, 2) }}
                  title={`${item.pointsRevenue.toLocaleString('pt-BR')} pts`}
                />
                {showMoney && (
                  <div
                    className="w-3 rounded-t bg-emerald-500/80"
                    style={{ height: Math.max(moneyHeight, 2) }}
                    title={`R$ ${item.moneyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  />
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {formatChartDate(item.date)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded bg-primary/80" />
          Pontos
        </div>
        {showMoney && (
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded bg-emerald-500/80" />
            Dinheiro (R$)
          </div>
        )}
      </div>
    </div>
  );
}

function formatChartDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
}
