'use client';

import { Badge } from '@/components/ui';
import type { BookingStatus } from '@/lib/api/bookings.api';

const statusConfig: Record<
  BookingStatus,
  { label: string; variant: 'warning' | 'success' | 'error' | 'ghost' | 'info' }
> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  APPROVED: { label: 'Aprovada', variant: 'success' },
  REJECTED: { label: 'Rejeitada', variant: 'error' },
  CANCELLED: { label: 'Cancelada', variant: 'ghost' },
  EXPIRED: { label: 'Expirada', variant: 'ghost' },
  COMPLETED: { label: 'Concluída', variant: 'info' },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = statusConfig[status] ?? statusConfig.PENDING;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
