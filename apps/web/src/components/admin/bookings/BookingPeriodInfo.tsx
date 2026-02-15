'use client';

import type { BookingPeriodType } from '@/lib/api/spaces.api';

interface BookingPeriodInfoProps {
  periodType: BookingPeriodType;
  shiftName?: string;
  shiftStart?: string;
  shiftEnd?: string;
  startTime?: string;
  endTime?: string;
}

export function BookingPeriodInfo({
  periodType,
  shiftName,
  shiftStart,
  shiftEnd,
  startTime,
  endTime,
}: BookingPeriodInfoProps) {
  if (periodType === 'DAY') {
    return <span className="text-sm">Diária</span>;
  }

  if (periodType === 'SHIFT' && shiftName) {
    const timeRange = shiftStart && shiftEnd ? ` (${shiftStart}-${shiftEnd})` : '';
    return (
      <span className="text-sm">
        Turno: {shiftName}{timeRange}
      </span>
    );
  }

  if (periodType === 'HOUR' && startTime && endTime) {
    return <span className="text-sm">{startTime} - {endTime}</span>;
  }

  return <span className="text-sm text-muted-foreground">-</span>;
}
