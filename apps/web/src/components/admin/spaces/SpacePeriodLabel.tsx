'use client';

import { Badge } from '@/components/ui';
import type { BookingPeriodType } from '@/lib/api/spaces.api';

const periodConfig: Record<BookingPeriodType, { label: string; variant: 'secondary' | 'info' | 'primary' }> = {
  DAY: { label: 'Diária', variant: 'secondary' },
  SHIFT: { label: 'Turnos', variant: 'info' },
  HOUR: { label: 'Horário', variant: 'primary' },
};

export function SpacePeriodLabel({ type }: { type: BookingPeriodType }) {
  const config = periodConfig[type] ?? periodConfig.DAY;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
