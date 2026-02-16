'use client';

import { Package, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import type { OrdersSummaryCounters } from '@ahub/shared/types';

interface OrdersSummaryCardsProps {
  counters: OrdersSummaryCounters;
}

function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2)}`;
}

export function OrdersSummaryCards({ counters }: OrdersSummaryCardsProps) {
  const cards = [
    {
      label: 'Pendentes',
      value: counters.pending,
      icon: Package,
      colorClass: 'text-amber-600',
    },
    {
      label: 'Prontos',
      value: counters.ready,
      icon: CheckCircle,
      colorClass: 'text-green-600',
    },
    {
      label: 'Cancelados',
      value: counters.cancelled,
      icon: XCircle,
      colorClass: 'text-red-600',
    },
    {
      label: 'Receita Total',
      value: formatCurrency(counters.totalRevenueMoney),
      icon: DollarSign,
      colorClass: 'text-primary',
      subValue: `${counters.totalRevenuePoints} pts`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <Icon className={`h-4 w-4 ${card.colorClass}`} />
            </div>
            <p className={`mt-1 text-lg font-bold ${card.colorClass}`}>
              {card.value}
            </p>
            {card.subValue && (
              <p className="text-xs text-muted-foreground">{card.subValue}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
