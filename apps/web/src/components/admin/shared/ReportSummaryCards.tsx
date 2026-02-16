'use client';

interface SummaryCardItem {
  label: string;
  value: string;
  subValue?: string;
}

interface ReportSummaryCardsProps {
  items: SummaryCardItem[];
  columns?: 2 | 3 | 4 | 5;
}

export function ReportSummaryCards({
  items,
  columns = 4,
}: ReportSummaryCardsProps) {
  const gridClass =
    columns === 2
      ? 'grid-cols-2'
      : columns === 3
        ? 'grid-cols-2 lg:grid-cols-3'
        : columns === 5
          ? 'grid-cols-2 lg:grid-cols-5'
          : 'grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border bg-surface p-4"
        >
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-lg font-bold">{item.value}</p>
          {item.subValue && (
            <p className="text-xs text-muted-foreground">{item.subValue}</p>
          )}
        </div>
      ))}
    </div>
  );
}
