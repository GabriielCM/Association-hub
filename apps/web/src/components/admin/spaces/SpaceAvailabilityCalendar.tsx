'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { useSpaceAvailability } from '@/lib/hooks/useAdminSpaces';

interface SpaceAvailabilityCalendarProps {
  spaceId: string;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    startDate: formatISO(start),
    endDate: formatISO(end),
  };
}

function formatISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function SpaceAvailabilityCalendar({
  spaceId,
}: SpaceAvailabilityCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const { startDate, endDate } = getMonthRange(year, month);
  const { data: availability, isLoading } = useSpaceAvailability(
    spaceId,
    startDate,
    endDate,
  );

  const monthLabel = new Date(year, month).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  // Build availability lookup
  const availMap = new Map<string, { available: boolean; reason?: string }>();
  if (availability) {
    for (const day of availability) {
      availMap.set(day.date, { available: day.available, ...(day.reason != null && { reason: day.reason }) });
    }
  }

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = formatISO(today);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getCellClass = (day: number): string => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateStr < todayStr) return 'bg-muted/30 text-muted-foreground';

    const info = availMap.get(dateStr);
    if (!info) return 'bg-muted/10';

    if (info.available) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    if (info.reason === 'blocked' || info.reason === 'maintenance')
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
  };

  const getTooltip = (day: number): string => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateStr < todayStr) return 'Passado';
    const info = availMap.get(dateStr);
    if (!info) return '';
    if (info.available) return 'Disponível';
    switch (info.reason) {
      case 'blocked': return 'Bloqueado';
      case 'maintenance': return 'Manutenção';
      case 'booked': return 'Reservado';
      case 'past': return 'Passado';
      case 'outside_advance': return 'Fora do prazo';
      default: return 'Indisponível';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Disponibilidade</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-medium capitalize">
            {monthLabel}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-green-100 dark:bg-green-900/30 border" /> Disponível
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-red-100 dark:bg-red-900/30 border" /> Reservado
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-yellow-100 dark:bg-yellow-900/30 border" /> Bloqueado
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded bg-muted/30 border" /> Passado
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-lg border">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="px-1 py-2 text-center text-xs font-medium text-muted-foreground">
                {wd}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => (
              <div
                key={i}
                className={`flex h-10 items-center justify-center border-b border-r text-sm ${
                  day ? getCellClass(day) : ''
                }`}
                title={day ? getTooltip(day) : undefined}
              >
                {day ?? ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
