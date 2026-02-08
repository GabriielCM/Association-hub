'use client';

import { Badge } from '@/components/ui';
import type { EventStatus } from '@ahub/shared/types';

interface EventStatusBadgeProps {
  status: EventStatus;
}

const statusConfig: Record<
  EventStatus,
  { label: string; variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'ghost' }
> = {
  DRAFT: { label: 'Rascunho', variant: 'ghost' },
  SCHEDULED: { label: 'Agendado', variant: 'info' },
  ONGOING: { label: 'Em andamento', variant: 'success' },
  ENDED: { label: 'Encerrado', variant: 'outline' },
  CANCELED: { label: 'Cancelado', variant: 'error' },
};

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    variant: 'outline' as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
