'use client';

import type { ReportPeriod } from '@ahub/shared/types';

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  today: 'Hoje',
  week: 'Semana',
  month: 'Mes',
  year: 'Ano',
};

interface PeriodSelectorProps {
  value: ReportPeriod;
  onChange: (period: ReportPeriod) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2">
      {(Object.keys(PERIOD_LABELS) as ReportPeriod[]).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === p
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}
