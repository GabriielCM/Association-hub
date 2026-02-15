import { Badge } from '@ahub/ui';
import type { OrderStatus } from '@ahub/shared/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: 'warning' | 'info' | 'primary' | 'success' | 'error' }> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  CONFIRMED: { label: 'Confirmado', variant: 'info' },
  READY: { label: 'Pronto', variant: 'primary' },
  COMPLETED: { label: 'Concluido', variant: 'success' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}
