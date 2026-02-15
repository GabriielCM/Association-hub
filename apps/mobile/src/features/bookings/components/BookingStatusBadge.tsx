import { Badge } from '@ahub/ui';
import type { BookingStatus } from '@ahub/shared/types';

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; variant: 'warning' | 'success' | 'error' | 'info' | 'primary' }
> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  APPROVED: { label: 'Aprovada', variant: 'success' },
  REJECTED: { label: 'Rejeitada', variant: 'error' },
  CANCELLED: { label: 'Cancelada', variant: 'error' },
  EXPIRED: { label: 'Expirada', variant: 'primary' },
  COMPLETED: { label: 'Concluída', variant: 'info' },
};

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}
