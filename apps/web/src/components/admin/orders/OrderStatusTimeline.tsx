'use client';

import { CheckCircle, Circle } from 'lucide-react';

interface TimelineEntry {
  status: string;
  label: string;
  description?: string;
  createdAt: string;
}

interface OrderStatusTimelineProps {
  timeline: TimelineEntry[];
}

const completedStatuses = new Set(['PENDING', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED']);

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderStatusTimeline({ timeline }: OrderStatusTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum historico de status disponivel.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      {timeline.map((entry, index) => {
        const isLast = index === timeline.length - 1;
        const isCompleted = completedStatuses.has(entry.status);

        return (
          <div key={`${entry.status}-${index}`} className="relative flex gap-3 pb-6">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[11px] top-6 h-full w-0.5 bg-border" />
            )}

            {/* Circle icon */}
            <div className="relative z-10 flex-shrink-0">
              {isCompleted ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium">{entry.label}</p>
              {entry.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {entry.description}
                </p>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDate(entry.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
